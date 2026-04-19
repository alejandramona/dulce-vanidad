const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');
const { cacheGet, cacheSet, cacheDel } = require('../config/cache');
const { uploadImage, deleteImage } = require('../config/cloudinary');

const PRODUCTS_KEY = 'products:list';
const PRODUCTS_ADMIN_KEY = 'products:admin';
const CATEGORIES_KEY = 'products:categories';

// GET /api/products — público ve activos, admin ve todos
router.get('/', async (req, res) => {
  try {
    const { category, search } = req.query;
    const isAdmin = !!req.headers.authorization;

    // Sin filtros adicionales → intentar caché
    if (!category && !search) {
      const cacheKey = isAdmin ? PRODUCTS_ADMIN_KEY : PRODUCTS_KEY;
      const cached = cacheGet(cacheKey);
      if (cached) return res.json(cached);
    }

    const filter = isAdmin ? {} : { active: true };
    if (category) filter.category = { $regex: category, $options: 'i' };
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const products = await Product.find(filter).sort({ createdAt: -1 }).lean();

    if (!category && !search) {
      const cacheKey = isAdmin ? PRODUCTS_ADMIN_KEY : PRODUCTS_KEY;
      cacheSet(cacheKey, products);
    }

    res.json(products);
  } catch (error) {
    // Fallback a caché si hay error de BD
    const stale = cacheGet(PRODUCTS_KEY);
    if (stale) return res.json(stale);
    res.status(500).json({ message: error.message });
  }
});

// GET /api/products/categories
router.get('/categories', async (req, res) => {
  try {
    const cached = cacheGet(CATEGORIES_KEY);
    if (cached) return res.json(cached);
    const categories = await Product.distinct('category', { active: true });
    cacheSet(CATEGORIES_KEY, categories.sort(), 10 * 60 * 1000);
    res.json(categories.sort());
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/products/:id
router.get('/:id', async (req, res) => {
  try {
    const cached = cacheGet(`product:${req.params.id}`);
    if (cached) return res.json(cached);
    const product = await Product.findById(req.params.id).lean();
    if (!product) return res.status(404).json({ message: 'Producto no encontrado' });
    cacheSet(`product:${req.params.id}`, product, 10 * 60 * 1000);
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/products — crea producto, sube imágenes a Cloudinary
router.post('/', protect, async (req, res) => {
  try {
    const data = { ...req.body };

    if (data.images && Array.isArray(data.images)) {
      data.images = await Promise.all(
        data.images.map(img => uploadImage(img))
      );
      data.images = data.images.filter(Boolean);
    }

    const product = await Product.create(data);
    cacheDel(PRODUCTS_KEY);
    cacheDel(PRODUCTS_ADMIN_KEY);
    cacheDel(CATEGORIES_KEY);
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT /api/products/:id — actualiza producto
router.put('/:id', protect, async (req, res) => {
  try {
    const data = { ...req.body };

    if (data.images && Array.isArray(data.images)) {
      data.images = await Promise.all(
        data.images.map(img => uploadImage(img))
      );
      data.images = data.images.filter(Boolean);
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id, data, { new: true, runValidators: true }
    );
    if (!product) return res.status(404).json({ message: 'Producto no encontrado' });
    cacheDel(PRODUCTS_KEY);
    cacheDel(PRODUCTS_ADMIN_KEY);
    cacheDel(`product:${req.params.id}`);
    res.json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PATCH /:id/stock
router.patch('/:id/stock', protect, async (req, res) => {
  try {
    const { stock } = req.body;
    const product = await Product.findByIdAndUpdate(req.params.id, { stock }, { new: true });
    if (!product) return res.status(404).json({ message: 'Producto no encontrado' });
    cacheDel(PRODUCTS_KEY);
    cacheDel(PRODUCTS_ADMIN_KEY);
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: 'Producto no encontrado' });
    if (product.images) {
      await Promise.all(product.images.map(url => deleteImage(url)));
    }
    cacheDel(PRODUCTS_KEY);
    cacheDel(PRODUCTS_ADMIN_KEY);
    cacheDel(CATEGORIES_KEY);
    cacheDel(`product:${req.params.id}`);
    res.json({ message: 'Eliminado' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;