import { useState } from 'react';
import { MapPin, Star, Search } from 'lucide-react';
import { Destination, destinations } from '../App';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface ExploreProps {
  onSelectDestination: (destination: Destination) => void;
}

export function Explore({ onSelectDestination }: ExploreProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');

  const categories = ['Todos', 'Cidade', 'Natureza', 'Aventura', 'Praia', 'Vida Selvagem', 'Cultura'];

  const filteredDestinations = destinations.filter((destination) => {
    const matchesSearch = destination.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         destination.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         destination.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'Todos' || destination.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="px-4 py-6 space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
        <input
          type="text"
          placeholder="Procurar destinos..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
        />
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              selectedCategory === category
                ? 'bg-red-600 text-white'
                : 'bg-white border border-gray-200 text-gray-700 hover:border-red-200'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-600">
        {filteredDestinations.length} {filteredDestinations.length === 1 ? 'destino encontrado' : 'destinos encontrados'}
      </div>

      {/* Destinations Grid */}
      <div className="grid grid-cols-1 gap-4 pb-4">
        {filteredDestinations.map((destination) => (
          <button
            key={destination.id}
            onClick={() => onSelectDestination(destination)}
            className="bg-white rounded-xl overflow-hidden border border-gray-100 hover:border-red-200 transition-all hover:shadow-md"
          >
            <div className="relative h-48">
              <ImageWithFallback
                src={destination.image}
                alt={destination.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2.5 py-1.5 rounded-full flex items-center gap-1">
                <Star className="size-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium">{destination.rating}</span>
              </div>
              <div className="absolute top-3 left-3 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                {destination.category}
              </div>
            </div>
            <div className="p-4 text-left">
              <h3 className="font-semibold text-lg mb-1">{destination.name}</h3>
              <div className="flex items-center gap-1 text-gray-500 text-sm mb-2">
                <MapPin className="size-4" />
                <span>{destination.location}</span>
              </div>
              <p className="text-sm text-gray-600 line-clamp-2 mb-3">{destination.description}</p>
              <div className="flex flex-wrap gap-2">
                {destination.highlights.slice(0, 3).map((highlight, index) => (
                  <span
                    key={index}
                    className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full"
                  >
                    {highlight}
                  </span>
                ))}
              </div>
            </div>
          </button>
        ))}
      </div>

      {filteredDestinations.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p className="mb-2">Nenhum destino encontrado</p>
          <p className="text-sm">Tente ajustar os filtros ou pesquisa</p>
        </div>
      )}
    </div>
  );
}
