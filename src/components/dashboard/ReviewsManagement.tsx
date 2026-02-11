import { useState, useEffect } from 'react';
import { Star, MessageSquare, ThumbsUp, Calendar, User } from 'lucide-react';

interface ReviewsManagementProps {
  restaurantId: number;
}

interface Review {
  id: number;
  restaurantId: number;
  customerName: string;
  customerEmail: string;
  rating: number;
  comment: string;
  date: string;
  response?: string;
  responseDate?: string;
}

export function ReviewsManagement({ restaurantId }: ReviewsManagementProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [filter, setFilter] = useState<'all' | '5' | '4' | '3' | '2' | '1'>('all');
  const [respondingTo, setRespondingTo] = useState<number | null>(null);
  const [responseText, setResponseText] = useState('');
  const [stats, setStats] = useState({
    avgRating: 0,
    totalReviews: 0,
    ratings: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  });

  useEffect(() => {
    loadReviews();
  }, [restaurantId]);

  const loadReviews = () => {
    const reviewsData = localStorage.getItem('tukula_reviews');
    const allReviews: Review[] = reviewsData ? JSON.parse(reviewsData) : [];
    
    // Filtrar reviews deste restaurante
    const restaurantReviews = allReviews.filter(r => r.restaurantId === restaurantId);
    
    // Ordenar por data (mais recentes primeiro)
    restaurantReviews.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    setReviews(restaurantReviews);

    // Calcular estatísticas
    const totalReviews = restaurantReviews.length;
    const avgRating = totalReviews > 0
      ? restaurantReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
      : 0;

    const ratings = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    restaurantReviews.forEach(r => {
      ratings[r.rating as keyof typeof ratings]++;
    });

    setStats({ avgRating, totalReviews, ratings });

    // Se não houver reviews, criar alguns exemplos
    if (restaurantReviews.length === 0) {
      const exampleReviews: Review[] = [
        {
          id: 1,
          restaurantId,
          customerName: 'Maria Silva',
          customerEmail: 'maria@email.com',
          rating: 5,
          comment: 'Experiência incrível! A comida estava deliciosa e o atendimento foi excepcional. Recomendo muito!',
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 2,
          restaurantId,
          customerName: 'João Santos',
          customerEmail: 'joao@email.com',
          rating: 4,
          comment: 'Muito bom! O ambiente é agradável e os pratos tradicionais são autênticos. Só achei um pouco demorado o serviço.',
          date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 3,
          restaurantId,
          customerName: 'Ana Ferreira',
          customerEmail: 'ana@email.com',
          rating: 5,
          comment: 'A Muamba de Galinha estava perfeita! Melhor restaurante angolano que já visitei.',
          date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];
      
      const allReviewsWithExamples = [...allReviews, ...exampleReviews];
      localStorage.setItem('tukula_reviews', JSON.stringify(allReviewsWithExamples));
      loadReviews();
    }
  };

  const handleRespond = (reviewId: number) => {
    if (!responseText.trim()) return;

    const reviewsData = localStorage.getItem('tukula_reviews');
    const allReviews: Review[] = reviewsData ? JSON.parse(reviewsData) : [];

    const updatedReviews = allReviews.map(r =>
      r.id === reviewId
        ? { ...r, response: responseText, responseDate: new Date().toISOString() }
        : r
    );

    localStorage.setItem('tukula_reviews', JSON.stringify(updatedReviews));
    
    setResponseText('');
    setRespondingTo(null);
    loadReviews();
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
    return stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;
  };

  const filteredReviews = filter === 'all'
    ? reviews
    : reviews.filter(r => r.rating === parseInt(filter));

  return (
    <div className="p-4 lg:p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Avaliações</h1>
        <p className="text-gray-600">Gerencie o feedback dos seus clientes</p>
      </div>

      {/* Stats Overview */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Average Rating */}
          <div className="text-center lg:text-left">
            <div className="flex flex-col lg:flex-row items-center gap-4">
              <div>
                <div className="text-5xl font-bold text-gray-900 mb-2">
                  {stats.avgRating.toFixed(1)}
                </div>
                <div className="flex justify-center lg:justify-start mb-2">
                  {renderStars(Math.round(stats.avgRating))}
                </div>
                <p className="text-sm text-gray-600">
                  Baseado em {stats.totalReviews} {stats.totalReviews === 1 ? 'avaliação' : 'avaliações'}
                </p>
              </div>
            </div>
          </div>

          {/* Rating Distribution */}
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map(rating => (
              <div key={rating} className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-700 w-8">{rating} ★</span>
                <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500"
                    style={{ width: `${getPercentage(stats.ratings[rating as keyof typeof stats.ratings])}%` }}
                  />
                </div>
                <span className="text-sm text-gray-600 w-12 text-right">
                  {stats.ratings[rating as keyof typeof stats.ratings]}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex gap-2 overflow-x-auto">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
              filter === 'all'
                ? 'bg-gradient-to-r from-red-600 to-yellow-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Todas ({stats.totalReviews})
          </button>
          {[5, 4, 3, 2, 1].map(rating => (
            <button
              key={rating}
              onClick={() => setFilter(rating.toString() as any)}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                filter === rating.toString()
                  ? 'bg-gradient-to-r from-red-600 to-yellow-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {rating} ★ ({stats.ratings[rating as keyof typeof stats.ratings]})
            </button>
          ))}
        </div>
      </div>

      {/* Reviews List */}
      {filteredReviews.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <MessageSquare className="size-16 text-gray-300 mx-auto mb-4" />
          <h3 className="font-semibold text-gray-900 mb-2">Nenhuma avaliação</h3>
          <p className="text-gray-500">
            {filter === 'all'
              ? 'Ainda não há avaliações para o seu restaurante'
              : `Não há avaliações com ${filter} estrelas`
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReviews.map(review => (
            <div key={review.id} className="bg-white rounded-xl border border-gray-200 p-6">
              {/* Review Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-yellow-500 rounded-full flex items-center justify-center text-white font-bold">
                    {review.customerName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{review.customerName}</h4>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar className="size-3" />
                      <span>{new Date(review.date).toLocaleDateString('pt-PT', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}</span>
                    </div>
                  </div>
                </div>
                <div className="flex">{renderStars(review.rating)}</div>
              </div>

              {/* Review Comment */}
              <p className="text-gray-700 mb-4">{review.comment}</p>

              {/* Restaurant Response */}
              {review.response && (
                <div className="bg-gradient-to-r from-red-50 to-yellow-50 border border-red-100 rounded-xl p-4 mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <ThumbsUp className="size-4 text-red-600" />
                    <span className="text-sm font-semibold text-gray-900">Resposta do Restaurante</span>
                    {review.responseDate && (
                      <span className="text-xs text-gray-500">
                        • {new Date(review.responseDate).toLocaleDateString('pt-PT')}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-700">{review.response}</p>
                </div>
              )}

              {/* Response Form */}
              {respondingTo === review.id ? (
                <div className="space-y-3">
                  <textarea
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                    placeholder="Escreva sua resposta..."
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleRespond(review.id)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700"
                    >
                      Enviar Resposta
                    </button>
                    <button
                      onClick={() => {
                        setRespondingTo(null);
                        setResponseText('');
                      }}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : !review.response && (
                <button
                  onClick={() => setRespondingTo(review.id)}
                  className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors"
                >
                  <MessageSquare className="size-4" />
                  Responder
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
