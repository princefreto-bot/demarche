/**
 * Point d'entrée du serveur - ImmoLomé
 * Démarrage de l'application
 */

const app = require('./src/app');
const config = require('./src/config/env');
const { initializeDB } = require('./src/config/database');
const { logger } = require('./src/utils/logger');

// Variables pour la gestion du serveur
let server;

/**
 * Démarrer le serveur
 */
const startServer = async () => {
  try {
    // 1. Initialiser la base de données
    logger.info('Initialisation de la base de données...');
    await initializeDB();

    // 2. Démarrer le serveur HTTP
    server = app.listen(config.port, () => {
      console.log('');
      console.log('═══════════════════════════════════════════════════════════════');
      console.log('');
      console.log('  🏠 ImmoLomé API Server');
      console.log('');
      console.log(`  ✅ Serveur démarré sur le port ${config.port}`);
      console.log(`  📍 URL: http://localhost:${config.port}`);
      console.log(`  🔗 API: http://localhost:${config.port}${config.apiPrefix}`);
      console.log(`  🌍 Environnement: ${config.env}`);
      console.log('');
      console.log('  📚 Endpoints disponibles:');
      console.log(`     GET  ${config.apiPrefix}/health`);
      console.log(`     POST ${config.apiPrefix}/auth/register`);
      console.log(`     POST ${config.apiPrefix}/auth/login`);
      console.log(`     GET  ${config.apiPrefix}/rooms`);
      console.log(`     GET  ${config.apiPrefix}/rooms/:id`);
      console.log('');
      console.log('═══════════════════════════════════════════════════════════════');
      console.log('');
    });

    // Gestion des erreurs du serveur
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        logger.error(`Le port ${config.port} est déjà utilisé`);
        process.exit(1);
      }
      throw error;
    });

  } catch (error) {
    logger.error('Erreur au démarrage du serveur:', error);
    process.exit(1);
  }
};

/**
 * Arrêter le serveur proprement
 */
const gracefulShutdown = async (signal) => {
  logger.info(`${signal} reçu. Arrêt gracieux...`);

  // Arrêter d'accepter de nouvelles connexions
  if (server) {
    server.close(async () => {
      logger.info('Serveur HTTP fermé');

      try {
        // Fermer la connexion à la base de données
        const { disconnectDB } = require('./src/config/database');
        await disconnectDB();
        
        logger.info('Arrêt complet');
        process.exit(0);
      } catch (error) {
        logger.error('Erreur lors de l\'arrêt:', error);
        process.exit(1);
      }
    });

    // Forcer l'arrêt après 10 secondes
    setTimeout(() => {
      logger.error('Arrêt forcé après timeout');
      process.exit(1);
    }, 10000);
  }
};

// Gérer les signaux d'arrêt
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Démarrer le serveur
startServer();

module.exports = { startServer, gracefulShutdown };
