/**
 * Page Inscription - ImmoLomé
 */

import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  LockClosedIcon,
} from '@heroicons/react/24/outline';
import { useAuthStore } from '@/store/authStore';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import clsx from 'clsx';

// Schéma de validation
const registerSchema = z.object({
  firstName: z.string().min(2, 'Minimum 2 caractères'),
  lastName: z.string().min(2, 'Minimum 2 caractères'),
  email: z.string().email('Email invalide'),
  phone: z.string().regex(/^(\+228)?[79]\d{7}$/, 'Numéro togolais invalide'),
  password: z
    .string()
    .min(8, 'Minimum 8 caractères')
    .regex(/[A-Z]/, 'Une majuscule requise')
    .regex(/[a-z]/, 'Une minuscule requise')
    .regex(/\d/, 'Un chiffre requis'),
  confirmPassword: z.string(),
  role: z.enum(['user', 'owner']),
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: 'Vous devez accepter les conditions',
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
});

export default function RegisterPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { register: registerUser, isLoading } = useAuthStore();
  
  const defaultRole = searchParams.get('role') === 'owner' ? 'owner' : 'user';

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      role: defaultRole,
      acceptTerms: false,
    },
  });

  const selectedRole = watch('role');

  const onSubmit = async (data) => {
    const { confirmPassword, acceptTerms, ...registerData } = data;
    
    const result = await registerUser(registerData);
    
    if (result.success) {
      toast.success('Inscription réussie !');
      navigate('/dashboard', { replace: true });
    } else {
      toast.error(result.error || 'Erreur lors de l\'inscription');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center gap-2">
          <div className="w-12 h-12 bg-gradient-to-br from-primary-600 to-secondary-500 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-xl">🏠</span>
          </div>
        </Link>
        
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
          Créer un compte
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Déjà inscrit ?{' '}
          <Link
            to="/login"
            className="font-medium text-primary-600 hover:text-primary-500"
          >
            Se connecter
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="bg-white py-8 px-4 shadow-sm sm:rounded-2xl sm:px-10 border border-gray-100">
          {/* Role Selection */}
          <div className="mb-6">
            <label className="label">Je suis...</label>
            <div className="grid grid-cols-2 gap-4">
              <label
                className={clsx(
                  'flex flex-col items-center p-4 border-2 rounded-xl cursor-pointer transition-all',
                  selectedRole === 'user'
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                )}
              >
                <input
                  type="radio"
                  value="user"
                  className="sr-only"
                  {...register('role')}
                />
                <span className="text-2xl mb-2">🔍</span>
                <span className="font-medium text-gray-900">Chercheur</span>
                <span className="text-xs text-gray-500 mt-1">
                  Je cherche une chambre
                </span>
              </label>
              
              <label
                className={clsx(
                  'flex flex-col items-center p-4 border-2 rounded-xl cursor-pointer transition-all',
                  selectedRole === 'owner'
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                )}
              >
                <input
                  type="radio"
                  value="owner"
                  className="sr-only"
                  {...register('role')}
                />
                <span className="text-2xl mb-2">🏠</span>
                <span className="font-medium text-gray-900">Propriétaire</span>
                <span className="text-xs text-gray-500 mt-1">
                  Je propose des chambres
                </span>
              </label>
            </div>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Prénom"
                icon={UserIcon}
                placeholder="Jean"
                error={errors.firstName?.message}
                {...register('firstName')}
              />
              
              <Input
                label="Nom"
                placeholder="Dupont"
                error={errors.lastName?.message}
                {...register('lastName')}
              />
            </div>

            <Input
              label="Email"
              type="email"
              icon={EnvelopeIcon}
              placeholder="vous@exemple.com"
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              label="Téléphone"
              icon={PhoneIcon}
              placeholder="+228 90 00 00 00"
              hint="Numéro togolais uniquement"
              error={errors.phone?.message}
              {...register('phone')}
            />

            <Input
              label="Mot de passe"
              type="password"
              icon={LockClosedIcon}
              placeholder="••••••••"
              hint="8 caractères min, 1 majuscule, 1 chiffre"
              error={errors.password?.message}
              {...register('password')}
            />

            <Input
              label="Confirmer le mot de passe"
              type="password"
              icon={LockClosedIcon}
              placeholder="••••••••"
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />

            {/* Terms */}
            <div className="flex items-start">
              <input
                id="acceptTerms"
                type="checkbox"
                className="h-4 w-4 mt-0.5 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                {...register('acceptTerms')}
              />
              <label htmlFor="acceptTerms" className="ml-2 text-sm text-gray-600">
                J'accepte les{' '}
                <Link to="/contact" className="text-primary-600 hover:underline">
                  conditions d'utilisation
                </Link>{' '}
                et la{' '}
                <Link to="/contact" className="text-primary-600 hover:underline">
                  politique de confidentialité
                </Link>
              </label>
            </div>
            {errors.acceptTerms && (
              <p className="text-xs text-red-500">{errors.acceptTerms.message}</p>
            )}

            <Button
              type="submit"
              fullWidth
              size="lg"
              loading={isLoading}
            >
              Créer mon compte
            </Button>
          </form>
        </div>

        {/* Back to home */}
        <p className="mt-6 text-center text-sm text-gray-500">
          <Link to="/" className="hover:text-gray-700">
            ← Retour à l'accueil
          </Link>
        </p>
      </div>
    </div>
  );
}
