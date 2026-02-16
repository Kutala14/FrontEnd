import { useMemo, useState } from 'react';
import { ArrowLeft, Star, CheckCircle, MessageSquare, Calendar, User, Mail, Sparkles } from 'lucide-react';
import { Restaurant } from '../App';
import { UserSession } from '../types/session';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface RestaurantReviewProps {
  restaurant: Restaurant;
  onBack: () => void;
  onGoHome: () => void;
  userSession: UserSession | null;
  onRequireAuth: () => void;
}

interface ReviewFormState {
  rating: number;
  visitDate: string;
  experienceType: string;
  highlights: string[];
  comment: string;
}

export function RestaurantReview({ restaurant, onBack, onGoHome, userSession, onRequireAuth }: RestaurantReviewProps) {
  const [reviewData, setReviewData] = useState<ReviewFormState>({
    rating: 0,
    visitDate: '',
    experienceType: 'Jantar com amigos',
    highlights: [],
    comment: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedUser, setSubmittedUser] = useState<{ name: string; email: string } | null>(null);

  const highlightOptions = useMemo(() => [
    'Serviço impecável',
    'Sabores autênticos',
    'Ambiente acolhedor',
    'Bom custo-benefício',
    'Carta de vinhos incrível',
    'Ideal para famílias'
  ], []);

  const experienceTypes = [
    'Jantar com amigos',
    'Encontro romântico',
    'Família',
    'Negócios',
    'Viagem solo'
  ];

  const handleToggleHighlight = (highlight: string) => {
    setReviewData((prev) => ({
      ...prev,
      highlights: prev.highlights.includes(highlight)
        ? prev.highlights.filter((item) => item !== highlight)
        : [...prev.highlights, highlight]
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!reviewData.rating || !reviewData.comment.trim()) return;
    if (!userSession) {
      onRequireAuth();
      return;
    }

    setIsSubmitting(true);
    const newReview = {
      id: Date.now(),
      restaurantId: restaurant.id,
      restaurantName: restaurant.name,
      rating: reviewData.rating,
      comment: reviewData.comment.trim(),
      highlights: reviewData.highlights,
      visitDate: reviewData.visitDate,
      experienceType: reviewData.experienceType,
      customerName: userSession.name,
      customerEmail: userSession.email,
      customerId: userSession.userId,
      createdAt: new Date().toISOString()
    };

    try {
      const existing = localStorage.getItem('tukula_reviews');
      const parsed = existing ? JSON.parse(existing) : [];
      localStorage.setItem('tukula_reviews', JSON.stringify([newReview, ...parsed]));

      const apiUrl = import.meta.env.VITE_API_URL as string | undefined;
      if (apiUrl) {
        try {
          await fetch(`${apiUrl}/reviews/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              restaurant_id: restaurant.id,
              rating: reviewData.rating,
              comment: reviewData.comment.trim(),
              visit_date: reviewData.visitDate,
              experience_type: reviewData.experienceType,
              highlights: reviewData.highlights,
              customer_name: userSession.name,
              customer_email: userSession.email
            })
          });
        } catch (error) {
          console.error('Erro ao sincronizar review com o servidor:', error);
        }
      }

      setSubmittedUser({ name: userSession.name, email: userSession.email });
      setIsSubmitted(true);
    } catch (error) {
      console.error('Erro ao guardar review:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderRatingSelector = () => (
    <div className="flex flex-col gap-3">
      <span className="text-sm text-gray-600">Como classifica a sua experiência?</span>
      <div className="flex gap-3">
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setReviewData((prev) => ({ ...prev, rating: value }))}
            className={`flex flex-col items-center gap-1 rounded-2xl border px-4 py-3 transition-colors ${
              reviewData.rating === value
                ? 'border-yellow-400 bg-yellow-50 text-yellow-700'
                : 'border-gray-200 hover:border-yellow-200'
            }`}
          >
            <Star
              className={`size-6 ${
                reviewData.rating >= value ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
              }`}
            />
            <span className="text-xs font-medium">{value} ★</span>
          </button>
        ))}
      </div>
    </div>
  );

  const renderLoginRequired = () => (
    <div className="px-4 py-10 text-center space-y-4">
      <h2 className="text-2xl font-bold">Entre na sua conta</h2>
      <p className="text-gray-600">
        Para deixar uma avaliação precisa estar autenticado. Isto ajuda-nos a manter a comunidade segura.
      </p>
      <div className="flex flex-col gap-3 max-w-sm mx-auto">
        <button
          onClick={onRequireAuth}
          className="w-full bg-red-600 text-white py-3 rounded-xl font-semibold hover:bg-red-700 transition-colors"
        >
          Entrar ou criar conta
        </button>
        <button
          onClick={onBack}
          className="w-full bg-gray-100 text-gray-800 py-3 rounded-xl font-medium hover:bg-gray-200 transition-colors"
        >
          Voltar ao restaurante
        </button>
      </div>
    </div>
  );

  if (isSubmitted) {
    const reviewer = submittedUser ?? (userSession ? { name: userSession.name, email: userSession.email } : null);
    return (
      <div className="min-h-full bg-white flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-green-50 rounded-full p-6 mb-6">
          <CheckCircle className="size-16 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Obrigado pela sua avaliação!</h2>
        <p className="text-gray-600 mb-6 max-w-lg">
          A sua opinião ajuda outros viajantes a descobrirem experiências autênticas e apoia os restaurantes
          a melhorarem continuamente.
        </p>

        <div className="w-full max-w-lg bg-gray-50 rounded-2xl p-4 text-left space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Restaurante</span>
            <span className="font-medium">{restaurant.name}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Classificação</span>
            <span className="font-semibold text-yellow-600">{reviewData.rating} ★</span>
          </div>
          {reviewData.visitDate && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Data da visita</span>
              <span className="font-medium">{new Date(reviewData.visitDate).toLocaleDateString('pt-PT')}</span>
            </div>
          )}
          {reviewer && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Publicado por</span>
              <span className="font-medium">{reviewer.name}</span>
            </div>
          )}
        </div>

        <div className="w-full max-w-lg mt-8 flex flex-col gap-3">
          <button
            onClick={onBack}
            className="w-full bg-gray-900 text-white py-3 rounded-xl font-medium hover:bg-gray-800 transition-colors"
          >
            Voltar ao restaurante
          </button>
          <button
            onClick={onGoHome}
            className="w-full bg-red-600 text-white py-3 rounded-xl font-medium hover:bg-red-700 transition-colors"
          >
            Explorar mais lugares
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-white pb-24">
      <div className="relative h-56">
        <ImageWithFallback src={restaurant.image} alt={restaurant.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <button
          onClick={onBack}
          className="absolute top-4 left-4 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
        >
          <ArrowLeft className="size-5" />
        </button>
        <div className="absolute bottom-4 left-4 right-4 text-white">
          <p className="text-sm uppercase tracking-wider text-white/70">Avaliar</p>
          <h1 className="text-3xl font-bold leading-tight">{restaurant.name}</h1>
        </div>
      </div>

      {!userSession ? (
        renderLoginRequired()
      ) : (
        <div className="px-4 py-6 space-y-6">
          <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-50 rounded-2xl">
                <Sparkles className="size-6 text-red-500" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Partilhe detalhes que ajudam outros viajantes</p>
                <p className="font-semibold text-gray-900">Fale sobre sabores, serviço e ambiente</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <section className="bg-white border border-gray-100 rounded-2xl p-4 space-y-4">
              <h2 className="text-lg font-semibold">Classificação</h2>
              {renderRatingSelector()}

              <div className="space-y-2">
                <span className="text-sm text-gray-600">Qual foi o contexto?</span>
                <div className="flex flex-wrap gap-2">
                  {experienceTypes.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setReviewData((prev) => ({ ...prev, experienceType: type }))}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        reviewData.experienceType === type
                          ? 'bg-red-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            </section>

            <section className="bg-white border border-gray-100 rounded-2xl p-4 space-y-4">
              <h2 className="text-lg font-semibold">Detalhes da visita</h2>
              <div className="space-y-3">
                <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
                  <span className="flex items-center gap-2"><Calendar className="size-4" /> Data da visita</span>
                  <input
                    type="date"
                    value={reviewData.visitDate}
                    max={new Date().toISOString().split('T')[0]}
                    onChange={(event) => setReviewData((prev) => ({ ...prev, visitDate: event.target.value }))}
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </label>
                <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 space-y-3">
                  <p className="text-xs uppercase tracking-wide text-gray-500">Perfil</p>
                  <div className="flex items-center gap-2 text-gray-800">
                    <User className="size-4" />
                    <span className="font-medium">{userSession.name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-800">
                    <Mail className="size-4" />
                    <span className="text-sm">{userSession.email}</span>
                  </div>
                  <p className="text-xs text-gray-500">Utilizamos estes dados para associar a sua review ao seu perfil.</p>
                </div>
              </div>
            </section>

            <section className="bg-white border border-gray-100 rounded-2xl p-4 space-y-4">
              <h2 className="text-lg font-semibold">Destaques</h2>
              <div className="flex flex-wrap gap-2">
                {highlightOptions.map((highlight) => (
                  <button
                    key={highlight}
                    type="button"
                    onClick={() => handleToggleHighlight(highlight)}
                    className={`px-4 py-2 rounded-full text-sm transition-colors ${
                      reviewData.highlights.includes(highlight)
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-gray-100 text-gray-700 border border-transparent hover:border-gray-300'
                    }`}
                  >
                    {highlight}
                  </button>
                ))}
              </div>

              <label className="flex flex-col gap-2 text-sm font-medium text-gray-700">
                <span className="flex items-center gap-2"><MessageSquare className="size-4" /> Comentários</span>
                <textarea
                  required
                  value={reviewData.comment}
                  onChange={(event) => setReviewData((prev) => ({ ...prev, comment: event.target.value }))}
                  placeholder="Fale sobre o prato favorito, atendimento, ambiente..."
                  rows={5}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                />
              </label>
            </section>

            <button
              type="submit"
              disabled={isSubmitting || !reviewData.rating || !reviewData.comment.trim()}
              className="w-full bg-red-600 text-white py-4 rounded-xl font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Enviando...' : 'Publicar Avaliação'}
            </button>
            <p className="text-xs text-gray-500 text-center">
              A sua avaliação pode ser destacada no perfil do restaurante e no dashboard do parceiro.
            </p>
          </form>
        </div>
      )}
    </div>
  );
}
