/**
 * Configuration Cloudinary - ImmoLomé
 * Gestion des uploads d'images HD
 */

const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const config = require('./env');

// Configuration Cloudinary
cloudinary.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret,
  secure: true,
});

/**
 * Storage pour les photos de chambres
 */
const roomStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    // Générer un nom unique
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const publicId = `room-${uniqueSuffix}`;

    return {
      folder: `${config.cloudinary.folder}/rooms`,
      public_id: publicId,
      allowed_formats: config.cloudinary.allowedFormats,
      transformation: [
        { width: 1920, height: 1080, crop: 'limit', quality: 'auto:best' },
        { fetch_format: 'auto' },
      ],
    };
  },
});

/**
 * Storage pour les avatars utilisateurs
 */
const avatarStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const publicId = `avatar-${uniqueSuffix}`;

    return {
      folder: `${config.cloudinary.folder}/avatars`,
      public_id: publicId,
      allowed_formats: config.cloudinary.allowedFormats,
      transformation: [
        { width: 400, height: 400, crop: 'fill', gravity: 'face' },
        { quality: 'auto:good' },
        { fetch_format: 'auto' },
      ],
    };
  },
});

/**
 * Storage pour les documents (carte d'identité propriétaires)
 */
const documentStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const publicId = `doc-${uniqueSuffix}`;

    return {
      folder: `${config.cloudinary.folder}/documents`,
      public_id: publicId,
      allowed_formats: ['jpg', 'jpeg', 'png', 'pdf'],
      resource_type: 'auto',
      transformation: [
        { quality: 'auto:good' },
      ],
    };
  },
});

/**
 * Filtre pour valider les fichiers
 */
const fileFilter = (req, file, cb) => {
  // Vérifier le type MIME
  const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Type de fichier non autorisé: ${file.mimetype}`), false);
  }
};

/**
 * Middleware Multer pour les photos de chambres
 */
const uploadRoomPhotos = multer({
  storage: roomStorage,
  fileFilter: fileFilter,
  limits: {
    fileSize: config.cloudinary.maxFileSize,
    files: config.upload.maxFiles,
  },
});

/**
 * Middleware Multer pour les avatars
 */
const uploadAvatar = multer({
  storage: avatarStorage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB max pour avatar
    files: 1,
  },
});

/**
 * Middleware Multer pour les documents
 */
const uploadDocument = multer({
  storage: documentStorage,
  fileFilter: fileFilter,
  limits: {
    fileSize: config.cloudinary.maxFileSize,
    files: 2, // Recto/verso
  },
});

/**
 * Supprimer une image de Cloudinary
 */
const deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Erreur suppression Cloudinary:', error);
    throw error;
  }
};

/**
 * Supprimer plusieurs images
 */
const deleteImages = async (publicIds) => {
  try {
    const result = await cloudinary.api.delete_resources(publicIds);
    return result;
  } catch (error) {
    console.error('Erreur suppression multiple Cloudinary:', error);
    throw error;
  }
};

/**
 * Optimiser une URL d'image
 */
const getOptimizedUrl = (publicId, options = {}) => {
  const defaultOptions = {
    quality: 'auto',
    fetch_format: 'auto',
    ...options,
  };
  
  return cloudinary.url(publicId, defaultOptions);
};

/**
 * Générer une URL thumbnail
 */
const getThumbnailUrl = (publicId, width = 300, height = 200) => {
  return cloudinary.url(publicId, {
    width,
    height,
    crop: 'fill',
    quality: 'auto',
    fetch_format: 'auto',
  });
};

/**
 * Vérifier si Cloudinary est configuré
 */
const isConfigured = () => {
  return !!(
    config.cloudinary.cloudName &&
    config.cloudinary.apiKey &&
    config.cloudinary.apiSecret &&
    config.cloudinary.cloudName !== 'demo'
  );
};

module.exports = {
  cloudinary,
  uploadRoomPhotos,
  uploadAvatar,
  uploadDocument,
  deleteImage,
  deleteImages,
  getOptimizedUrl,
  getThumbnailUrl,
  isConfigured,
};
