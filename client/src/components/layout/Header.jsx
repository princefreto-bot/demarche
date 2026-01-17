/**
 * Composant Header - ImmoLomé
 * Navigation principale
 */

import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu, Transition } from '@headlessui/react';
import {
  Bars3Icon,
  XMarkIcon,
  UserCircleIcon,
  HomeIcon,
  BuildingOfficeIcon,
  PhoneIcon,
  ArrowRightOnRectangleIcon,
  Cog6ToothIcon,
  ClipboardDocumentListIcon,
  CreditCardIcon,
} from '@heroicons/react/24/outline';
import clsx from 'clsx';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import Button from '@/components/ui/Button';

const navigation = [
  { name: 'Accueil', href: '/', icon: HomeIcon },
  { name: 'Chambres', href: '/chambres', icon: BuildingOfficeIcon },
  { name: 'Contact', href: '/contact', icon: PhoneIcon },
];

export default function Header() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { isMobileMenuOpen, toggleMobileMenu, closeMobileMenu } = useUIStore();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const getDashboardLink = () => {
    if (!user) return '/dashboard';
    if (user.role === 'admin') return '/admin';
    if (user.role === 'owner') return '/owner';
    return '/dashboard';
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-100">
      <div className="container-custom">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-secondary-500 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">🏠</span>
            </div>
            <span className="text-xl font-bold text-gray-900">
              Immo<span className="text-primary-600">Lomé</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  clsx(
                    'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'text-primary-600 bg-primary-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  )
                }
              >
                {item.name}
              </NavLink>
            ))}
          </nav>

          {/* Desktop Right Section */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <Menu as="div" className="relative">
                <Menu.Button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-primary-600 font-medium text-sm">
                      {user?.firstName?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {user?.firstName || 'Utilisateur'}
                  </span>
                </Menu.Button>

                <Transition
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 focus:outline-none">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">{user?.fullName}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>

                    <Menu.Item>
                      {({ active }) => (
                        <Link
                          to={getDashboardLink()}
                          className={clsx(
                            'flex items-center gap-2 px-4 py-2 text-sm',
                            active ? 'bg-gray-50 text-gray-900' : 'text-gray-700'
                          )}
                        >
                          <Cog6ToothIcon className="w-4 h-4" />
                          Tableau de bord
                        </Link>
                      )}
                    </Menu.Item>

                    <Menu.Item>
                      {({ active }) => (
                        <Link
                          to="/dashboard/contacts"
                          className={clsx(
                            'flex items-center gap-2 px-4 py-2 text-sm',
                            active ? 'bg-gray-50 text-gray-900' : 'text-gray-700'
                          )}
                        >
                          <ClipboardDocumentListIcon className="w-4 h-4" />
                          Mes demandes
                        </Link>
                      )}
                    </Menu.Item>

                    <Menu.Item>
                      {({ active }) => (
                        <Link
                          to="/dashboard/payments"
                          className={clsx(
                            'flex items-center gap-2 px-4 py-2 text-sm',
                            active ? 'bg-gray-50 text-gray-900' : 'text-gray-700'
                          )}
                        >
                          <CreditCardIcon className="w-4 h-4" />
                          Paiements
                        </Link>
                      )}
                    </Menu.Item>

                    <div className="border-t border-gray-100 mt-2 pt-2">
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={handleLogout}
                            className={clsx(
                              'flex items-center gap-2 px-4 py-2 text-sm w-full text-left',
                              active ? 'bg-red-50 text-red-600' : 'text-gray-700'
                            )}
                          >
                            <ArrowRightOnRectangleIcon className="w-4 h-4" />
                            Déconnexion
                          </button>
                        )}
                      </Menu.Item>
                    </div>
                  </Menu.Items>
                </Transition>
              </Menu>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost">Connexion</Button>
                </Link>
                <Link to="/register">
                  <Button>S'inscrire</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={toggleMobileMenu}
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
          >
            {isMobileMenuOpen ? (
              <XMarkIcon className="w-6 h-6" />
            ) : (
              <Bars3Icon className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <Transition
        show={isMobileMenuOpen}
        enter="transition ease-out duration-200"
        enterFrom="opacity-0 -translate-y-2"
        enterTo="opacity-100 translate-y-0"
        leave="transition ease-in duration-150"
        leaveFrom="opacity-100 translate-y-0"
        leaveTo="opacity-0 -translate-y-2"
      >
        <div className="md:hidden bg-white border-t border-gray-100 py-4">
          <div className="container-custom space-y-2">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                onClick={closeMobileMenu}
                className={({ isActive }) =>
                  clsx(
                    'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium',
                    isActive
                      ? 'text-primary-600 bg-primary-50'
                      : 'text-gray-600 hover:bg-gray-50'
                  )
                }
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </NavLink>
            ))}

            <div className="border-t border-gray-100 pt-4 mt-4">
              {isAuthenticated ? (
                <>
                  <Link
                    to={getDashboardLink()}
                    onClick={closeMobileMenu}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50"
                  >
                    <UserCircleIcon className="w-5 h-5" />
                    Mon compte
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      closeMobileMenu();
                    }}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 w-full"
                  >
                    <ArrowRightOnRectangleIcon className="w-5 h-5" />
                    Déconnexion
                  </button>
                </>
              ) : (
                <div className="flex gap-3 px-4">
                  <Link to="/login" onClick={closeMobileMenu} className="flex-1">
                    <Button variant="outline" fullWidth>
                      Connexion
                    </Button>
                  </Link>
                  <Link to="/register" onClick={closeMobileMenu} className="flex-1">
                    <Button fullWidth>S'inscrire</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </Transition>
    </header>
  );
}
