const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  image: { type: String, default: '' },
}, { _id: false });

const orderSchema = new mongoose.Schema({
  customerName: { type: String, required: [true, 'Nombre requerido'], trim: true },
  customerPhone: { type: String, required: [true, 'Teléfono requerido'], trim: true },
  customerEmail: { type: String, default: '' },
  customerAddress: { type: String, default: '' },
  customerNotes: { type: String, default: '' },
  items: {
    type: [orderItemSchema],
    validate: { validator: (v) => v.length > 0, message: 'Mínimo un producto' },
  },
  subtotal: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  total: { type: Number, required: true },
  couponCode: { type: String, default: null },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'preparing', 'delivered', 'cancelled'],
    default: 'pending',
  },
  paymentMethod: {
    type: String,
    enum: ['whatsapp', 'cash', 'transfer', 'other'],
    default: 'whatsapp',
  },
  orderNumber: { type: String, unique: true },
}, { timestamps: true });

// Índices para evitar el error "Sort exceeded memory limit"
orderSchema.index({ createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });

orderSchema.pre('save', async function (next) {
  if (!this.orderNumber) {
    const count = await mongoose.model('Order').countDocuments();
    this.orderNumber = `ORD-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

orderSchema.set('toJSON', {
  transform: (_, ret) => { delete ret.__v; return ret; }
});

module.exports = mongoose.model('Order', orderSchema);