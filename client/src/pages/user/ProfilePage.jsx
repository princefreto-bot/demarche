/**
 * Page Profil Utilisateur - ImmoLomé
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import {
  UserCircleIcon,
  CameraIcon,
  ShieldCheckIcon,
  KeyIcon,
} from '@heroicons/react/24/outline';
import { useAuthStore } from '@/store/authStore';
import authService from '@/services/authService';
import Card, { CardHeader, CardTitle } from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { RoleBadge } from '@/components/ui/Badge';
import { formatDate } from '@/utils/formatters';

// Schémas de validation
const profileSchema = z.object({
  firstName: z.string().min(2, 'Minimum 2 caractères'),
  lastName: z.string().min(2, 'Minimum 2 caractères'),
  phone: z.string().regex(/^(\+228)?[79]\d{7}$/, 'Numéro togolais invalide'),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Mot de passe actuel requis'),
  newPassword: z
    .string()
    .min(8, 'Minimum 8 caractères')
    .regex(/[A-Z]/, 'Une majuscule requise')
    .regex(/\d/, 'Un chiffre requis'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
});

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore();
  const [isUpdating, setIsUpdating] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Formulaire profil
  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors, isDirty },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      phone: user?.phone || '',
    },
  });

  // Formulaire mot de passe
  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    reset: resetPassword,
  } = useForm({
    resolver: zodResolver(passwordSchema),
  });

  const onProfileSubmit = async (data) => {
    setIsUpdating(true);
    try {
      // Appel API pour mettre à jour le profil
      // const response = await userService.updateProfile(data);
      updateUser(data);
      toast.success('Profil mis à jour avec succès');
    } catch (error) {
      toast.error(error.message || 'Erreur lors de la mise à jour');
    } finally {
      setIsUpdating(false);
    }
  };

  const onPasswordSubmit = async (data) => {
    setIsChangingPassword(true);
    try {
      await authService.changePassword(data.currentPassword, data.newPassword);
      toast.success('Mot de passe modifié avec succès');
      setShowPasswordModal(false);
      resetPassword();
    } catch (error) {
      toast.error(error.message || 'Erreur lors du changement de mot de passe');
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mon profil</h1>
        <p className="text-gray-600 mt-1">
          Gérez vos informations personnelles et votre sécurité
        </p>
      </div>

      {/* Photo & Role */}
      <Card>
        <div className="flex items-center gap-6">
          {/* Avatar */}
          <div className="relative">
            <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center">
              {user?.avatar?.url ? (
                <img
                  src={user.avatar.url}
                  alt={user.firstName}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className="text-3xl font-bold text-primary-600">
                  {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                </span>
              )}
            </div>
            <button className="absolute bottom-0 right-0 w-8 h-8 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm hover:bg-gray-50">
              <CameraIcon className="w-4 h-4 text-gray-600" />
            </button>
          </div>

          {/* Info */}
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-gray-900">
              {user?.firstName} {user?.lastName}
            </h2>
            <p className="text-gray-500">{user?.email}</p>
            <div className="flex items-center gap-3 mt-2">
              <RoleBadge role={user?.role} />
              {user?.isEmailVerified && (
                <span className="inline-flex items-center gap-1 text-xs text-green-600">
                  <ShieldCheckIcon className="w-4 h-4" />
                  Email vérifié
                </span>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Profile Form */}
      <Card>
        <CardHeader>
          <CardTitle>Informations personnelles</CardTitle>
        </CardHeader>

        <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Prénom"
              error={profileErrors.firstName?.message}
              {...registerProfile('firstName')}
            />
            <Input
              label="Nom"
              error={profileErrors.lastName?.message}
              {...registerProfile('lastName')}
            />
          </div>

          <Input
            label="Email"
            type="email"
            value={user?.email}
            disabled
            hint="L'email ne peut pas être modifié"
          />

          <Input
            label="Téléphone"
            error={profileErrors.phone?.message}
            {...registerProfile('phone')}
          />

          <div className="flex justify-end">
            <Button
              type="submit"
              loading={isUpdating}
              disabled={!isDirty}
            >
              Enregistrer les modifications
            </Button>
          </div>
        </form>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader>
          <CardTitle>Sécurité</CardTitle>
        </CardHeader>

        <div className="space-y-4">
          {/* Password */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-3">
              <KeyIcon className="w-5 h-5 text-gray-400" />
              <div>
                <div className="font-medium text-gray-900">Mot de passe</div>
                <div className="text-sm text-gray-500">
                  Dernière modification: {user?.passwordChangedAt 
                    ? formatDate(user.passwordChangedAt) 
                    : 'Jamais'}
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPasswordModal(true)}
            >
              Modifier
            </Button>
          </div>

          {/* Sessions */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-3">
              <ShieldCheckIcon className="w-5 h-5 text-gray-400" />
              <div>
                <div className="font-medium text-gray-900">Sessions actives</div>
                <div className="text-sm text-gray-500">
                  Dernière connexion: {user?.lastLoginAt 
                    ? formatDate(user.lastLoginAt) 
                    : '-'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Account Info */}
      <Card>
        <CardHeader>
          <CardTitle>Informations du compte</CardTitle>
        </CardHeader>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Membre depuis</span>
            <p className="font-medium text-gray-900">
              {formatDate(user?.createdAt)}
            </p>
          </div>
          <div>
            <span className="text-gray-500">ID utilisateur</span>
            <p className="font-mono text-gray-900">{user?._id}</p>
          </div>
        </div>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="text-red-600">Zone de danger</CardTitle>
        </CardHeader>
        
        <p className="text-sm text-red-600 mb-4">
          Une fois votre compte désactivé, toutes vos données seront conservées 
          mais vous ne pourrez plus vous connecter.
        </p>
        
        <Button variant="danger" size="sm">
          Désactiver mon compte
        </Button>
      </Card>

      {/* Password Modal */}
      <Modal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        title="Modifier le mot de passe"
        size="sm"
      >
        <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-4">
          <Input
            label="Mot de passe actuel"
            type="password"
            error={passwordErrors.currentPassword?.message}
            {...registerPassword('currentPassword')}
          />

          <Input
            label="Nouveau mot de passe"
            type="password"
            hint="8 caractères min, 1 majuscule, 1 chiffre"
            error={passwordErrors.newPassword?.message}
            {...registerPassword('newPassword')}
          />

          <Input
            label="Confirmer le nouveau mot de passe"
            type="password"
            error={passwordErrors.confirmPassword?.message}
            {...registerPassword('confirmPassword')}
          />

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              fullWidth
              onClick={() => setShowPasswordModal(false)}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              fullWidth
              loading={isChangingPassword}
            >
              Modifier
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
