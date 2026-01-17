/**
 * Page Mot de passe oublié - ImmoLomé
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { EnvelopeIcon, ArrowLeftIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import authService from '@/services/authService';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

const schema = z.object({
  email: z.string().email('Email invalide'),
});

export default function ForgotPasswordPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await authService.forgotPassword(data.email);
      setIsSubmitted(true);
      toast.success('Email envoyé !');
    } catch (error) {
      // Toujours afficher succès pour la sécurité
      setIsSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow-sm sm:rounded-2xl sm:px-10 border border-gray-100 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircleIcon className="w-8 h-8 text-green-600" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Email envoyé !
            </h2>
            <p className="text-gray-600 mb-6">
              Si un compte existe avec l'adresse <strong>{getValues('email')}</strong>, 
              vous recevrez un lien de réinitialisation dans quelques minutes.
            </p>

            <div className="space-y-3">
              <Link to="/login">
                <Button fullWidth>
                  Retour à la connexion
                </Button>
              </Link>
              
              <button
                onClick={() => setIsSubmitted(false)}
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                Utiliser une autre adresse
              </button>
            </div>

            <p className="text-xs text-gray-500 mt-6">
              Pensez à vérifier votre dossier spam
            </p>
          </div>
        </div>
      </div>
    );
  }

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
          Mot de passe oublié
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Entrez votre email pour recevoir un lien de réinitialisation
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

            <Button
              type="submit"
              fullWidth
              size="lg"
              loading={isSubmitting}
            >
              Envoyer le lien
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              Retour à la connexion
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
