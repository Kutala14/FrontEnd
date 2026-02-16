import { useState, useEffect } from 'react';
import { MapPin, Star, Clock, Phone, ChevronRight } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useSession } from '../context/SessionProvider';

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
  const [isReviewsOpen, setIsReviewsOpen] = useState(false);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsError, setReviewsError] = useState('');
  const [reviewsRestaurantName, setReviewsRestaurantName] = useState('');
  const [reviews, setReviews] = useState<Array<{
    id: number;
    user_id: string;
    user_name?: string | null;
    rating: number;
    comment: string;
    response?: string | null;
    created_at: string;
  }>>([]);
  const { fetchWithAuth } = useSession();

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL;
        const endpoint = apiUrl ? `${apiUrl}/restaurants/` : '/api/restaurants';

        const response = await fetchWithAuth(endpoint, {
          headers: {
            'Content-Type': 'application/json',
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
  }, [fetchWithAuth]);

  const normalizeCuisine = (value: string | null | undefined) => String(value || '').trim().toLowerCase();

  const cuisines = ['Todas', ...(() => {
    const seen = new Set<string>();
    const values: string[] = [];
    restaurants.forEach((restaurant) => {
      const cuisine = String(restaurant.cuisine || '').trim();
      if (!cuisine) return;
      const key = normalizeCuisine(cuisine);
      if (seen.has(key)) return;
      seen.add(key);
      values.push(cuisine);
    });
    return values;
  })()];

  const filteredRestaurants = restaurants.filter(
    restaurant =>
      selectedCuisine === 'Todas' ||
      normalizeCuisine(restaurant.cuisine) === normalizeCuisine(selectedCuisine)
  );

  const loadRestaurantReviews = async (restaurant: Restaurant) => {
    try {
      setReviewsError('');
      setReviews([]);
      setReviewsRestaurantName(restaurant.name);
      setIsReviewsOpen(true);
      setReviewsLoading(true);

      const apiUrl = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '');
      const endpoint = apiUrl
        ? `${apiUrl}/reviews/?restaurant_id=${restaurant.id}`
        : `/api/reviews/?restaurant_id=${restaurant.id}`;

      const response = await fetchWithAuth(endpoint, {
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar avaliações');
      }

      const data = await response.json();
      const sorted = (Array.isArray(data) ? data : []).sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setReviews(sorted);
    } catch (err) {
      console.error(err);
      setReviewsError('Erro ao carregar avaliações deste restaurante');
    } finally {
      setReviewsLoading(false);
    }
  };

  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    : 0;

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-600">
        Carregando restaurantes...
      </div>
    );
  }

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

              <button
                type="button"
                onClick={() => loadRestaurantReviews(restaurant)}
                className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2.5 py-1.5 rounded-full flex items-center gap-1 hover:bg-white transition-colors"
              >
                <Star className="size-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium">
                  {restaurant.rating}
                </span>
                <span className="text-xs text-gray-500">
                  ({restaurant.reviews})
                </span>
              </button>

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

      {isReviewsOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl max-h-[85vh] overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
              <div>
                <h3 className="font-semibold text-lg">Avaliações</h3>
                <p className="text-sm text-gray-600">{reviewsRestaurantName}</p>
              </div>
              <button
                type="button"
                onClick={() => setIsReviewsOpen(false)}
                className="px-3 py-1.5 rounded-lg text-sm bg-gray-100 hover:bg-gray-200"
              >
                Fechar
              </button>
            </div>

            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Star className="size-4 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold">{averageRating.toFixed(1)}</span>
              </div>
              <span className="text-sm text-gray-600">{reviews.length} avaliações</span>
            </div>

            <div className="overflow-y-auto max-h-[60vh] p-5 space-y-4">
              {reviewsLoading && (
                <p className="text-gray-600">A carregar avaliações...</p>
              )}

              {!reviewsLoading && reviewsError && (
                <p className="text-red-600 text-sm">{reviewsError}</p>
              )}

              {!reviewsLoading && !reviewsError && reviews.length === 0 && (
                <p className="text-gray-600">Ainda não há avaliações para este restaurante.</p>
              )}

              {!reviewsLoading && !reviewsError && reviews.map((review) => (
                <div key={review.id} className="border border-gray-200 rounded-xl p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium text-sm text-gray-900">
                      {review.user_name || review.user_id}
                    </p>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((value) => (
                        <Star
                          key={value}
                          className={`size-3.5 ${review.rating >= value ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(review.created_at).toLocaleDateString('pt-PT')}
                  </p>
                  <p className="text-sm text-gray-700 mt-2">{review.comment}</p>

                  {review.response && (
                    <div className="mt-3 p-3 rounded-lg bg-gray-50 border border-gray-200">
                      <p className="text-xs font-semibold text-gray-700 mb-1">Resposta do restaurante</p>
                      <p className="text-sm text-gray-700">{review.response}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
