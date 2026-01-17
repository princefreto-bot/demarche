/**
 * Configuration MongoDB - ImmoLomé
 * Connexion et gestion de la base de données
 */

const mongoose = require('mongoose');
const config = require('./env');

/**
 * Options de connexion Mongoose
 */
const mongooseOptions = {
  ...config.mongodb.options,
  autoIndex: config.env !== 'production', // Désactiver en prod pour performance
};

/**
 * Connexion à MongoDB
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.mongodb.uri, mongooseOptions);

    console.log('═══════════════════════════════════════════════════');
    console.log('🗄️  MongoDB Connecté');
    console.log(`   Host: ${conn.connection.host}`);
    console.log(`   Database: ${conn.connection.name}`);
    console.log(`   Environment: ${config.env}`);
    console.log('═══════════════════════════════════════════════════');

    // Gestion des événements de connexion
    mongoose.connection.on('error', (err) => {
      console.error('❌ Erreur MongoDB:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ MongoDB déconnecté');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('🔄 MongoDB reconnecté');
    });

    // Gestion gracieuse de la fermeture
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('📦 Connexion MongoDB fermée (app terminée)');
      process.exit(0);
    });

    return conn;
  } catch (error) {
    console.error('❌ Erreur de connexion MongoDB:', error.message);
    process.exit(1);
  }
};

/**
 * Déconnexion de MongoDB
 */
const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
    console.log('📦 Connexion MongoDB fermée');
  } catch (error) {
    console.error('❌ Erreur lors de la fermeture:', error.message);
  }
};

/**
 * Vérifier l'état de la connexion
 */
const isConnected = () => {
  return mongoose.connection.readyState === 1;
};

/**
 * Obtenir les statistiques de la base
 */
const getDbStats = async () => {
  if (!isConnected()) {
    throw new Error('Non connecté à MongoDB');
  }
  return mongoose.connection.db.stats();
};

/**
 * Créer l'admin initial si nécessaire
 */
const seedAdmin = async () => {
  const { User } = require('../models');
  
  try {
    const adminExists = await User.findOne({ role: 'admin' });
    
    if (!adminExists) {
      const admin = await User.create({
        firstName: config.admin.firstName,
        lastName: config.admin.lastName,
        email: config.admin.email,
        password: config.admin.password,
        phone: '+22890000000',
        role: 'admin',
        isEmailVerified: true,
        isActive: true,
      });

      console.log('═══════════════════════════════════════════════════');
      console.log('👤 Admin créé avec succès');
      console.log(`   Email: ${admin.email}`);
      console.log('   ⚠️ Changez le mot de passe après première connexion!');
      console.log('═══════════════════════════════════════════════════');
    }
  } catch (error) {
    // Ignorer si admin existe déjà (erreur de duplicat)
    if (error.code !== 11000) {
      console.error('❌ Erreur création admin:', error.message);
    }
  }
};

/**
 * Créer les index nécessaires
 */
const createIndexes = async () => {
  if (config.env === 'production') {
    console.log('⏭️ Création des index ignorée en production');
    return;
  }

  const { User, Room, Contact, Payment, Log } = require('../models');

  try {
    await Promise.all([
      User.createIndexes(),
      Room.createIndexes(),
      Contact.createIndexes(),
      Payment.createIndexes(),
      Log.createIndexes(),
    ]);
    console.log('📇 Index MongoDB créés/vérifiés');
  } catch (error) {
    console.error('❌ Erreur création index:', error.message);
  }
};

/**
 * Initialisation complète de la base de données
 */
const initializeDB = async () => {
  await connectDB();
  await createIndexes();
  await seedAdmin();
};

module.exports = {
  connectDB,
  disconnectDB,
  isConnected,
  getDbStats,
  seedAdmin,
  createIndexes,
  initializeDB,
};
