import { useEffect, useState } from 'react';
import { ArrowLeft, Star } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useSession } from '../context/SessionProvider';

interface RestaurantInfo {
  id: number;
  name: string;
  image: string;
}

interface MenuItem {
  id: number;
  title: string;
  image_url?: string | null;
}

interface GalleryReview {
  id: string;
  restaurant_id: number;
  item_id: number;
  item_name: string;
  rating: number;
  comment: string;
  user_id: string;
  user_name: string;
  created_at: string;
}

export function RestaurantGalleryPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSession();

  const restaurantId = Number(id || 0);
  const apiUrl = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '');

  const [restaurant, setRestaurant] = useState<RestaurantInfo | null>(null);
  const [galleryItems, setGalleryItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const [expandedItemId, setExpandedItemId] = useState<number | null>(null);
  const [galleryReviews, setGalleryReviews] = useState<GalleryReview[]>([]);
  const [galleryDrafts, setGalleryDrafts] = useState<Record<number, { rating: number; comment: string }>>({});
  const [galleryError, setGalleryError] = useState('');

  const storageKey = `tukula_gallery_reviews_${restaurantId}`;

  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      const parsed = stored ? JSON.parse(stored) : [];
      setGalleryReviews(Array.isArray(parsed) ? parsed : []);
    } catch {
      setGalleryReviews([]);
    }
  }, [storageKey]);

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
        const galleryEndpoint = apiUrl
          ? `${apiUrl}/restaurants/${restaurantId}/gallery`
          : `/api/restaurants/${restaurantId}/gallery`;

        const [restaurantResponse, galleryResponse] = await Promise.all([
          fetch(restaurantEndpoint),
          fetch(galleryEndpoint),
        ]);

        if (!restaurantResponse.ok) {
          throw new Error('Hotel não encontrado.');
        }

        if (!galleryResponse.ok) {
          throw new Error('Não foi possível carregar a galeria.');
        }

        const restaurantPayload = await restaurantResponse.json();
        const galleryPayload = await galleryResponse.json();

        setRestaurant({
          id: Number(restaurantPayload.id),
          name: restaurantPayload.name || 'Hotel',
          image: restaurantPayload.image_url || restaurantPayload.image || '',
        });

        const items = Array.isArray(galleryPayload.items) ? galleryPayload.items : [];
        setGalleryItems(items);
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : 'Erro ao carregar galeria.');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [apiUrl, restaurantId]);

  const persistGalleryReviews = (reviews: GalleryReview[]) => {
    setGalleryReviews(reviews);
    localStorage.setItem(storageKey, JSON.stringify(reviews));
  };

  const getItemReviews = (itemId: number) => galleryReviews
    .filter((review) => Number(review.item_id) === Number(itemId))
    .sort((left, right) => new Date(right.created_at).getTime() - new Date(left.created_at).getTime());

  const getItemAverageRating = (itemId: number) => {
    const reviews = getItemReviews(itemId);
    if (!reviews.length) return 0;
    return reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / reviews.length;
  };

  const handleDraftChange = (itemId: number, partial: Partial<{ rating: number; comment: string }>) => {
    setGalleryDrafts((prev) => ({
      ...prev,
      [itemId]: {
        rating: partial.rating ?? prev[itemId]?.rating ?? 0,
        comment: partial.comment ?? prev[itemId]?.comment ?? '',
      },
    }));
  };

  const handleSubmitReview = (item: MenuItem) => {
    if (!user) {
      navigate('/login');
      return;
    }

    const draft = galleryDrafts[item.id] ?? { rating: 0, comment: '' };
    if (!draft.rating || !draft.comment.trim()) {
      setGalleryError('Defina a classificação e escreva um comentário para avaliar este item.');
      return;
    }

    setGalleryError('');

    const newReview: GalleryReview = {
      id: `${item.id}-${Date.now()}`,
      restaurant_id: restaurantId,
      item_id: item.id,
      item_name: item.title,
      rating: draft.rating,
      comment: draft.comment.trim(),
      user_id: user.userId,
      user_name: user.name,
      created_at: new Date().toISOString(),
    };

    const nextReviews = [newReview, ...galleryReviews];
    persistGalleryReviews(nextReviews);
    setGalleryDrafts((prev) => ({
      ...prev,
      [item.id]: { rating: 0, comment: '' },
    }));
  };

  return (
    <div className="min-h-full bg-white px-4 py-6 space-y-4">
      <button
        onClick={() => navigate(`/restaurants/${restaurantId}/booking`)}
        className="inline-flex items-center gap-2 text-gray-600"
      >
        <ArrowLeft className="size-5" />
        Voltar ao hotel
      </button>

      <div className="bg-white rounded-2xl border border-gray-200 p-4">
        <h1 className="text-2xl font-bold">Galeria</h1>
        <p className="text-sm text-gray-600 mt-1">{restaurant?.name || 'Hotel'}</p>
      </div>

      {isLoading && <p className="text-gray-600">A carregar galeria...</p>}

      {!isLoading && errorMessage && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-600 text-sm">{errorMessage}</div>
      )}

      {!isLoading && !errorMessage && galleryItems.length === 0 && (
        <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-5 text-sm text-gray-600">
          Este hotel ainda não tem itens para mostrar na galeria.
        </div>
      )}

      {!isLoading && !errorMessage && galleryItems.length > 0 && (
        <div className="space-y-4 pb-6">
          {galleryItems.map((item) => {
            const itemReviews = getItemReviews(item.id);
            const average = getItemAverageRating(item.id);
            const draft = galleryDrafts[item.id] ?? { rating: 0, comment: '' };
            const isExpanded = expandedItemId === item.id;

            return (
              <div key={item.id} className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
                <div className="h-44 w-full">
                  <ImageWithFallback
                    src={item.image_url || restaurant?.image || ''}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">{item.title}</h3>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-sm">
                      <Star className="size-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium text-gray-900">{average ? average.toFixed(1) : 'Novo'}</span>
                      <span className="text-gray-500">({itemReviews.length} avaliações)</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setExpandedItemId(isExpanded ? null : item.id)}
                      className="text-sm font-medium text-red-600 hover:text-red-700"
                    >
                      {isExpanded ? 'Fechar reviews' : 'Ver/Avaliar'}
                    </button>
                  </div>

                  {isExpanded && (
                    <div className="pt-3 border-t border-gray-100 space-y-4">
                      {itemReviews.length === 0 && (
                        <p className="text-sm text-gray-600">Ainda não há reviews para este item.</p>
                      )}

                      {itemReviews.length > 0 && (
                        <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                          {itemReviews.map((review) => (
                            <div key={review.id} className="rounded-xl border border-gray-200 p-3 bg-gray-50">
                              <div className="flex items-center justify-between">
                                <p className="text-sm font-medium text-gray-900">{review.user_name}</p>
                                <div className="flex items-center gap-1">
                                  {[1, 2, 3, 4, 5].map((value) => (
                                    <Star
                                      key={value}
                                      className={`size-3.5 ${review.rating >= value ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                                    />
                                  ))}
                                </div>
                              </div>
                              <p className="text-xs text-gray-500 mt-1">{new Date(review.created_at).toLocaleDateString('pt-PT')}</p>
                              <p className="text-sm text-gray-700 mt-2">{review.comment}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="space-y-3">
                        <p className="text-sm font-medium text-gray-900">Deixe a sua review para este item</p>

                        <div className="flex gap-2">
                          {[1, 2, 3, 4, 5].map((value) => (
                            <button
                              key={value}
                              type="button"
                              onClick={() => handleDraftChange(item.id, { rating: value })}
                              className={`p-1 rounded ${draft.rating >= value ? 'text-yellow-500' : 'text-gray-300 hover:text-yellow-400'}`}
                            >
                              <Star className={`size-5 ${draft.rating >= value ? 'fill-yellow-400' : ''}`} />
                            </button>
                          ))}
                        </div>

                        <textarea
                          value={draft.comment}
                          onChange={(event) => handleDraftChange(item.id, { comment: event.target.value })}
                          placeholder="Escreva a sua opinião sobre este item..."
                          rows={3}
                          className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                        />

                        {galleryError && <p className="text-sm text-red-600">{galleryError}</p>}

                        <button
                          type="button"
                          onClick={() => handleSubmitReview(item)}
                          className="w-full bg-red-600 text-white py-2.5 rounded-xl font-medium hover:bg-red-700 transition-colors"
                        >
                          Publicar review do item
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
