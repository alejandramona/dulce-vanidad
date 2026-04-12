const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'El nombre es requerido'], trim: true },
  description: { type: String, default: '' },
  price: { type: Number, required: [true, 'El precio es requerido'], min: 0 },
  originalPrice: { type: Number, default: null },
  category: { type: String, required: [true, 'La categoría es requerida'], trim: true },
  images: { type: [String], default: [] },  // array igual que el frontend
  stock: { type: Number, default: 99, min: 0 },
  condition: { type: String, default: 'Nuevo' },
  unit: { type: String, default: 'unidad' },
  soldOut: { type: Boolean, default: false },
  active: { type: Boolean, default: true },
  featured: { type: Boolean, default: false },
  tags: [String],
}, { timestamps: true });

// Índices para evitar el error "Sort exceeded memory limit"
productSchema.index({ createdAt: -1 });
productSchema.index({ active: 1, createdAt: -1 });
productSchema.index({ category: 1, active: 1 });
productSchema.index({ featured: 1, active: 1 });
productSchema.index({ name: 'text', description: 'text', tags: 'text' });

// id virtual para que el frontend reciba "id" además de "_id"
productSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

productSchema.set('toJSON', {
  virtuals: true,
  transform: (_, ret) => {
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('Product', productSchema);