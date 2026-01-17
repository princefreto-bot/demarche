/**
 * Layout Dashboard - ImmoLomé
 * Wrapper pour les pages utilisateur/owner/admin
 */

import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import {
  XMarkIcon,
  Bars3Icon,
  HomeIcon,
  BuildingOfficeIcon,
  ClipboardDocumentListIcon,
  CreditCardIcon,
  UserCircleIcon,
  UsersIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  PlusCircleIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';
import clsx from 'clsx';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';

// Navigation utilisateur standard
const userNavigation = [
  { name: 'Tableau de bord', href: '/dashboard', icon: HomeIcon },
  { name: 'Mes demandes', href: '/dashboard/contacts', icon: ClipboardDocumentListIcon },
  { name: 'Mes paiements', href: '/dashboard/payments', icon: CreditCardIcon },
  { name: 'Mon profil', href: '/dashboard/profile', icon: UserCircleIcon },
];

// Navigation propriétaire
const ownerNavigation = [
  { name: 'Tableau de bord', href: '/owner', icon: HomeIcon },
  { name: 'Mes chambres', href: '/owner/rooms', icon: BuildingOfficeIcon },
  { name: 'Ajouter une chambre', href: '/owner/rooms/new', icon: PlusCircleIcon },
  { name: 'Mon profil', href: '/dashboard/profile', icon: UserCircleIcon },
];

// Navigation admin
const adminNavigation = [
  { name: 'Dashboard', href: '/admin', icon: ChartBarIcon },
  { name: 'Chambres', href: '/admin/rooms', icon: BuildingOfficeIcon },
  { name: 'Utilisateurs', href: '/admin/users', icon: UsersIcon },
  { name: 'Demandes', href: '/admin/contacts', icon: ClipboardDocumentListIcon },
  { name: 'Paiements', href: '/admin/payments', icon: CreditCardIcon },
  { name: 'Logs', href: '/admin/logs', icon: DocumentTextIcon },
];

export default function DashboardLayout({ isAdmin = false }) {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { isSidebarOpen, toggleSidebar } = useUIStore();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  // Sélectionner la navigation appropriée
  const getNavigation = () => {
    if (isAdmin || user?.role === 'admin') return adminNavigation;
    if (user?.role === 'owner') return ownerNavigation;
    return userNavigation;
  };

  const navigation = getNavigation();

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-2 px-6 py-5 border-b border-gray-100">
        <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-secondary-500 rounded-xl flex items-center justify-center">
          <span className="text-white font-bold text-lg">🏠</span>
        </div>
        <span className="text-xl font-bold text-gray-900">
          Immo<span className="text-primary-600">Lomé</span>
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            end={item.href === '/dashboard' || item.href === '/owner' || item.href === '/admin'}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all',
                isActive
                  ? 'bg-primary-50 text-primary-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )
            }
          >
            <item.icon className="w-5 h-5" />
            {item.name}
          </NavLink>
        ))}
      </nav>

      {/* User Info & Logout */}
      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center gap-3 mb-4 px-2">
          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
            <span className="text-primary-600 font-semibold">
              {user?.firstName?.charAt(0) || 'U'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
          </div>
        </div>
        
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
        >
          <ArrowRightOnRectangleIcon className="w-5 h-5" />
          Déconnexion
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Sidebar */}
      <Transition show={isSidebarOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50 lg:hidden" onClose={toggleSidebar}>
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/50" />
          </Transition.Child>

          <div className="fixed inset-0 flex">
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <Dialog.Panel className="relative flex w-full max-w-xs flex-1 bg-white">
                <div className="absolute top-0 right-0 -mr-12 pt-4">
                  <button
                    type="button"
                    onClick={toggleSidebar}
                    className="ml-1 flex h-10 w-10 items-center justify-center rounded-full text-white"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>
                <SidebarContent />
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>

      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-40 lg:flex lg:w-72 lg:flex-col">
        <div className="flex grow flex-col bg-white border-r border-gray-100">
          <SidebarContent />
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:pl-72">
        {/* Top bar mobile */}
        <div className="sticky top-0 z-30 flex h-16 items-center gap-4 bg-white border-b border-gray-100 px-4 lg:hidden">
          <button
            type="button"
            onClick={toggleSidebar}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
          <span className="text-lg font-semibold text-gray-900">ImmoLomé</span>
        </div>

        {/* Page Content */}
        <main className="p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
