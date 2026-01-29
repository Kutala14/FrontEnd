import { useState } from 'react';
import { Home } from './components/Home';
import { Explore } from './components/Explore';
import { DestinationDetail } from './components/DestinationDetail';
import { Experiences } from './components/Experiences';
import { Restaurants } from './components/Restaurants';
import { RestaurantBooking } from './components/RestaurantBooking';
import { Navigation } from './components/Navigation';

export type Page = 'home' | 'explore' | 'destination' | 'experiences' | 'restaurants' | 'restaurant-booking';

export interface Destination {
  id: number;
  name: string;
  location: string;
  description: string;
  image: string;
  rating: number;
  category: string;
  highlights: string[];
  activities: string[];
}

export interface Restaurant {
  id: number;
  name: string;
  cuisine: string;
  description: string;
  image: string;
  rating: number;
  reviews: number;
  priceRange: string;
  location: string;
  openHours: string;
  phone: string;
  specialties: string[];
}

export const destinations: Destination[] = [
  {
    id: 1,
    name: 'Luanda',
    location: 'Luanda, Angola',
    description: 'A vibrante capital de Angola, misturando modernidade com história colonial portuguesa. Descubra a Fortaleza de São Miguel, o Museu da Escravatura e as belas praias urbanas.',
    image: 'https://images.unsplash.com/photo-1562859422-29f5c0f4b24d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdWFuZGElMjBhbmdvbGElMjBjaXR5JTIwc2t5bGluZXxlbnwxfHx8fDE3NjgwNjMxODh8MA&ixlib=rb-4.1.0&q=80&w=1080',
    rating: 4.5,
    category: 'Cidade',
    highlights: ['Fortaleza de São Miguel', 'Ilha de Luanda', 'Museu da Escravatura'],
    activities: ['City Tours', 'Gastronomia', 'Vida Noturna']
  },
  {
    id: 2,
    name: 'Quedas de Kalandula',
    location: 'Malanje, Angola',
    description: 'Uma das maiores quedas de água de África, com 105 metros de altura. Um espetáculo natural impressionante rodeado por paisagens deslumbrantes.',
    image: 'https://images.unsplash.com/photo-1636380778575-34508e634145?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3YXRlcmZhbGwlMjBuYXR1cmUlMjBhZnJpY2F8ZW58MXx8fHwxNzY4MDYzMTkyfDA&ixlib=rb-4.1.0&q=80&w=1080',
    rating: 4.8,
    category: 'Natureza',
    highlights: ['Cascata impressionante', 'Fotografia', 'Natureza selvagem'],
    activities: ['Caminhadas', 'Fotografia', 'Piqueniques']
  },
  {
    id: 3,
    name: 'Deserto do Namibe',
    location: 'Namibe, Angola',
    description: 'Paisagens desérticas únicas com dunas gigantes que encontram o Atlântico. Uma experiência extraordinária entre o deserto e o mar.',
    image: 'https://images.unsplash.com/photo-1612222780225-04d3384823fd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZXNlcnQlMjBsYW5kc2NhcGUlMjBuYW1pYnxlbnwxfHx8fDE3NjgwNjMxODl8MA&ixlib=rb-4.1.0&q=80&w=1080',
    rating: 4.7,
    category: 'Aventura',
    highlights: ['Dunas gigantes', 'Pôr do sol', 'Vida selvagem'],
    activities: ['Sandboarding', '4x4 Safari', 'Acampamento']
  },
  {
    id: 4,
    name: 'Praias do Cabo Ledo',
    location: 'Bengo, Angola',
    description: 'Praias paradisíacas com águas cristalinas, perfeitas para surf e relaxamento. Um dos segredos mais bem guardados de Angola.',
    image: 'https://images.unsplash.com/photo-1658872739589-0691c8039617?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZnJpY2FuJTIwYmVhY2glMjB0cm9waWNhbHxlbnwxfHx8fDE3NjgwNjMxOTB8MA&ixlib=rb-4.1.0&q=80&w=1080',
    rating: 4.6,
    category: 'Praia',
    highlights: ['Surf', 'Águas cristalinas', 'Paisagens naturais'],
    activities: ['Surf', 'Natação', 'Relaxamento']
  },
  {
    id: 5,
    name: 'Parque Nacional da Kissama',
    location: 'Luanda Sul, Angola',
    description: 'Reserva natural com elefantes, girafas e outros animais selvagens. Experiência de safari autêntica a poucos quilómetros de Luanda.',
    image: 'https://images.unsplash.com/photo-1729359035276-189519a4b072?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzYWZhcmklMjB3aWxkbGlmZSUyMGFmcmljYXxlbnwxfHx8fDE3NjgwMjMzNzR8MA&ixlib=rb-4.1.0&q=80&w=1080',
    rating: 4.4,
    category: 'Vida Selvagem',
    highlights: ['Elefantes', 'Safari', 'Conservação'],
    activities: ['Safari', 'Observação de aves', 'Fotografia']
  },
  {
    id: 6,
    name: 'Cultura Tradicional',
    location: 'Várias Regiões, Angola',
    description: 'Explore a rica herança cultural angolana através de danças tradicionais, artesanato e comunidades locais.',
    image: 'https://images.unsplash.com/photo-1515657241610-a6b33f0f6c5a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cmliYWwlMjBjdWx0dXJlJTIwYWZyaWNhfGVufDF8fHx8MTc2ODA2MzE5M3ww&ixlib=rb-4.1.0&q=80&w=1080',
    rating: 4.9,
    category: 'Cultura',
    highlights: ['Danças tradicionais', 'Artesanato', 'Gastronomia local'],
    activities: ['Tours culturais', 'Workshops', 'Festivais']
  }
];

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);

  const handleNavigate = (page: Page) => {
    setCurrentPage(page);
    if (page !== 'destination') {
      setSelectedDestination(null);
    }
    if (page !== 'restaurant-booking') {
      setSelectedRestaurant(null);
    }
  };

  const handleSelectDestination = (destination: Destination) => {
    setSelectedDestination(destination);
    setCurrentPage('destination');
  };

  const handleSelectRestaurant = (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant);
    setCurrentPage('restaurant-booking');
  };

  return (
    <div className="size-full flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-red-600 to-yellow-500 rounded-lg flex items-center justify-center">
            <span className="text-white text-sm font-bold">TK</span>
          </div>
          <h1 className="font-semibold text-lg">Tukula</h1>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto pb-20">
        {currentPage === 'home' && <Home onNavigate={handleNavigate} onSelectDestination={handleSelectDestination} />}
        {currentPage === 'explore' && <Explore onSelectDestination={handleSelectDestination} />}
        {currentPage === 'destination' && selectedDestination && (
          <DestinationDetail destination={selectedDestination} onBack={() => handleNavigate('explore')} />
        )}
        {currentPage === 'experiences' && <Experiences />}
        {currentPage === 'restaurants' && <Restaurants onSelectRestaurant={handleSelectRestaurant} />}
        {currentPage === 'restaurant-booking' && selectedRestaurant && (
          <RestaurantBooking restaurant={selectedRestaurant} onBack={() => handleNavigate('restaurants')} />
        )}
      </main>

      {/* Bottom Navigation */}
      <Navigation currentPage={currentPage} onNavigate={handleNavigate} />
    </div>
  );
}