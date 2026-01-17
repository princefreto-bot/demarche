/**
 * Page Ajouter une Chambre - ImmoLomé
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import {
  PhotoIcon,
  PlusIcon,
  XMarkIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';
import roomService from '@/services/roomService';
import { QUARTIERS, ROOM_TYPES, FEATURES, RULES } from '@/utils/constants';
import Card, { CardHeader, CardTitle } from '@/components/ui/Card';
import Input, { Textarea, Select, Checkbox } from '@/components/ui/Input';
import Button from '@/components/ui/Button';

// Schéma de validation
const roomSchema = z.object({
  title: z.string().min(10, 'Minimum 10 caractères').max(100),
  description: z.string().min(50, 'Minimum 50 caractères').max(2000),
  quartier: z.string().min(1, 'Quartier requis'),
  monthlyRent: z.number().min(5000, 'Minimum 5000 FCFA'),
  contractDuration: z.number().min(1).max(36),
  cautionMonths: z.number().min(0).max(6),
  advanceMonths: z.number().min(1).max(12),
  length: z.number().min(1, 'Longueur requise'),
  width: z.number().min(1, 'Largeur requise'),
  height: z.number().min(2, 'Hauteur requise'),
  type: z.string().min(1, 'Type requis'),
  rooms: z.number().min(1).max(20),
  defects: z.string().min(10, 'Décrivez au moins un défaut'),
});

export default function AddRoomPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photos, setPhotos] = useState([]);
  const [features, setFeatures] = useState({});
  const [rules, setRules] = useState({
    petsAllowed: false,
    smokingAllowed: false,
    childrenAllowed: true,
    couplesAllowed: true,
    maxOccupants: 2,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    trigger,
  } = useForm({
    resolver: zodResolver(roomSchema),
    defaultValues: {
      title: '',
      description: '',
      quartier: '',
      monthlyRent: '',
      contractDuration: 12,
      cautionMonths: 1,
      advanceMonths: 1,
      length: '',
      width: '',
      height: '',
      type: '',
      rooms: 1,
      defects: '',
    },
  });

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    if (photos.length + files.length > 10) {
      toast.error('Maximum 10 photos');
      return;
    }
    
    const newPhotos = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setPhotos([...photos, ...newPhotos]);
  };

  const removePhoto = (index) => {
    const newPhotos = [...photos];
    URL.revokeObjectURL(newPhotos[index].preview);
    newPhotos.splice(index, 1);
    setPhotos(newPhotos);
  };

  const nextStep = async () => {
    let fieldsToValidate = [];
    
    if (step === 1) {
      fieldsToValidate = ['title', 'description', 'quartier', 'type'];
    } else if (step === 2) {
      fieldsToValidate = ['monthlyRent', 'contractDuration', 'length', 'width', 'height'];
    }
    
    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  const onSubmit = async (data) => {
    if (photos.length < 3) {
      toast.error('Minimum 3 photos requises');
      return;
    }

    setIsSubmitting(true);
    try {
      // Préparer les données
      const roomData = {
        title: data.title,
        description: data.description,
        location: {
          quartier: data.quartier,
          ville: 'Lomé',
        },
        pricing: {
          monthlyRent: data.monthlyRent,
          contractDuration: data.contractDuration,
          cautionMonths: data.cautionMonths,
          advanceMonths: data.advanceMonths,
        },
        dimensions: {
          length: data.length,
          width: data.width,
          height: data.height,
        },
        features: {
          type: data.type,
          rooms: data.rooms,
          ...features,
        },
        defects: [{ description: data.defects, severity: 'mineur' }],
        rules,
      };

      // Créer la chambre
      const response = await roomService.createRoom(roomData);
      const roomId = response.data.room._id;

      // Upload des photos
      const photoFiles = photos.map((p) => p.file);
      await roomService.addPhotos(roomId, photoFiles);

      toast.success('Chambre créée avec succès !');
      navigate('/owner/rooms');
    } catch (error) {
      toast.error(error.message || 'Erreur lors de la création');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Retour
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Ajouter une chambre</h1>
        <p className="text-gray-600 mt-1">
          Créez une annonce attractive pour votre chambre
        </p>
      </div>

      {/* Progress */}
      <div className="flex items-center mb-8">
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className="flex items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-medium ${
                step >= s
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 text-gray-500'
              }`}
            >
              {s}
            </div>
            {s < 4 && (
              <div
                className={`w-16 h-1 ${
                  step > s ? 'bg-primary-600' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Step 1: Informations de base */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Informations de base</CardTitle>
            </CardHeader>

            <div className="space-y-4">
              <Input
                label="Titre de l'annonce"
                placeholder="Ex: Belle chambre salon à Tokoin"
                error={errors.title?.message}
                {...register('title')}
              />

              <Textarea
                label="Description"
                placeholder="Décrivez votre chambre en détail..."
                rows={5}
                error={errors.description?.message}
                {...register('description')}
              />

              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="Quartier"
                  options={QUARTIERS.map((q) => ({ value: q, label: q }))}
                  error={errors.quartier?.message}
                  {...register('quartier')}
                />

                <Select
                  label="Type de logement"
                  options={ROOM_TYPES}
                  error={errors.type?.message}
                  {...register('type')}
                />
              </div>

              <Input
                label="Nombre de pièces"
                type="number"
                min={1}
                error={errors.rooms?.message}
                {...register('rooms', { valueAsNumber: true })}
              />
            </div>

            <div className="flex justify-end mt-6">
              <Button type="button" onClick={nextStep} icon={ArrowRightIcon} iconPosition="right">
                Suivant
              </Button>
            </div>
          </Card>
        )}

        {/* Step 2: Prix et dimensions */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Prix et dimensions</CardTitle>
            </CardHeader>

            <div className="space-y-6">
              {/* Prix */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Tarification</h4>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Loyer mensuel (FCFA)"
                    type="number"
                    min={5000}
                    error={errors.monthlyRent?.message}
                    {...register('monthlyRent', { valueAsNumber: true })}
                  />
                  <Input
                    label="Durée du contrat (mois)"
                    type="number"
                    min={1}
                    max={36}
                    error={errors.contractDuration?.message}
                    {...register('contractDuration', { valueAsNumber: true })}
                  />
                  <Input
                    label="Caution (mois)"
                    type="number"
                    min={0}
                    max={6}
                    error={errors.cautionMonths?.message}
                    {...register('cautionMonths', { valueAsNumber: true })}
                  />
                  <Input
                    label="Avance (mois)"
                    type="number"
                    min={1}
                    max={12}
                    error={errors.advanceMonths?.message}
                    {...register('advanceMonths', { valueAsNumber: true })}
                  />
                </div>
              </div>

              {/* Dimensions */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Dimensions (en mètres)</h4>
                <div className="grid grid-cols-3 gap-4">
                  <Input
                    label="Longueur"
                    type="number"
                    step="0.1"
                    min={1}
                    error={errors.length?.message}
                    {...register('length', { valueAsNumber: true })}
                  />
                  <Input
                    label="Largeur"
                    type="number"
                    step="0.1"
                    min={1}
                    error={errors.width?.message}
                    {...register('width', { valueAsNumber: true })}
                  />
                  <Input
                    label="Hauteur"
                    type="number"
                    step="0.1"
                    min={2}
                    error={errors.height?.message}
                    {...register('height', { valueAsNumber: true })}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-between mt-6">
              <Button type="button" variant="outline" onClick={prevStep} icon={ArrowLeftIcon}>
                Précédent
              </Button>
              <Button type="button" onClick={nextStep} icon={ArrowRightIcon} iconPosition="right">
                Suivant
              </Button>
            </div>
          </Card>
        )}

        {/* Step 3: Caractéristiques et défauts */}
        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>Caractéristiques et défauts</CardTitle>
            </CardHeader>

            <div className="space-y-6">
              {/* Équipements */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Équipements</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {FEATURES.map((feature) => (
                    <label
                      key={feature.key}
                      className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                    >
                      <input
                        type="checkbox"
                        checked={features[feature.key] || false}
                        onChange={(e) =>
                          setFeatures({ ...features, [feature.key]: e.target.checked })
                        }
                        className="w-4 h-4 text-primary-600 rounded"
                      />
                      <span className="text-lg">{feature.icon}</span>
                      <span className="text-sm">{feature.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Règles */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Règles</h4>
                <div className="grid grid-cols-2 gap-3">
                  {RULES.map((rule) => (
                    <label
                      key={rule.key}
                      className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                    >
                      <input
                        type="checkbox"
                        checked={rules[rule.key] || false}
                        onChange={(e) =>
                          setRules({ ...rules, [rule.key]: e.target.checked })
                        }
                        className="w-4 h-4 text-primary-600 rounded"
                      />
                      <span className="text-lg">{rule.icon}</span>
                      <span className="text-sm">{rule.label}</span>
                    </label>
                  ))}
                </div>
                <Input
                  label="Occupants maximum"
                  type="number"
                  min={1}
                  max={10}
                  value={rules.maxOccupants}
                  onChange={(e) => setRules({ ...rules, maxOccupants: parseInt(e.target.value) })}
                  className="mt-4 w-48"
                />
              </div>

              {/* Défauts */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Défauts à signaler</h4>
                <p className="text-sm text-gray-500 mb-3">
                  La transparence inspire confiance. Mentionnez les petits défauts.
                </p>
                <Textarea
                  placeholder="Ex: Petite fissure au plafond, peinture à rafraîchir..."
                  rows={3}
                  error={errors.defects?.message}
                  {...register('defects')}
                />
              </div>
            </div>

            <div className="flex justify-between mt-6">
              <Button type="button" variant="outline" onClick={prevStep} icon={ArrowLeftIcon}>
                Précédent
              </Button>
              <Button type="button" onClick={nextStep} icon={ArrowRightIcon} iconPosition="right">
                Suivant
              </Button>
            </div>
          </Card>
        )}

        {/* Step 4: Photos */}
        {step === 4 && (
          <Card>
            <CardHeader>
              <CardTitle>Photos de la chambre</CardTitle>
            </CardHeader>

            <div>
              <p className="text-sm text-gray-500 mb-4">
                Ajoutez au moins 3 photos HD. Maximum 10 photos.
              </p>

              {/* Upload zone */}
              <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-primary-500 hover:bg-primary-50 transition-colors">
                <PhotoIcon className="w-12 h-12 text-gray-400" />
                <span className="mt-2 text-sm text-gray-600">
                  Cliquez pour ajouter des photos
                </span>
                <span className="text-xs text-gray-400">
                  JPG, PNG (max 10 MB)
                </span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>

              {/* Preview */}
              {photos.length > 0 && (
                <div className="grid grid-cols-3 md:grid-cols-5 gap-4 mt-6">
                  {photos.map((photo, index) => (
                    <div key={index} className="relative aspect-square">
                      <img
                        src={photo.preview}
                        alt={`Photo ${index + 1}`}
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removePhoto(index)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                      >
                        <XMarkIcon className="w-4 h-4" />
                      </button>
                      {index === 0 && (
                        <span className="absolute bottom-2 left-2 px-2 py-1 bg-black/60 text-white text-xs rounded">
                          Principale
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <p className="text-sm text-gray-500 mt-4">
                {photos.length}/10 photos • {photos.length < 3 && <span className="text-red-500">Minimum 3 photos requises</span>}
              </p>
            </div>

            <div className="flex justify-between mt-6">
              <Button type="button" variant="outline" onClick={prevStep} icon={ArrowLeftIcon}>
                Précédent
              </Button>
              <Button
                type="submit"
                loading={isSubmitting}
                disabled={photos.length < 3}
              >
                Créer l'annonce
              </Button>
            </div>
          </Card>
        )}
      </form>
    </div>
  );
}
