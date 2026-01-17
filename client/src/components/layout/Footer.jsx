/**
 * Composant Footer - ImmoLomé
 */

import { Link } from 'react-router-dom';
import {
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline';

const footerLinks = {
  navigation: [
    { name: 'Accueil', href: '/' },
    { name: 'Chambres', href: '/chambres' },
    { name: 'Comment ça marche', href: '/#how-it-works' },
    { name: 'Contact', href: '/contact' },
  ],
  legal: [
    // Pages légales à implémenter (Phase 2). En attendant, redirection vers Contact.
    { name: 'Conditions d\'utilisation', href: '/contact' },
    { name: 'Politique de confidentialité', href: '/contact' },
    { name: 'Mentions légales', href: '/contact' },
  ],
  quartiers: [
    'Tokoin', 'Bè', 'Adidogomé', 'Agoè', 'Kégué', 'Nyékonakpoè'
  ],
};

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Main Footer */}
      <div className="container-custom py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">🏠</span>
              </div>
              <span className="text-xl font-bold text-white">
                Immo<span className="text-primary-400">Lomé</span>
              </span>
            </Link>
            <p className="text-sm text-gray-400 mb-6">
              Votre plateforme de confiance pour trouver une chambre à Lomé. 
              Nous facilitons la mise en relation entre locataires et propriétaires.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3">
              <a
                href="tel:+22890000000"
                className="flex items-center gap-3 text-sm hover:text-white transition-colors"
              >
                <PhoneIcon className="w-4 h-4 text-primary-400" />
                +228 90 00 00 00
              </a>
              <a
                href="mailto:contact@immolome.com"
                className="flex items-center gap-3 text-sm hover:text-white transition-colors"
              >
                <EnvelopeIcon className="w-4 h-4 text-primary-400" />
                contact@immolome.com
              </a>
              <div className="flex items-center gap-3 text-sm">
                <MapPinIcon className="w-4 h-4 text-primary-400" />
                Lomé, Togo
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-white font-semibold mb-4">Navigation</h3>
            <ul className="space-y-3">
              {footerLinks.navigation.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-sm hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quartiers populaires */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quartiers populaires</h3>
            <ul className="space-y-3">
              {footerLinks.quartiers.map((quartier) => (
                <li key={quartier}>
                  <Link
                    to={`/chambres?quartier=${quartier}`}
                    className="text-sm hover:text-white transition-colors"
                  >
                    Chambres à {quartier}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-white font-semibold mb-4">Informations légales</h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-sm hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Payment Methods */}
            <div className="mt-6">
              <p className="text-sm text-gray-400 mb-3">Paiement sécurisé par</p>
              <div className="flex items-center gap-3">
                <div className="px-3 py-2 bg-gray-800 rounded-lg">
                  <span className="text-xs font-medium text-white">CinetPay</span>
                </div>
                <div className="px-3 py-2 bg-gray-800 rounded-lg">
                  <span className="text-xs font-medium text-yellow-500">MTN</span>
                </div>
                <div className="px-3 py-2 bg-gray-800 rounded-lg">
                  <span className="text-xs font-medium text-blue-400">Moov</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="container-custom py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500">
              © {currentYear} ImmoLomé. Tous droits réservés.
            </p>
            <p className="text-sm text-gray-500">
              Fait avec ❤️ à Lomé, Togo
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
