const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');

// GET /api/products — listar todos (público)
router.get('/', async (req, res) => {
  try {
    const { category, active, featured, search } = req.query;
    const filter = {};

    // Público solo ve activos; admin puede ver todos
    if (!req.headers.authorization) {
      filter.active = true;
    } else if (active !== undefined) {
      filter.active = active === 'true';
    }

    if (category) filter.category = { $regex: category, $options: 'i' };
    if (featured) filter.featured = featured === 'true';
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    const products = await Product.find(filter).sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/products/categories — lista de categorías únicas (público)
router.get('/categories', async (req, res) => {
  try {
    const categories = await Product.distinct('category', { active: true });
    res.json(categories.sort());
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/products/:id — detalle de producto (público)
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Producto no encontrado' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/products — crear producto (admin)
router.post('/', protect, async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT /api/products/:id — actualizar producto (admin)
router.put('/:id', protect, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!product) return res.status(404).json({ message: 'Producto no encontrado' });
    res.json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PATCH /api/products/:id/stock — actualizar solo el stock (admin)
router.patch('/:id/stock', protect, async (req, res) => {
  try {
    const { stock } = req.body;
    if (stock === undefined || stock < 0) {
      return res.status(400).json({ message: 'Stock inválido' });
    }
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { stock },
      { new: true }
    );
    if (!product) return res.status(404).json({ message: 'Producto no encontrado' });
    res.json({ id: product._id, name: product.name, stock: product.stock });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/products/:id — eliminar producto (admin)
router.delete('/:id', protect, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: 'Producto no encontrado' });
    res.json({ message: 'Producto eliminado' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
