import { MapPin, Star, ChevronRight, Search } from 'lucide-react';
import { Page, Destination, destinations } from '../App';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface HomeProps {
  onNavigate: (page: Page) => void;
  onSelectDestination: (destination: Destination) => void;
}

export function Home({ onNavigate, onSelectDestination }: HomeProps) {
  const featuredDestinations = destinations.slice(0, 3);
  const categories = [
    { name: 'Praias', icon: '🏖️', count: 12 },
    { name: 'Natureza', icon: '🌿', count: 8 },
    { name: 'Cultura', icon: '🎭', count: 15 },
    { name: 'Aventura', icon: '⛰️', count: 10 },
  ];

  return (
    <div className="px-4 py-6 space-y-6">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
        <input
          type="text"
          placeholder="Pesquisar destinos, restaurantes..."
          className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
        />
      </div>

      {/* Hero Section */}
      <div className="relative h-48 rounded-2xl overflow-hidden">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1562859422-29f5c0f4b24d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdWFuZGElMjBhbmdvbGElMjBjaXR5JTIwc2t5bGluZXxlbnwxfHx8fDE3NjgwNjMxODh8MA&ixlib=rb-4.1.0&q=80&w=1080"
          alt="Angola"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <h2 className="text-2xl font-bold mb-2">Bem-vindo ao Tukula</h2>
          <p className="text-sm opacity-90">Descubra destinos incríveis e experiências únicas</p>
        </div>
      </div>

      {/* Advertisement Space */}
      <div className="relative h-32 rounded-2xl overflow-hidden bg-gradient-to-br from-red-500 to-yellow-500 p-6 flex items-center justify-between">
        <div className="flex-1">
          <div className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-xs font-medium mb-2">
            Publicidade
          </div>
          <h3 className="text-white font-bold text-lg mb-1">Espaço Publicitário</h3>
          <p className="text-white/90 text-sm">Promova o seu negócio aqui</p>
        </div>
        <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-3xl">
          📢
        </div>
      </div>

      {/* Categories */}
      <div>
        <h3 className="font-semibold mb-3">Categorias</h3>
        <div className="grid grid-cols-4 gap-3">
          {categories.map((category) => (
            <button
              key={category.name}
              onClick={() => onNavigate('explore')}
              className="flex flex-col items-center gap-2 p-3 rounded-xl bg-white border border-gray-100 hover:border-red-200 transition-colors"
            >
              <span className="text-2xl">{category.icon}</span>
              <span className="text-xs text-center font-medium">{category.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Featured Destinations */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">Destinos Populares</h3>
          <button
            onClick={() => onNavigate('explore')}
            className="text-sm text-red-600 flex items-center gap-1"
          >
            Ver todos
            <ChevronRight className="size-4" />
          </button>
        </div>
        <div className="space-y-3">
          {featuredDestinations.map((destination) => (
            <button
              key={destination.id}
              onClick={() => onSelectDestination(destination)}
              className="w-full block bg-white rounded-xl overflow-hidden border border-gray-100 hover:border-red-200 transition-colors"
            >
              <div className="relative h-40">
                <ImageWithFallback
                  src={destination.image}
                  alt={destination.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full flex items-center gap-1">
                  <Star className="size-3 fill-yellow-400 text-yellow-400" />
                  <span className="text-xs font-medium">{destination.rating}</span>
                </div>
              </div>
              <div className="p-4 text-left">
                <h4 className="font-semibold mb-1">{destination.name}</h4>
                <div className="flex items-center gap-1 text-gray-500 text-sm mb-2">
                  <MapPin className="size-3" />
                  <span>{destination.location}</span>
                </div>
                <p className="text-sm text-gray-600 line-clamp-2">{destination.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}