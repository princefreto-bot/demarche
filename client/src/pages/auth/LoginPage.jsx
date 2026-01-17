/**
 * Page Connexion - ImmoLomé
 */

import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { EnvelopeIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import { useAuthStore } from '@/store/authStore';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

// Schéma de validation
const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Mot de passe requis'),
});

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);

  const from = location.state?.from || '/dashboard';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data) => {
    const result = await login(data.email, data.password);
    
    if (result.success) {
      toast.success('Connexion réussie !');
      navigate(from, { replace: true });
    } else {
      toast.error(result.error || 'Erreur de connexion');
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
          Connexion
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Pas encore de compte ?{' '}
          <Link
            to="/register"
            className="font-medium text-primary-600 hover:text-primary-500"
          >
            S'inscrire
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-sm sm:rounded-2xl sm:px-10 border border-gray-100">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <Input
              label="Adresse email"
              type="email"
              icon={EnvelopeIcon}
              placeholder="vous@exemple.com"
              autoComplete="email"
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              label="Mot de passe"
              type="password"
              icon={LockClosedIcon}
              placeholder="••••••••"
              autoComplete="current-password"
              error={errors.password?.message}
              {...register('password')}
            />

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-sm text-gray-700"
                >
                  Se souvenir de moi
                </label>
              </div>

              <div className="text-sm">
                <Link
                  to="/forgot-password"
                  className="font-medium text-primary-600 hover:text-primary-500"
                >
                  Mot de passe oublié ?
                </Link>
              </div>
            </div>

            <Button
              type="submit"
              fullWidth
              size="lg"
              loading={isLoading}
            >
              Se connecter
            </Button>
          </form>

          {/* Divider */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Ou continuer avec
                </span>
              </div>
            </div>

            {/* Social Login (placeholder) */}
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                disabled
                className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-500 bg-gray-50 cursor-not-allowed"
              >
                <span>📱</span>
                Mobile Money
              </button>
              <button
                type="button"
                disabled
                className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-500 bg-gray-50 cursor-not-allowed"
              >
                <span>📧</span>
                Google
              </button>
            </div>
            <p className="text-xs text-center text-gray-400 mt-2">
              Bientôt disponible
            </p>
          </div>
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
