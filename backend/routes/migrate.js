const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Sube una imagen a Cloudinary con reintentos
const uploadWithRetry = async (base64, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      // Limpiar el string — remover espacios, saltos de línea
      const clean = base64.trim().replace(/\s/g, '');

      // Validar que sea base64 válido
      if (!clean.startsWith('data:image')) {
        throw new Error(`No es base64 válido: empieza con ${clean.substring(0, 30)}`);
      }

      // Verificar que tenga suficiente datos (mínimo 1000 chars para una imagen real)
      if (clean.length < 1000) {
        throw new Error(`Imagen muy pequeña/corrupta: ${clean.length} chars`);
      }

      const result = await cloudinary.uploader.upload(clean, {
        folder: 'dulce-vanidad',
        resource_type: 'image',
        timeout: 60000,
      });
      return result.secure_url;
    } catch (err) {
      if (i === retries - 1) throw err;
      await new Promise(r => setTimeout(r, 1000 * (i + 1)));
    }
  }
};

// POST /api/migrate/images
router.post('/images', protect, async (req, res) => {
  try {
    const products = await Product.find({});
    let migrated = 0;
    let skipped = 0;
    let corrupted = 0;
    const errors = [];

    for (const product of products) {
      if (!product.images || product.images.length === 0) {
        skipped++;
        continue;
      }

      // Verificar si ya está migrado (todas las imágenes son URLs)
      const allUrls = product.images.every(img => img && img.startsWith('http'));
      if (allUrls) {
        skipped++;
        continue;
      }

      const newImages = [];
      let hasError = false;

      for (const img of product.images) {
        if (!img) continue;

        // Ya es URL de Cloudinary
        if (img.startsWith('http')) {
          newImages.push(img);
          continue;
        }

        // Es base64 — intentar subir
        try {
          const url = await uploadWithRetry(img);
          newImages.push(url);
          console.log(`✅ ${product.name}: imagen subida`);
        } catch (err) {
          console.error(`❌ ${product.name}: ${err.message}`);
          corrupted++;
          hasError = true;
          errors.push({ name: product.name, error: err.message });
          // Poner placeholder para no perder el producto
          newImages.push('');
        }
      }

      // Filtrar imágenes vacías
      product.images = newImages.filter(Boolean);
      await product.save();

      if (!hasError) {
        migrated++;
      }

      // Pausa para no saturar Cloudinary
      await new Promise(r => setTimeout(r, 300));
    }

    res.json({
      message: 'Migración completada',
      migrated,
      skipped,
      corrupted,
      errors: errors.slice(0, 20), // solo primeros 20 errores
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/migrate/check — verificar estado de las imágenes en BD
router.post('/check', protect, async (req, res) => {
  try {
    const products = await Product.find({}).lean();
    const stats = {
      total: products.length,
      withImages: 0,
      withUrls: 0,
      withBase64: 0,
      withCorrupted: 0,
      empty: 0,
    };

    for (const p of products) {
      if (!p.images || p.images.length === 0) { stats.empty++; continue; }
      stats.withImages++;
      for (const img of p.images) {
        if (!img) continue;
        if (img.startsWith('http')) stats.withUrls++;
        else if (img.startsWith('data:image') && img.length > 1000) stats.withBase64++;
        else stats.withCorrupted++;
      }
    }

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;