const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');

// POST /api/orders — crear pedido (público)
router.post('/', async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { items, customerName, customerPhone, customerEmail,
            customerNotes, subtotal, discount, total, couponCode, paymentMethod } = req.body;

    if (!items || items.length === 0)
      return res.status(400).json({ message: 'El pedido debe tener productos' });

    // verificar stock
    const errors = [];
    for (const item of items) {
      const product = await Product.findById(item.product).session(session);
      if (!product) { errors.push(`Producto ${item.name} no encontrado`); continue; }
      if (product.stock < item.quantity)
        errors.push(`"${product.name}" solo tiene ${product.stock} disponibles`);
    }
    if (errors.length) { await session.abortTransaction(); return res.status(400).json({ message: 'Stock insuficiente', errors }); }

    // descontar stock
    for (const item of items) {
      await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } }, { session });
    }

    const [order] = await Order.create([{
      items, customerName, customerPhone,
      customerEmail: customerEmail || '',
      customerNotes: customerNotes || '',
      subtotal, discount: discount || 0, total,
      couponCode: couponCode || null,
      paymentMethod: paymentMethod || 'whatsapp',
    }], { session });

    await session.commitTransaction();
    res.status(201).json({
      message: 'Pedido creado',
      order: { _id: order._id, orderNumber: order.orderNumber, total: order.total, status: order.status },
    });
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({ message: error.message });
  } finally {
    session.endSession();
  }
});

// GET /api/orders — listar (admin)
router.get('/', protect, async (req, res) => {
  try {
    const { status, page = 1, limit = 50 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [orders, total] = await Promise.all([
      Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      Order.countDocuments(filter),
    ]);
    res.json({ orders, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch (error) { res.status(500).json({ message: error.message }); }
});

// GET /api/orders/stats
router.get('/stats', protect, async (req, res) => {
  try {
    const [totalOrders, pendingOrders, revenueAgg] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ status: 'pending' }),
      Order.aggregate([{ $match: { status: { $nin: ['cancelled'] } } }, { $group: { _id: null, total: { $sum: '$total' } } }]),
    ]);
    res.json({ totalOrders, pendingOrders, totalRevenue: revenueAgg[0]?.total || 0 });
  } catch (error) { res.status(500).json({ message: error.message }); }
});

// GET /api/orders/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Pedido no encontrado' });
    res.json(order);
  } catch (error) { res.status(500).json({ message: error.message }); }
});

// PATCH /api/orders/:id/status
router.patch('/:id/status', protect, async (req, res) => {
  try {
    const { status } = req.body;
    const valid = ['pending', 'confirmed', 'preparing', 'delivered', 'cancelled'];
    if (!valid.includes(status)) return res.status(400).json({ message: 'Estado inválido' });
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Pedido no encontrado' });
    if (status === 'cancelled' && order.status !== 'cancelled') {
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } });
      }
    }
    order.status = status;
    await order.save();
    res.json(order);
  } catch (error) { res.status(500).json({ message: error.message }); }
});

// DELETE /api/orders/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) return res.status(404).json({ message: 'Pedido no encontrado' });
    res.json({ message: 'Eliminado' });
  } catch (error) { res.status(500).json({ message: error.message }); }
});

module.exports = router;
