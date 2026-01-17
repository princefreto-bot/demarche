/**
 * Page Contact - ImmoLomé
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import {
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import Input, { Textarea } from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

const contactSchema = z.object({
  name: z.string().min(2, 'Nom requis'),
  email: z.string().email('Email invalide'),
  phone: z.string().optional(),
  subject: z.string().min(5, 'Sujet requis'),
  message: z.string().min(20, 'Message trop court'),
});

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    // Simuler l'envoi
    await new Promise((resolve) => setTimeout(resolve, 1000));
    toast.success('Message envoyé ! Nous vous répondrons sous 24h.');
    reset();
    setIsSubmitting(false);
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-16">
        <div className="container-custom text-center">
          <h1 className="heading-1 text-white mb-4">Contactez-nous</h1>
          <p className="text-xl text-primary-100 max-w-2xl mx-auto">
            Une question ? Un problème ? Notre équipe est là pour vous aider.
          </p>
        </div>
      </div>

      <div className="container-custom py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Infos de contact */}
          <div className="space-y-6">
            <Card>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <PhoneIcon className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Téléphone</h3>
                  <p className="text-gray-600 mt-1">+228 90 00 00 00</p>
                  <p className="text-sm text-gray-500">Lun-Sam: 8h-18h</p>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-secondary-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <EnvelopeIcon className="w-6 h-6 text-secondary-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Email</h3>
                  <p className="text-gray-600 mt-1">contact@immolome.com</p>
                  <p className="text-sm text-gray-500">Réponse sous 24h</p>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-accent-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <MapPinIcon className="w-6 h-6 text-accent-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Adresse</h3>
                  <p className="text-gray-600 mt-1">Lomé, Togo</p>
                  <p className="text-sm text-gray-500">Sur rendez-vous uniquement</p>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <ClockIcon className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Horaires</h3>
                  <p className="text-gray-600 mt-1">Lundi - Samedi</p>
                  <p className="text-sm text-gray-500">8h00 - 18h00</p>
                </div>
              </div>
            </Card>

            {/* WhatsApp */}
            <a
              href="https://wa.me/22890000000"
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <Card hover className="bg-green-50 border-green-200">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">💬</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-green-800">WhatsApp</h3>
                    <p className="text-green-600">Discutez avec nous maintenant</p>
                  </div>
                </div>
              </Card>
            </a>
          </div>

          {/* Formulaire */}
          <div className="lg:col-span-2">
            <Card>
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Envoyez-nous un message
              </h2>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Nom complet"
                    placeholder="Jean Dupont"
                    error={errors.name?.message}
                    {...register('name')}
                  />
                  <Input
                    label="Email"
                    type="email"
                    placeholder="jean@example.com"
                    error={errors.email?.message}
                    {...register('email')}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Téléphone (optionnel)"
                    placeholder="+228 90 00 00 00"
                    {...register('phone')}
                  />
                  <Input
                    label="Sujet"
                    placeholder="Comment pouvons-nous vous aider ?"
                    error={errors.subject?.message}
                    {...register('subject')}
                  />
                </div>

                <Textarea
                  label="Message"
                  placeholder="Décrivez votre demande en détail..."
                  rows={6}
                  error={errors.message?.message}
                  {...register('message')}
                />

                <Button type="submit" size="lg" loading={isSubmitting}>
                  Envoyer le message
                </Button>
              </form>
            </Card>

            {/* FAQ */}
            <Card className="mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Questions fréquentes
              </h3>
              
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900">
                    Comment fonctionne ImmoLomé ?
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Vous consultez les annonces gratuitement. Pour contacter un propriétaire, 
                    vous payez des frais de mise en relation (1000 FCFA). Notre équipe organise 
                    la visite pour vous.
                  </p>
                </div>
                
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900">
                    Les annonces sont-elles vérifiées ?
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Oui, chaque annonce est validée par notre équipe avant publication. 
                    Les photos sont prises sur place.
                  </p>
                </div>
                
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900">
                    Que se passe-t-il après le paiement ?
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Notre équipe vous contacte sous 24h pour organiser une visite avec 
                    le propriétaire.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
