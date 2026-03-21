import { useEffect, useState } from 'react';
import { MapPin, Star, ChevronRight, Search, Sparkles, ArrowRight, Compass } from 'lucide-react';
import { Destination } from '../App';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface HomeProps {
  onNavigate: (path: string) => void;
  onSelectDestination: (destination: Destination) => void;
  onOpenSearch: (query: string) => void;
  onSelectRestaurant: (restaurantId: number) => void;
}

export function Home({ onNavigate, onSelectDestination, onOpenSearch, onSelectRestaurant }: HomeProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [featuredDestinations, setFeaturedDestinations] = useState<Destination[]>([]);
  const [isLoadingFeatured, setIsLoadingFeatured] = useState(true);
  const [featuredError, setFeaturedError] = useState('');
  const [homeRestaurants, setHomeRestaurants] = useState<Array<{
    id: number;
    name: string;
    image: string;
    cuisine: string;
    rating: number;
    specialties: string[];
  }>>([]);
  const [isLoadingRestaurants, setIsLoadingRestaurants] = useState(true);
  const [restaurantsError, setRestaurantsError] = useState('');

  const apiUrl = import.meta.env.VITE_API_URL;

  const resolveExploreImage = (imageUrl: string | null | undefined, category: string) => {
    if (imageUrl && imageUrl.trim()) return imageUrl;
    return '';
  };

  useEffect(() => {
    const loadFeatured = async () => {
      setIsLoadingFeatured(true);
      setFeaturedError('');

      try {
        const endpoint = apiUrl ? `${apiUrl}/explore/` : '/api/explore/';
        const response = await fetch(endpoint);

        if (!response.ok) {
          throw new Error('Erro ao carregar locais em destaque');
        }

        const data = await response.json();
        const mapped: Destination[] = (Array.isArray(data) ? data : []).map((spot: any) => ({
          id: 100000 + Number(spot.id),
          name: spot.name,
          location: spot.location,
          description: spot.description,
          image: resolveExploreImage(spot.image_url, spot.category || ''),
          rating: Number(spot.rating || 0),
          category: spot.category || 'Cultura',
          highlights: Array.isArray(spot.highlights) && spot.highlights.length > 0 ? spot.highlights : ['Local da comunidade'],
          activities: Array.isArray(spot.activities) && spot.activities.length > 0 ? spot.activities : ['Explorar'],
        }));

        setFeaturedDestinations(mapped.slice(0, 3));
      } catch {
        setFeaturedError('Não foi possível carregar os destaques da comunidade.');
        setFeaturedDestinations([]);
      } finally {
        setIsLoadingFeatured(false);
      }
    };

    loadFeatured();
  }, [apiUrl]);

  useEffect(() => {
    const loadHomeRestaurants = async () => {
      setIsLoadingRestaurants(true);
      setRestaurantsError('');

      try {
        const endpoint = apiUrl ? `${apiUrl}/restaurants/` : '/api/restaurants/';
        const response = await fetch(endpoint);

        if (!response.ok) {
          throw new Error('Erro ao carregar hotéis');
        }

        const data = await response.json();
        const mapped = (Array.isArray(data) ? data : []).map((item: any) => ({
          id: item.id,
          name: item.name,
          image: item.image || item.image_url || '',
          cuisine: item.cuisine || 'Hotel',
          rating: Number(item.rating || 0),
          specialties: Array.isArray(item.specialties) ? item.specialties : [],
        }));

        setHomeRestaurants(mapped.slice(0, 10));
      } catch {
        setRestaurantsError('Não foi possível carregar hotéis.');
        setHomeRestaurants([]);
      } finally {
        setIsLoadingRestaurants(false);
      }
    };

    loadHomeRestaurants();
  }, [apiUrl]);

  return (
    <div className="px-4 py-6 space-y-6">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
        <input
          type="text"
          placeholder="Pesquisar destinos, hotéis..."
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              onOpenSearch(searchQuery.trim());
            }
          }}
          onFocus={() => {
            if (!searchQuery.trim()) {
              onOpenSearch('');
            }
          }}
          className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
        />
      </div>

      {/* Hero Section */}
      <div className="relative mx-[10px] h-72 sm:h-80 lg:h-96 rounded-2xl sm:rounded-3xl overflow-hidden border border-white/20 shadow-[0_24px_60px_-28px_rgba(0,0,0,0.65)]">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1562859422-29f5c0f4b24d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdWFuZGElMjBhbmdvbGElMjBjaXR5JTIwc2t5bGluZXxlbnwxfHx8fDE3NjgwNjMxODh8MA&ixlib=rb-4.1.0&q=80&w=1080"
          alt="Angola"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/88 via-black/62 to-red-950/70" />
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to right, rgba(15, 23, 42, 0.78) 0%, rgba(15, 23, 42, 0.48) 42%, rgba(127, 29, 29, 0.60) 100%)' }}
        />
        <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-black/80 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(253,224,71,0.35),transparent_40%),radial-gradient(circle_at_80%_80%,rgba(239,68,68,0.35),transparent_35%)]" />

        <div className="absolute top-4 inset-x-0 px-4 sm:px-8 flex items-center justify-between text-white z-20">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-md text-xs font-medium tracking-wide"
            style={{ backgroundColor: 'rgba(2, 6, 23, 0.58)' }}
          >
            <Sparkles className="size-3.5" />
            Curadoria Tukula
          </div>
          <div
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full backdrop-blur-md text-xs font-medium"
            style={{ backgroundColor: 'rgba(2, 6, 23, 0.58)' }}
          >
            <Compass className="size-3.5" />
            {featuredDestinations.length} destinos em destaque
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-0 text-white z-20">
          <div className="mx-[10px] mb-[10px] px-4 py-5 sm:px-8 sm:py-6">
            <h2 className="text-3xl sm:text-4xl font-black leading-tight mb-2 tracking-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">Bem-vindo ao Tukula</h2>
            <p className="text-sm sm:text-base text-white/95 max-w-2xl mb-4 drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]">
              Descubra hotéis, experiências e destinos com um visual renovado para planejar sua próxima aventura.
            </p>

            <div className="flex items-center gap-2.5 flex-wrap mt-[10px]">
              <div
                className="inline-flex items-center px-3 py-2 rounded-xl backdrop-blur-md text-xs sm:text-sm font-medium text-white/95"
                style={{ backgroundColor: 'rgba(2, 6, 23, 0.55)' }}
              >
                {homeRestaurants.length} hotéis disponíveis
              </div>
            </div>
          </div>
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

      {/* Hotéis em destaque */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">Hotéis</h3>
          <button
            onClick={() => onNavigate('/restaurants')}
            className="text-sm text-red-600 flex items-center gap-1"
          >
            Ver todos
            <ChevronRight className="size-4" />
          </button>
        </div>

        {isLoadingRestaurants && <p className="text-sm text-gray-600">A carregar hotéis...</p>}
        {!isLoadingRestaurants && restaurantsError && <p className="text-sm text-red-600">{restaurantsError}</p>}

        {!isLoadingRestaurants && !restaurantsError && (
          <div className="flex items-stretch gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
            {homeRestaurants.map((restaurant) => (
              <button
                key={restaurant.id}
                onClick={() => onSelectRestaurant(restaurant.id)}
                className="flex-none w-[300px] h-[200px] bg-white rounded-xl overflow-hidden border border-gray-100 hover:border-red-200 transition-colors flex flex-col"
                style={{
                  width: '300px',
                  minWidth: '300px',
                  maxWidth: '300px',
                  height: '230px',
                  minHeight: '200px',
                  maxHeight: '230px',
                }}
              >
                <div className="relative h-[130px] flex-none" style={{ height: '130px', minHeight: '130px', maxHeight: '130px' }}>
                  <ImageWithFallback
                    src={restaurant.image}
                    alt={restaurant.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full flex items-center gap-1">
                    <Star className="size-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs font-medium">{restaurant.rating.toFixed(1)}</span>
                  </div>
                </div>
                <div className="p-3 text-left flex-1">
                  <p className="font-semibold text-sm truncate">{restaurant.name}</p>
                  <p className="text-xs text-gray-500 mt-1">{restaurant.cuisine}</p>
                  <p className="text-[11px] text-gray-600 mt-1 truncate">
                    {restaurant.specialties.length > 0
                      ? `Especialidades: ${restaurant.specialties.slice(0, 2).join(' • ')}`
                      : 'Especialidades: não informadas'}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Featured Destinations */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">Destinos Populares</h3>
          <button
            onClick={() => onNavigate('/explore')}
            className="text-sm text-red-600 flex items-center gap-1"
          >
            Ver todos
            <ChevronRight className="size-4" />
          </button>
        </div>
        <div className="space-y-3">
          {isLoadingFeatured && (
            <div className="text-sm text-gray-600">A carregar destinos em destaque...</div>
          )}

          {!isLoadingFeatured && featuredError && (
            <div className="text-sm text-red-600">{featuredError}</div>
          )}

          {!isLoadingFeatured && !featuredError && featuredDestinations.length === 0 && (
            <div className="text-sm text-gray-600">Ainda não há locais publicados para destaque.</div>
          )}

          {!isLoadingFeatured && !featuredError && featuredDestinations.map((destination) => (
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