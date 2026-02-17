import { useEffect, useMemo, useState } from 'react';
import { Search, MapPin, Star, ChevronRight, Clock, Phone, DollarSign, Users } from 'lucide-react';
import { Destination, Restaurant } from '../App';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface SearchPageProps {
  initialQuery?: string;
  onSelectDestination: (destination: Destination) => void;
  onSelectRestaurant: (restaurant: Restaurant) => void;
  onOpenExperiences: () => void;
}

interface ExploreSpot {
  id: number;
  name: string;
  location: string;
  description: string;
  image_url?: string | null;
  category: string;
  rating?: number;
  highlights?: string[];
  activities?: string[];
}

interface ExperienceItem {
  id: number;
  title: string;
  description: string | null;
  image_url: string | null;
  category: string | null;
  rating: number;
  reviews_count: number;
  duration?: string | null;
  price_from?: number | null;
  min_group_size?: number | null;
  max_group_size?: number | null;
}

const defaultImage =
  'https://images.unsplash.com/photo-1562859422-29f5c0f4b24d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080';

const categoryFallbackImages: Record<string, string> = {
  Praia: 'https://images.unsplash.com/photo-1658872739589-0691c8039617?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
  Natureza: 'https://images.unsplash.com/photo-1636380778575-34508e634145?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
  Cultura: 'https://images.unsplash.com/photo-1515657241610-a6b33f0f6c5a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
  Aventura: 'https://images.unsplash.com/photo-1612222780225-04d3384823fd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
  'Vida Selvagem': 'https://images.unsplash.com/photo-1729359035276-189519a4b072?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
  Cidade: defaultImage,
};

const normalizeCategory = (value: string | null | undefined) => {
  const normalized = String(value || '').trim().toLowerCase();
  if (!normalized) return 'Cultura';
  if (normalized === 'cidade') return 'Cidade';
  if (normalized === 'natureza') return 'Natureza';
  if (normalized === 'aventura') return 'Aventura';
  if (normalized === 'praia') return 'Praia';
  if (normalized === 'vida selvagem' || normalized === 'vidaselvagem') return 'Vida Selvagem';
  if (normalized === 'cultura') return 'Cultura';
  return String(value || '').trim();
};

const resolveExploreImage = (imageUrl: string | null | undefined, category: string) => {
  const normalizedCategory = normalizeCategory(category);
  if (imageUrl && imageUrl.trim()) return imageUrl;
  return categoryFallbackImages[normalizedCategory] || defaultImage;
};

export function SearchPage({ initialQuery = '', onSelectDestination, onSelectRestaurant, onOpenExperiences }: SearchPageProps) {
  const [query, setQuery] = useState(initialQuery);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [experiences, setExperiences] = useState<ExperienceItem[]>([]);

  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    const loadSearchSources = async () => {
      setIsLoading(true);
      setErrorMessage('');

      try {
        const exploreEndpoint = apiUrl ? `${apiUrl}/explore/` : '/api/explore/';
        const restaurantsEndpoint = apiUrl ? `${apiUrl}/restaurants/` : '/api/restaurants/';
        const experiencesEndpoint = apiUrl ? `${apiUrl}/experiences/` : '/api/experiences/';

        const [exploreResponse, restaurantsResponse, experiencesResponse] = await Promise.all([
          fetch(exploreEndpoint),
          fetch(restaurantsEndpoint),
          fetch(experiencesEndpoint),
        ]);

        if (!exploreResponse.ok || !restaurantsResponse.ok || !experiencesResponse.ok) {
          throw new Error('Erro ao carregar dados de pesquisa');
        }

        const [exploreData, restaurantsData, experiencesData] = await Promise.all([
          exploreResponse.json(),
          restaurantsResponse.json(),
          experiencesResponse.json(),
        ]);

        const mappedDestinations: Destination[] = (Array.isArray(exploreData) ? exploreData : []).map((spot: ExploreSpot) => ({
          id: 100000 + Number(spot.id),
          name: spot.name,
          location: spot.location,
          description: spot.description,
          image: resolveExploreImage(spot.image_url, spot.category || ''),
          rating: Number(spot.rating || 0),
          category: normalizeCategory(spot.category),
          highlights: Array.isArray(spot.highlights) && spot.highlights.length > 0 ? spot.highlights : ['Local da comunidade'],
          activities: Array.isArray(spot.activities) && spot.activities.length > 0 ? spot.activities : ['Explorar'],
        }));

        setDestinations(mappedDestinations);
        setRestaurants(Array.isArray(restaurantsData) ? restaurantsData : []);
        setExperiences(Array.isArray(experiencesData) ? experiencesData : []);
      } catch {
        setErrorMessage('Não foi possível carregar os dados de pesquisa.');
      } finally {
        setIsLoading(false);
      }
    };

    loadSearchSources();
  }, [apiUrl]);

  const normalizedQuery = query.trim().toLowerCase();

  const destinationResults = useMemo(() => {
    if (!normalizedQuery) return [];
    return destinations.filter((destination) => (
      destination.name.toLowerCase().includes(normalizedQuery)
      || destination.location.toLowerCase().includes(normalizedQuery)
      || destination.description.toLowerCase().includes(normalizedQuery)
      || destination.category.toLowerCase().includes(normalizedQuery)
    ));
  }, [destinations, normalizedQuery]);

  const restaurantResults = useMemo(() => {
    if (!normalizedQuery) return [];
    return restaurants.filter((restaurant) => (
      restaurant.name.toLowerCase().includes(normalizedQuery)
      || restaurant.cuisine.toLowerCase().includes(normalizedQuery)
      || restaurant.description.toLowerCase().includes(normalizedQuery)
      || restaurant.location.toLowerCase().includes(normalizedQuery)
    ));
  }, [restaurants, normalizedQuery]);

  const experienceResults = useMemo(() => {
    if (!normalizedQuery) return [];
    return experiences.filter((experience) => (
      String(experience.title || '').toLowerCase().includes(normalizedQuery)
      || String(experience.description || '').toLowerCase().includes(normalizedQuery)
      || String(experience.category || '').toLowerCase().includes(normalizedQuery)
    ));
  }, [experiences, normalizedQuery]);

  const hasResults = destinationResults.length > 0 || restaurantResults.length > 0 || experienceResults.length > 0;

  return (
    <div className="px-4 py-6 space-y-5">
      <div>
        <h2 className="text-2xl font-bold mb-1">Pesquisa</h2>
        <p className="text-gray-600">Encontre destinos, restaurantes e experiências</p>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Ex: Luanda, marisco, aventura"
          className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
        />
      </div>

      {errorMessage && (
        <div className="px-4 py-3 rounded-xl border bg-red-50 border-red-200 text-red-700 text-sm">
          {errorMessage}
        </div>
      )}

      {isLoading && <p className="text-sm text-gray-600">A carregar dados para pesquisa...</p>}

      {!isLoading && normalizedQuery && !hasResults && (
        <div className="px-4 py-5 rounded-xl border border-gray-200 bg-white text-sm text-gray-600">
          Sem resultados para “{query.trim()}”.
        </div>
      )}

      {!isLoading && !normalizedQuery && (
        <div className="px-4 py-5 rounded-xl border border-gray-200 bg-white text-sm text-gray-600">
          Digite algo para começar a pesquisa.
        </div>
      )}

      {!isLoading && destinationResults.length > 0 && (
        <section className="space-y-3">
          <h3 className="font-semibold">Destinos ({destinationResults.length})</h3>
          <div className="space-y-3">
            {destinationResults.slice(0, 6).map((destination) => (
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
                    <span className="text-xs font-medium">{destination.rating.toFixed(1)}</span>
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
        </section>
      )}

      {!isLoading && restaurantResults.length > 0 && (
        <section className="space-y-3">
          <h3 className="font-semibold">Restaurantes ({restaurantResults.length})</h3>
          <div className="space-y-3">
            {restaurantResults.slice(0, 6).map((restaurant) => (
              <div
                key={restaurant.id}
                className="bg-white rounded-xl overflow-hidden border border-gray-100 hover:border-red-200 transition-all hover:shadow-md"
              >
                <div className="relative h-48">
                  <ImageWithFallback
                    src={restaurant.image || defaultImage}
                    alt={restaurant.name}
                    className="w-full h-full object-cover"
                  />

                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2.5 py-1.5 rounded-full flex items-center gap-1">
                    <Star className="size-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{Number(restaurant.rating || 0).toFixed(1)}</span>
                    <span className="text-xs text-gray-500">({restaurant.reviews || 0})</span>
                  </div>

                  <div className="absolute top-3 left-3 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                    {restaurant.cuisine}
                  </div>
                </div>

                <div className="p-4">
                  <div className="flex items-start justify-between mb-2 gap-2">
                    <h4 className="font-semibold text-lg">{restaurant.name}</h4>
                    <span className="text-red-600 font-medium text-sm">{restaurant.priceRange}</span>
                  </div>

                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{restaurant.description}</p>

                  <div className="space-y-2 mb-3">
                    <div className="flex items-center gap-2 text-gray-600 text-sm">
                      <MapPin className="size-4" />
                      <span>{restaurant.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 text-sm">
                      <Clock className="size-4" />
                      <span>{restaurant.openHours || '-'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 text-sm">
                      <Phone className="size-4" />
                      <span>{restaurant.phone || '-'}</span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-xs text-gray-500 mb-2">Especialidades:</p>
                    <div className="flex flex-wrap gap-2">
                      {(restaurant.specialties || []).slice(0, 4).map((specialty, index) => (
                        <span
                          key={`${restaurant.id}-${index}`}
                          className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full"
                        >
                          {specialty}
                        </span>
                      ))}
                      {(!restaurant.specialties || restaurant.specialties.length === 0) && (
                        <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">Sem especialidades</span>
                      )}
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
        </section>
      )}

      {!isLoading && experienceResults.length > 0 && (
        <section className="space-y-3 pb-2">
          <h3 className="font-semibold">Experiências ({experienceResults.length})</h3>
          <div className="space-y-4">
            {experienceResults.slice(0, 6).map((experience) => (
              <div
                key={experience.id}
                className="bg-white rounded-xl overflow-hidden border border-gray-100 hover:border-red-200 transition-all hover:shadow-md"
              >
                <div className="relative h-48">
                  <ImageWithFallback
                    src={experience.image_url || defaultImage}
                    alt={experience.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2.5 py-1.5 rounded-full flex items-center gap-1">
                    <Star className="size-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{Number(experience.rating || 0).toFixed(1)}</span>
                    <span className="text-xs text-gray-500">({experience.reviews_count || 0})</span>
                  </div>
                  {experience.category && (
                    <div className="absolute top-3 left-3 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                      {experience.category}
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <h4 className="font-semibold text-lg mb-2">{experience.title}</h4>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{experience.description || 'Sem descrição disponível.'}</p>

                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="flex items-center gap-1.5 text-gray-600">
                      <Clock className="size-4" />
                      <span className="text-xs">{experience.duration || '-'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-600">
                      <Users className="size-4" />
                      <span className="text-xs">{experience.min_group_size || 1}-{experience.max_group_size || 1}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-600">
                      <DollarSign className="size-4" />
                      <span className="text-xs font-medium">
                        {experience.price_from != null ? `Desde $${experience.price_from}` : 'Sob consulta'}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={onOpenExperiences}
                    className="w-full bg-red-600 text-white py-2.5 rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                  >
                    Ver na página de experiências
                    <ChevronRight className="size-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}