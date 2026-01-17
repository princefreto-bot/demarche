/**
 * Page d'accueil - ImmoLomé
 */

import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  MagnifyingGlassIcon,
  ShieldCheckIcon,
  CurrencyDollarIcon,
  HomeModernIcon,
  CheckCircleIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';
import { useRoomStore } from '@/store/roomStore';
import RoomCard from '@/components/room/RoomCard';
import { RoomListSkeleton } from '@/components/ui/Loader';
import Button from '@/components/ui/Button';

const features = [
  {
    icon: MagnifyingGlassIcon,
    title: 'Recherche facile',
    description: 'Trouvez votre chambre idéale parmi nos annonces vérifiées à Lomé.',
  },
  {
    icon: ShieldCheckIcon,
    title: 'Tiers de confiance',
    description: 'Nous vérifions chaque annonce et organisons les visites pour vous.',
  },
  {
    icon: CurrencyDollarIcon,
    title: 'Prix transparents',
    description: 'Tous les coûts sont affichés clairement : loyer, caution, durée.',
  },
  {
    icon: HomeModernIcon,
    title: 'Photos HD réelles',
    description: 'Des photos prises sur place pour voir exactement ce que vous louez.',
  },
];

const howItWorks = [
  {
    step: 1,
    title: 'Consultez les annonces',
    description: 'Parcourez notre catalogue de chambres disponibles gratuitement.',
  },
  {
    step: 2,
    title: 'Payez pour contacter',
    description: 'Choisissez une chambre et payez les frais de mise en relation (1000 FCFA).',
  },
  {
    step: 3,
    title: 'Nous vous accompagnons',
    description: 'Notre équipe contacte le propriétaire et organise votre visite.',
  },
  {
    step: 4,
    title: 'Emménagez !',
    description: 'Si la chambre vous convient, signez le contrat et installez-vous.',
  },
];

export default function HomePage() {
  const { rooms, isLoading, fetchRooms } = useRoomStore();

  useEffect(() => {
    fetchRooms(true);
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 text-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-pattern opacity-10" />
        
        <div className="container-custom relative py-20 md:py-32">
          <div className="max-w-3xl">
            <h1 className="heading-1 text-white mb-6">
              Trouvez votre 
              <span className="text-accent-400"> chambre idéale </span>
              à Lomé
            </h1>
            <p className="text-xl text-primary-100 mb-8 leading-relaxed">
              ImmoLomé est votre plateforme de confiance pour trouver une chambre à louer. 
              Nous vérifions chaque annonce et vous accompagnons jusqu'à l'emménagement.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/chambres">
                <Button size="xl" variant="accent" className="w-full sm:w-auto">
                  Voir les chambres disponibles
                  <ArrowRightIcon className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <a href="#how-it-works">
                <Button size="xl" variant="outline" className="w-full sm:w-auto border-white/30 text-white hover:bg-white/10">
                  Comment ça marche ?
                </Button>
              </a>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 mt-12 pt-12 border-t border-white/20">
              <div>
                <div className="text-3xl md:text-4xl font-bold text-white">200+</div>
                <div className="text-primary-200 text-sm mt-1">Chambres disponibles</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-white">500+</div>
                <div className="text-primary-200 text-sm mt-1">Clients satisfaits</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-white">15+</div>
                <div className="text-primary-200 text-sm mt-1">Quartiers couverts</div>
              </div>
            </div>
          </div>
        </div>

        {/* Wave SVG */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
              fill="#f9fafb"
            />
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section className="section bg-gray-50">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="heading-2 text-gray-900">Pourquoi choisir ImmoLomé ?</h2>
            <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
              Nous simplifions votre recherche de logement avec un service professionnel et sécurisé.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Rooms */}
      <section className="section">
        <div className="container-custom">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="heading-2 text-gray-900">Dernières annonces</h2>
              <p className="text-gray-600 mt-2">Découvrez nos chambres récemment ajoutées</p>
            </div>
            <Link to="/chambres">
              <Button variant="outline">
                Voir tout
                <ArrowRightIcon className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>

          {isLoading ? (
            <RoomListSkeleton count={6} />
          ) : rooms.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rooms.slice(0, 6).map((room) => (
                <RoomCard key={room._id} room={room} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">Aucune chambre disponible pour le moment.</p>
            </div>
          )}
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="section bg-gray-900 text-white">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="heading-2 text-white">Comment ça marche ?</h2>
            <p className="text-gray-400 mt-4 max-w-2xl mx-auto">
              Un processus simple et sécurisé pour trouver votre prochain logement.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map((item, index) => (
              <div key={item.step} className="relative">
                {/* Connector Line */}
                {index < howItWorks.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-full w-full h-0.5 bg-gray-700" />
                )}
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-6 relative z-10">
                    <span className="text-2xl font-bold text-white">{item.step}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {item.title}
                  </h3>
                  <p className="text-gray-400 text-sm">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/chambres">
              <Button size="lg" variant="accent">
                Commencer ma recherche
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section">
        <div className="container-custom">
          <div className="bg-gradient-to-r from-primary-600 to-secondary-600 rounded-3xl p-8 md:p-12 text-center text-white">
            <h2 className="heading-2 text-white mb-4">
              Vous êtes propriétaire ?
            </h2>
            <p className="text-primary-100 max-w-2xl mx-auto mb-8">
              Publiez vos chambres gratuitement sur ImmoLomé et trouvez des locataires fiables. 
              Nous nous occupons de la mise en relation.
            </p>
            <Link to="/register?role=owner">
              <Button size="lg" variant="accent">
                Publier une annonce gratuitement
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
