const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Sube una imagen base64 a Cloudinary y devuelve la URL
const uploadImage = async (base64String, folder = 'dulce-vanidad') => {
  if (!base64String) return null;
  
  // Si ya es una URL (no base64), no subir de nuevo
  if (base64String.startsWith('http')) return base64String;
  
  try {
    const result = await cloudinary.uploader.upload(base64String, {
      folder,
      transformation: [
        { width: 800, height: 800, crop: 'limit' }, // máximo 800x800
        { quality: 'auto:good' },                    // compresión automática
        { fetch_format: 'auto' },                    // webp/avif automático
      ],
    });
    return result.secure_url;
  } catch (error) {
    console.error('Error subiendo imagen a Cloudinary:', error.message);
    throw new Error('Error al subir la imagen');
  }
};

// Eliminar imagen de Cloudinary por URL
const deleteImage = async (url) => {
  if (!url || !url.includes('cloudinary')) return;
  try {
    // Extraer public_id de la URL
    const parts = url.split('/');
    const filename = parts[parts.length - 1].split('.')[0];
    const folder = parts[parts.length - 2];
    const publicId = `${folder}/${filename}`;
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Error eliminando imagen de Cloudinary:', error.message);
  }
};

module.exports = { uploadImage, deleteImage };
