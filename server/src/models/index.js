/**
 * Export centralisé des modèles Mongoose - ImmoLomé
 */

const User = require('./User');
const Room = require('./Room');
const Contact = require('./Contact');
const Payment = require('./Payment');
const Log = require('./Log');

module.exports = {
  User,
  Room,
  Contact,
  Payment,
  Log,
};
