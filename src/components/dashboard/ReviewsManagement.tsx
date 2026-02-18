import { useState, useEffect } from 'react';
import { Star, Trash2 } from 'lucide-react';
import { useSession } from '../../context/SessionProvider';

interface ReviewsManagementProps {
  restaurantId: number;
}

interface Review {
  id: number;
  user_id: string;
  user_name?: string;
  restaurant_id: number;
  rating: number;
  comment: string;
  created_at: string;
  updated_at?: string;
  visit_date?: string | null;
  experience_type?: string | null;
  highlights?: string[];
  response?: string;
  response_date?: string;
}

export function ReviewsManagement({ restaurantId }: ReviewsManagementProps) {
  const { fetchWithAuth } = useSession();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [filter, setFilter] = useState<'all' | '5' | '4' | '3' | '2' | '1'>('all');
  const [respondingTo, setRespondingTo] = useState<number | null>(null);
  const [responseText, setResponseText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    avgRating: 0,
    totalReviews: 0,
    ratings: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  });

  useEffect(() => {
    loadReviews();
  }, [restaurantId]);

  const apiBase = ((import.meta.env.VITE_API_URL as string | undefined) ?? '').replace(/\/$/, '');

  const loadReviews = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const endpoint = `${apiBase}/reviews/?restaurant_id=${restaurantId}`;
      const response = await fetchWithAuth(endpoint);

      if (!response.ok) {
        throw new Error('Erro ao carregar reviews');
      }

      const data: Review[] = await response.json();

      const sorted = data.sort(
        (a, b) =>
          new Date(b.created_at).getTime() -
          new Date(a.created_at).getTime()
      );

      setReviews(sorted);

      calculateStats(sorted);
    } catch (error) {
      console.error("Erro ao carregar reviews:", error);
      setError('Não foi possível carregar as avaliações.');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = (restaurantReviews: Review[]) => {
    const totalReviews = restaurantReviews.length;

    const avgRating =
      totalReviews > 0
        ? restaurantReviews.reduce((sum, r) => sum + r.rating, 0) /
          totalReviews
        : 0;

    const ratings = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

    restaurantReviews.forEach(r => {
      ratings[r.rating as keyof typeof ratings]++;
    });

    setStats({ avgRating, totalReviews, ratings });
  };

  const handleRespond = async (reviewId: number) => {
    if (!responseText.trim()) return;

    try {
      const response = await fetchWithAuth(`${apiBase}/reviews/${reviewId}/response`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          response: responseText,
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao responder review');
      }

      setResponseText('');
      setRespondingTo(null);
      loadReviews();
    } catch (error) {
      console.error("Erro ao responder review:", error);
      setError('Não foi possível responder esta avaliação.');
    }
  };

  const handleDeleteReview = async (reviewId: number) => {
    try {
      const response = await fetchWithAuth(`${apiBase}/reviews/${reviewId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Erro ao apagar review');
      }

      loadReviews();
    } catch (error) {
      console.error('Erro ao apagar review:', error);
      setError('Não foi possível apagar esta avaliação.');
    }
  };

  const handleDeleteResponse = async (reviewId: number) => {
    try {
      const response = await fetchWithAuth(`${apiBase}/reviews/${reviewId}/response`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Erro ao remover resposta');
      }

      loadReviews();
    } catch (error) {
      console.error('Erro ao remover resposta:', error);
      setError('Não foi possível remover a resposta.');
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`size-4 ${
          i < rating
            ? 'text-yellow-400 fill-yellow-400'
            : 'text-gray-300'
        }`}
      />
    ));
  };

  const getPercentage = (count: number) => {
    return stats.totalReviews > 0
      ? (count / stats.totalReviews) * 100
      : 0;
  };

  const filteredReviews =
    filter === 'all'
      ? reviews
      : reviews.filter(r => r.rating === parseInt(filter));

  if (isLoading) {
    return (
      <div className="p-4 lg:p-8">
        <p className="text-gray-600">A carregar avaliações...</p>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 space-y-6">
      <h1 className="text-2xl font-bold">Avaliações</h1>
      {error && <p className="text-sm text-red-600">{error}</p>}

      {/* Stats */}
      <div>
        <div className="text-4xl font-bold">
          {stats.avgRating.toFixed(1)}
        </div>
        <div className="flex">
          {renderStars(Math.round(stats.avgRating))}
        </div>
        <p>
          Baseado em {stats.totalReviews} avaliações
        </p>
      </div>

      {/* Filtros */}
      <div className="flex gap-2">
        <button onClick={() => setFilter('all')}>
          Todas ({stats.totalReviews})
        </button>
        {[5, 4, 3, 2, 1].map(rating => (
          <button
            key={rating}
            onClick={() =>
              setFilter(rating.toString() as any)
            }
          >
            {rating} ★ ({stats.ratings[rating as keyof typeof stats.ratings]})
          </button>
        ))}
      </div>

      {/* Lista */}
      {filteredReviews.map(review => (
        <div key={review.id} className="border p-4 rounded-lg">
          <div className="flex justify-between gap-4">
            <div>
              <p className="font-semibold">
                Usuário: {review.user_name || review.user_id}
              </p>
              <p className="text-sm text-gray-500">
                {new Date(review.created_at).toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex">{renderStars(review.rating)}</div>
              <button
                onClick={() => handleDeleteReview(review.id)}
                className="text-red-600 hover:text-red-700"
                title="Apagar avaliação"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          </div>

          <p className="mt-2">{review.comment}</p>

          {review.response && (
            <div className="bg-gray-100 p-3 rounded mt-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold">Resposta do Hotel</p>
                <button
                  onClick={() => handleDeleteResponse(review.id)}
                  className="text-xs text-red-600 hover:text-red-700"
                >
                  Remover resposta
                </button>
              </div>
              <p>{review.response}</p>
            </div>
          )}

          {!review.response && (
            <div className="mt-3">
              {respondingTo === review.id ? (
                <>
                  <textarea
                    value={responseText}
                    onChange={(e) =>
                      setResponseText(e.target.value)
                    }
                    className="w-full border p-2 rounded"
                  />
                  <button
                    onClick={() =>
                      handleRespond(review.id)
                    }
                    className="mt-2 bg-green-600 text-white px-4 py-2 rounded"
                  >
                    Enviar Resposta
                  </button>
                </>
              ) : (
                <button
                  onClick={() =>
                    setRespondingTo(review.id)
                  }
                  className="text-red-600 mt-2"
                >
                  Responder
                </button>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
