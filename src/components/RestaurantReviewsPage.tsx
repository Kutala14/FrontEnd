import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Star, MessageSquare } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSession } from '../context/SessionProvider';

interface RestaurantInfo {
  id: number;
  name: string;
}

interface ReviewItem {
  id: number;
  user_id: string;
  user_name?: string | null;
  rating: number;
  comment: string;
  response?: string | null;
  created_at: string;
}

export function RestaurantReviewsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { fetchWithAuth } = useSession();

  const [restaurant, setRestaurant] = useState<RestaurantInfo | null>(null);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const restaurantId = Number(id || 0);
  const apiUrl = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '');

  useEffect(() => {
    if (!restaurantId || Number.isNaN(restaurantId)) {
      setErrorMessage('Hotel inválido.');
      setIsLoading(false);
      return;
    }

    const loadData = async () => {
      setIsLoading(true);
      setErrorMessage('');

      try {
        const restaurantEndpoint = apiUrl
          ? `${apiUrl}/restaurants/${restaurantId}`
          : `/api/restaurants/${restaurantId}`;
        const reviewsEndpoint = apiUrl
          ? `${apiUrl}/reviews/?restaurant_id=${restaurantId}`
          : `/api/reviews/?restaurant_id=${restaurantId}`;

        const [restaurantResponse, reviewsResponse] = await Promise.all([
          fetch(restaurantEndpoint),
          fetchWithAuth(reviewsEndpoint, {
            headers: {
              'Content-Type': 'application/json',
            },
          }),
        ]);

        if (!restaurantResponse.ok) {
          throw new Error('Hotel não encontrado.');
        }

        if (!reviewsResponse.ok) {
          throw new Error('Não foi possível carregar avaliações.');
        }

        const restaurantPayload = await restaurantResponse.json();
        const reviewsPayload = await reviewsResponse.json();

        setRestaurant({
          id: Number(restaurantPayload.id),
          name: restaurantPayload.name || 'Hotel',
        });

        const sortedReviews = (Array.isArray(reviewsPayload) ? reviewsPayload : []).sort(
          (left, right) => new Date(right.created_at).getTime() - new Date(left.created_at).getTime(),
        );

        setReviews(sortedReviews);
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : 'Erro ao carregar avaliações.');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [apiUrl, fetchWithAuth, restaurantId]);

  const averageRating = useMemo(() => {
    if (!reviews.length) return 0;
    return reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / reviews.length;
  }, [reviews]);

  return (
    <div className="min-h-full bg-white px-4 py-6 space-y-4">
      <button
        onClick={() => navigate('/restaurants')}
        className="inline-flex items-center gap-2 text-gray-600"
      >
        <ArrowLeft className="size-5" />
        Voltar aos hotéis
      </button>

      <div className="bg-white rounded-2xl border border-gray-200 p-4">
        <h1 className="text-2xl font-bold">Avaliações</h1>
        <p className="text-sm text-gray-600 mt-1">{restaurant?.name || 'Hotel'}</p>

        {!isLoading && !errorMessage && (
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Star className="size-5 fill-yellow-400 text-yellow-400" />
              <span className="font-semibold text-lg">{averageRating.toFixed(1)}</span>
            </div>
            <span className="text-sm text-gray-600">{reviews.length} avaliações</span>
          </div>
        )}
      </div>

      {isLoading && <p className="text-gray-600">A carregar avaliações...</p>}

      {!isLoading && errorMessage && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-600 text-sm">{errorMessage}</div>
      )}

      {!isLoading && !errorMessage && reviews.length === 0 && (
        <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-5 text-sm text-gray-600">
          Ainda não há avaliações para este hotel.
        </div>
      )}

      {!isLoading && !errorMessage && reviews.length > 0 && (
        <div className="space-y-3">
          {reviews.map((review) => (
            <div key={review.id} className="border border-gray-200 rounded-xl p-4 bg-white">
              <div className="flex items-center justify-between gap-3">
                <p className="font-medium text-sm text-gray-900">{review.user_name || review.user_id}</p>
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

              <div className="mt-3 flex items-start gap-2 text-sm text-gray-700">
                <MessageSquare className="size-4 mt-0.5 text-gray-400" />
                <p>{review.comment}</p>
              </div>

              {review.response && (
                <div className="mt-3 p-3 rounded-lg bg-gray-50 border border-gray-200">
                  <p className="text-xs font-semibold text-gray-700 mb-1">Resposta do hotel</p>
                  <p className="text-sm text-gray-700">{review.response}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <button
        onClick={() => navigate(`/restaurants/${restaurantId}/review`)}
        className="w-full bg-red-600 text-white py-3 rounded-xl font-semibold hover:bg-red-700 transition-colors"
      >
        Escrever avaliação
      </button>
    </div>
  );
}
