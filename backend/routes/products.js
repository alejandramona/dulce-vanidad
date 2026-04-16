const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');
const { cacheGet, cacheSet, cacheDel } = require('../config/cache');

const PRODUCTS_KEY = 'products:all';
const CATEGORIES_KEY = 'products:categories';

router.get('/', async (req, res) => {
  try {
    const { category, search } = req.query;
    if (!category && !search) {
      const cached = cacheGet(PRODUCTS_KEY);
      if (cached) return res.json(cached);
    }
    const filter = { active: true };
    if (category) filter.category = { $regex: category, $options: 'i' };
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    const products = await Product.find(filter).sort({ createdAt: -1 }).lean();
    // Solo primera imagen en listado para no reventar la memoria
    const lightweight = products.map(p => ({ ...p, images: p.images?.slice(0, 1) || [] }));
    if (!category && !search) cacheSet(PRODUCTS_KEY, lightweight);
    res.json(lightweight);
  } catch (error) {
    const stale = cacheGet(PRODUCTS_KEY);
    if (stale) return res.json(stale);
    res.status(500).json({ message: error.message });
  }
});

router.get('/categories', async (req, res) => {
  try {
    const cached = cacheGet(CATEGORIES_KEY);
    if (cached) return res.json(cached);
    const categories = await Product.distinct('category', { active: true });
    cacheSet(CATEGORIES_KEY, categories.sort());
    res.json(categories.sort());
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

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

router.post('/', protect, async (req, res) => {
  try {
    const product = await Product.create(req.body);
    cacheDel(PRODUCTS_KEY);
    cacheDel(CATEGORIES_KEY);
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put('/:id', protect, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!product) return res.status(404).json({ message: 'Producto no encontrado' });
    cacheDel(PRODUCTS_KEY);
    cacheDel(`product:${req.params.id}`);
    res.json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.patch('/:id/stock', protect, async (req, res) => {
  try {
    const { stock } = req.body;
    const product = await Product.findByIdAndUpdate(req.params.id, { stock }, { new: true });
    if (!product) return res.status(404).json({ message: 'Producto no encontrado' });
    cacheDel(PRODUCTS_KEY);
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: 'Producto no encontrado' });
    cacheDel(PRODUCTS_KEY);
    cacheDel(CATEGORIES_KEY);
    cacheDel(`product:${req.params.id}`);
    res.json({ message: 'Eliminado' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
