/**
 * Page Paiement - ImmoLomé
 * Initiation du paiement CinetPay pour contacter
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import {
  ShieldCheckIcon,
  CreditCardIcon,
  DevicePhoneMobileIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline';
import { useRoomStore } from '@/store/roomStore';
import { useAuthStore } from '@/store/authStore';
import paymentService from '@/services/paymentService';
import { formatPrice } from '@/utils/formatters';
import { CONTACT_FEE } from '@/utils/constants';
import { FullPageLoader } from '@/components/ui/Loader';
import Button from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Input';
import Card from '@/components/ui/Card';

// Schéma de validation
const messageSchema = z.object({
  message: z
    .string()
    .min(20, 'Votre message doit contenir au moins 20 caractères')
    .max(1000, 'Votre message ne peut pas dépasser 1000 caractères'),
});

export default function PaymentPage() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { currentRoom, isLoading: roomLoading, fetchRoomById } = useRoomStore();
  const { user } = useAuthStore();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState(1); // 1: Message, 2: Confirmation, 3: Paiement

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      message: '',
    },
  });

  const messageValue = watch('message');

  useEffect(() => {
    if (roomId) {
      fetchRoomById(roomId);
    }
  }, [roomId]);

  const handleNextStep = () => {
    setStep(2);
  };

  const handlePayment = async (data) => {
    setIsProcessing(true);
    
    try {
      const response = await paymentService.initiatePayment(roomId, data.message);
      
      if (response.success && response.data.paymentUrl) {
        // Rediriger vers CinetPay
        toast.success('Redirection vers le paiement...');
        window.location.href = response.data.paymentUrl;
      } else {
        throw new Error(response.message || 'Erreur lors de l\'initialisation du paiement');
      }
    } catch (error) {
      toast.error(error.message || 'Erreur lors du paiement');
      setIsProcessing(false);
    }
  };

  if (roomLoading || !currentRoom) {
    return <FullPageLoader text="Chargement..." />;
  }

  const room = currentRoom;
  const mainPhoto = room.photos?.[0]?.url || '/placeholder-room.jpg';

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-custom max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            to={`/chambres/${roomId}`}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Retour à l'annonce
          </Link>
          
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Contacter pour cette chambre
          </h1>
          <p className="text-gray-600 mt-2">
            Complétez votre demande de contact en toute sécurité
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulaire */}
          <div className="lg:col-span-2">
            {/* Progress Steps */}
            <div className="flex items-center mb-8">
              {[
                { num: 1, label: 'Message' },
                { num: 2, label: 'Confirmation' },
                { num: 3, label: 'Paiement' },
              ].map((s, index) => (
                <div key={s.num} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      step >= s.num
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {step > s.num ? <CheckCircleIcon className="w-5 h-5" /> : s.num}
                  </div>
                  <span
                    className={`ml-2 text-sm ${
                      step >= s.num ? 'text-gray-900' : 'text-gray-500'
                    }`}
                  >
                    {s.label}
                  </span>
                  {index < 2 && (
                    <div
                      className={`w-12 h-0.5 mx-4 ${
                        step > s.num ? 'bg-primary-600' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Step 1: Message */}
            {step === 1 && (
              <Card className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Votre message
                </h2>
                <p className="text-gray-600 text-sm mb-6">
                  Présentez-vous et expliquez votre situation. Ce message sera transmis 
                  à notre équipe qui contactera le propriétaire pour vous.
                </p>

                <form onSubmit={handleSubmit(handleNextStep)}>
                  <Textarea
                    label="Votre message de présentation"
                    placeholder="Bonjour, je suis étudiant(e) / salarié(e) à la recherche d'une chambre pour... Je suis intéressé(e) par cette chambre car..."
                    rows={6}
                    error={errors.message?.message}
                    hint={`${messageValue.length}/1000 caractères`}
                    {...register('message')}
                  />

                  <div className="mt-6 flex justify-end">
                    <Button type="submit" size="lg">
                      Continuer
                    </Button>
                  </div>
                </form>
              </Card>
            )}

            {/* Step 2: Confirmation */}
            {step === 2 && (
              <Card className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Confirmez votre demande
                </h2>

                {/* Récap chambre */}
                <div className="flex gap-4 p-4 bg-gray-50 rounded-xl mb-6">
                  <img
                    src={mainPhoto}
                    alt={room.title}
                    className="w-24 h-24 rounded-lg object-cover"
                  />
                  <div>
                    <h3 className="font-medium text-gray-900">{room.title}</h3>
                    <p className="text-sm text-gray-500">{room.location?.quartier}</p>
                    <p className="text-lg font-bold text-primary-600 mt-1">
                      {formatPrice(room.pricing?.monthlyRent)}/mois
                    </p>
                  </div>
                </div>

                {/* Récap message */}
                <div className="mb-6">
                  <label className="text-sm font-medium text-gray-700">Votre message :</label>
                  <div className="mt-2 p-4 bg-gray-50 rounded-xl text-sm text-gray-700">
                    {messageValue}
                  </div>
                </div>

                {/* Récap utilisateur */}
                <div className="mb-6 p-4 border border-gray-200 rounded-xl">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Vos coordonnées :</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Nom :</span>
                      <span className="ml-2 font-medium">{user?.firstName} {user?.lastName}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Email :</span>
                      <span className="ml-2 font-medium">{user?.email}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Téléphone :</span>
                      <span className="ml-2 font-medium">{user?.phone}</span>
                    </div>
                  </div>
                </div>

                {/* Récap paiement */}
                <div className="p-4 bg-primary-50 border border-primary-100 rounded-xl mb-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-primary-900 font-medium">Frais de mise en relation</span>
                      <p className="text-xs text-primary-700 mt-1">
                        Paiement unique et sécurisé via CinetPay
                      </p>
                    </div>
                    <span className="text-2xl font-bold text-primary-600">
                      {formatPrice(CONTACT_FEE)}
                    </span>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button
                    variant="outline"
                    onClick={() => setStep(1)}
                    className="flex-1"
                  >
                    Modifier
                  </Button>
                  <Button
                    onClick={() => setStep(3)}
                    className="flex-1"
                  >
                    Procéder au paiement
                  </Button>
                </div>
              </Card>
            )}

            {/* Step 3: Paiement */}
            {step === 3 && (
              <Card className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Choisissez votre mode de paiement
                </h2>

                <div className="space-y-4 mb-6">
                  {/* Mobile Money */}
                  <label className="flex items-center gap-4 p-4 border-2 border-primary-500 bg-primary-50 rounded-xl cursor-pointer">
                    <input
                      type="radio"
                      name="paymentMethod"
                      defaultChecked
                      className="w-5 h-5 text-primary-600"
                    />
                    <DevicePhoneMobileIcon className="w-8 h-8 text-primary-600" />
                    <div className="flex-1">
                      <span className="font-medium text-gray-900">Mobile Money</span>
                      <p className="text-xs text-gray-500">MTN MoMo, Moov Money, Flooz</p>
                    </div>
                    <div className="flex gap-2">
                      <span className="px-2 py-1 bg-yellow-400 text-yellow-900 text-xs font-bold rounded">MTN</span>
                      <span className="px-2 py-1 bg-blue-500 text-white text-xs font-bold rounded">Moov</span>
                    </div>
                  </label>

                  {/* Carte */}
                  <label className="flex items-center gap-4 p-4 border border-gray-200 rounded-xl cursor-pointer hover:border-gray-300">
                    <input
                      type="radio"
                      name="paymentMethod"
                      className="w-5 h-5 text-primary-600"
                    />
                    <CreditCardIcon className="w-8 h-8 text-gray-400" />
                    <div className="flex-1">
                      <span className="font-medium text-gray-900">Carte bancaire</span>
                      <p className="text-xs text-gray-500">Visa, Mastercard</p>
                    </div>
                  </label>
                </div>

                {/* Montant */}
                <div className="p-4 bg-gray-100 rounded-xl mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Montant à payer</span>
                    <span className="text-2xl font-bold text-gray-900">
                      {formatPrice(CONTACT_FEE)}
                    </span>
                  </div>
                </div>

                {/* Sécurité */}
                <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl mb-6">
                  <ShieldCheckIcon className="w-6 h-6 text-green-600" />
                  <div className="text-sm">
                    <span className="font-medium text-green-800">Paiement 100% sécurisé</span>
                    <p className="text-green-700">via CinetPay, leader du paiement en Afrique</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button
                    variant="outline"
                    onClick={() => setStep(2)}
                    disabled={isProcessing}
                    className="flex-1"
                  >
                    Retour
                  </Button>
                  <Button
                    onClick={handleSubmit(handlePayment)}
                    loading={isProcessing}
                    className="flex-1"
                  >
                    Payer {formatPrice(CONTACT_FEE)}
                  </Button>
                </div>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              {/* Récap chambre */}
              <Card className="p-4">
                <img
                  src={mainPhoto}
                  alt={room.title}
                  className="w-full aspect-video rounded-xl object-cover mb-4"
                />
                <h3 className="font-semibold text-gray-900">{room.title}</h3>
                <p className="text-sm text-gray-500">{room.location?.quartier}</p>
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <span className="text-xl font-bold text-primary-600">
                    {formatPrice(room.pricing?.monthlyRent)}
                  </span>
                  <span className="text-gray-500 text-sm">/mois</span>
                </div>
              </Card>

              {/* Engagement */}
              <Card className="p-4 bg-gray-50 border-0">
                <h4 className="font-medium text-gray-900 mb-3">Ce que nous faisons pour vous :</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Nous contactons le propriétaire sous 24h</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Nous organisons une visite pour vous</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Nous vous accompagnons jusqu'à la signature</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Vos coordonnées restent confidentielles</span>
                  </li>
                </ul>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
