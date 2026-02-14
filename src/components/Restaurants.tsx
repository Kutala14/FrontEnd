import { useState, useEffect } from 'react';
import { MapPin, Star, Clock, Phone, ChevronRight } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface Restaurant {
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

interface RestaurantsProps {
  onSelectRestaurant: (restaurant: Restaurant) => void;
}

export function Restaurants({ onSelectRestaurant }: RestaurantsProps) {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedCuisine, setSelectedCuisine] = useState<string>('Todas');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // 🔥 Buscar restaurantes da API
  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL;
        const token = localStorage.getItem('tukula_token');

        const response = await fetch(`${apiUrl}/restaurants/`, {
          headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` })
          }
        });

        if (!response.ok) {
          throw new Error('Erro ao buscar restaurantes');
        }

        const data = await response.json();
        setRestaurants(data);

      } catch (err) {
        console.error(err);
        setError('Erro ao carregar restaurantes');
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, []);

  // 🔥 Gerar categorias dinamicamente
  const cuisines = [
    'Todas',
    ...Array.from(new Set(restaurants.map(r => r.cuisine)))
  ];

  const filteredRestaurants = restaurants.filter(
    restaurant =>
      selectedCuisine === 'Todas' ||
      restaurant.cuisine === selectedCuisine
  );

  // 🔄 Loading state
  if (loading) {
    return (
      <div className="p-6 text-center text-gray-600">
        Carregando restaurantes...
      </div>
    );
  }

  // ❌ Error state
  if (error) {
    return (
      <div className="p-6 text-center text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div className="px-4 py-6 space-y-4">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold mb-1">Restaurantes</h2>
        <p className="text-gray-600">
          Os melhores lugares para comer em Angola
        </p>
      </div>

      {/* Cuisine Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
        {cuisines.map((cuisine) => (
          <button
            key={cuisine}
            onClick={() => setSelectedCuisine(cuisine)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              selectedCuisine === cuisine
                ? 'bg-red-600 text-white'
                : 'bg-white border border-gray-200 text-gray-700 hover:border-red-200'
            }`}
          >
            {cuisine}
          </button>
        ))}
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-600">
        {filteredRestaurants.length}{' '}
        {filteredRestaurants.length === 1
          ? 'restaurante'
          : 'restaurantes'}
      </div>

      {/* Restaurants List */}
      <div className="space-y-4 pb-4">
        {filteredRestaurants.map((restaurant) => (
          <div
            key={restaurant.id}
            className="bg-white rounded-xl overflow-hidden border border-gray-100 hover:border-red-200 transition-all hover:shadow-md"
          >
            <div className="relative h-48">
              <ImageWithFallback
                src={restaurant.image}
                alt={restaurant.name}
                className="w-full h-full object-cover"
              />

              <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2.5 py-1.5 rounded-full flex items-center gap-1">
                <Star className="size-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium">
                  {restaurant.rating}
                </span>
                <span className="text-xs text-gray-500">
                  ({restaurant.reviews})
                </span>
              </div>

              <div className="absolute top-3 left-3 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                {restaurant.cuisine}
              </div>
            </div>

            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-lg">
                  {restaurant.name}
                </h3>
                <span className="text-red-600 font-medium text-sm">
                  {restaurant.priceRange}
                </span>
              </div>

              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {restaurant.description}
              </p>

              <div className="space-y-2 mb-3">
                <div className="flex items-center gap-2 text-gray-600 text-sm">
                  <MapPin className="size-4" />
                  <span>{restaurant.location}</span>
                </div>

                <div className="flex items-center gap-2 text-gray-600 text-sm">
                  <Clock className="size-4" />
                  <span>{restaurant.openHours}</span>
                </div>

                <div className="flex items-center gap-2 text-gray-600 text-sm">
                  <Phone className="size-4" />
                  <span>{restaurant.phone}</span>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-xs text-gray-500 mb-2">
                  Especialidades:
                </p>
                <div className="flex flex-wrap gap-2">
                  {restaurant.specialties.map((specialty, index) => (
                    <span
                      key={index}
                      className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>

              <button
                onClick={() => onSelectRestaurant(restaurant)}
                className="w-full bg-red-600 text-white py-2.5 rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
              >
                Ver Menu & Reservar
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
