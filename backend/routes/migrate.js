const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');
const { uploadImage } = require('../config/cloudinary');

// POST /api/migrate/images — migra imágenes base64 existentes a Cloudinary
// Llamar UNA SOLA VEZ desde Postman con el token de admin
router.post('/images', protect, async (req, res) => {
  try {
    const products = await Product.find({});
    let migrated = 0;
    let skipped = 0;
    let errors = 0;
    const results = [];

    for (const product of products) {
      if (!product.images || product.images.length === 0) { skipped++; continue; }

      const hasBase64 = product.images.some(img => img && img.startsWith('data:image'));
      if (!hasBase64) { skipped++; continue; }

      try {
        const newImages = await Promise.all(
          product.images.map(async (img) => {
            if (!img) return null;
            if (img.startsWith('http')) return img; // ya es URL
            return await uploadImage(img); // subir base64 a Cloudinary
          })
        );

        product.images = newImages.filter(Boolean);
        await product.save();
        migrated++;
        results.push({ id: product._id, name: product.name, status: 'migrated', images: product.images });
        console.log(`✅ Migrado: ${product.name}`);
      } catch (err) {
        errors++;
        results.push({ id: product._id, name: product.name, status: 'error', error: err.message });
        console.error(`❌ Error migrando ${product.name}:`, err.message);
      }

      // Pequeña pausa para no saturar Cloudinary
      await new Promise(r => setTimeout(r, 200));
    }

    res.json({
      message: `Migración completada`,
      migrated,
      skipped,
      errors,
      results,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;