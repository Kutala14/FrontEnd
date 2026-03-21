import { useEffect, useMemo, useState } from 'react';
import { MapPin, Star, Search, Plus, X } from 'lucide-react';
import { Destination } from '../App';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useSession } from '../context/SessionProvider';

interface ExploreProps {
  onSelectDestination: (destination: Destination) => void;
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
  user_id: string;
  user_name?: string | null;
}

const canonicalCategoryOrder = ['Cidade', 'Natureza', 'Aventura', 'Praia', 'Vida Selvagem', 'Cultura'];

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
  if (imageUrl && imageUrl.trim()) return imageUrl;
  return '';
};

export function Explore({ onSelectDestination }: ExploreProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [spots, setSpots] = useState<ExploreSpot[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [publishMessage, setPublishMessage] = useState('');
  const [form, setForm] = useState({
    name: '',
    location: '',
    description: '',
    image_url: '',
    category: 'Cultura',
    highlights: '',
    activities: '',
  });

  const { user, fetchWithAuth } = useSession();
  const apiUrl = import.meta.env.VITE_API_URL;

  const isNormalUser = user?.type === 'user';

  const toDestination = (spot: ExploreSpot): Destination => ({
    id: 100000 + spot.id,
    name: spot.name,
    location: spot.location,
    description: spot.description,
    image: resolveExploreImage(spot.image_url, spot.category || ''),
    rating: Number(spot.rating || 0),
    category: normalizeCategory(spot.category),
    highlights: Array.isArray(spot.highlights) && spot.highlights.length > 0 ? spot.highlights : ['Local publicado pela comunidade'],
    activities: Array.isArray(spot.activities) && spot.activities.length > 0 ? spot.activities : ['Explorar'],
  });

  const buildExploreEndpoint = (includeExternal: boolean) => {
    const base = apiUrl ? `${apiUrl}/explore/` : '/api/explore/';
    const separator = base.includes('?') ? '&' : '?';
    return `${base}${separator}include_external=${includeExternal ? 'true' : 'false'}`;
  };

  const fetchSpots = async () => {
    setLoading(true);
    setErrorMessage('');

    try {
      // First render local/community data immediately.
      const localResponse = await fetch(buildExploreEndpoint(false));
      if (!localResponse.ok) {
        throw new Error('Erro ao carregar locais da comunidade');
      }

      const localData = await localResponse.json();
      setSpots(Array.isArray(localData) ? localData : []);
      setLoading(false);

      // Fetch external data afterwards, without blocking local rendering.
      const withExternalResponse = await fetch(buildExploreEndpoint(true));
      if (!withExternalResponse.ok) {
        return;
      }

      const data = await withExternalResponse.json();
      setSpots(Array.isArray(data) ? data : []);
    } catch {
      setErrorMessage('Não foi possível carregar os locais publicados pela comunidade.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSpots();
  }, []);

  const combinedDestinations = useMemo(() => {
    return spots.map(toDestination);
  }, [spots]);

  const categories = useMemo(() => {
    const dynamicCategories = Array.from(new Set(combinedDestinations.map((destination) => normalizeCategory(destination.category))));
    dynamicCategories.sort((left, right) => {
      const leftIndex = canonicalCategoryOrder.indexOf(left);
      const rightIndex = canonicalCategoryOrder.indexOf(right);
      if (leftIndex === -1 && rightIndex === -1) return left.localeCompare(right, 'pt-PT');
      if (leftIndex === -1) return 1;
      if (rightIndex === -1) return -1;
      return leftIndex - rightIndex;
    });
    return ['Todos', ...dynamicCategories];
  }, [combinedDestinations]);

  const filteredDestinations = combinedDestinations.filter((destination) => {
    const matchesSearch = destination.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         destination.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         destination.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'Todos'
      || normalizeCategory(destination.category) === normalizeCategory(selectedCategory);
    return matchesSearch && matchesCategory;
  });

  const handlePublish = async () => {
    if (!isNormalUser) {
      setPublishMessage('Apenas utilizadores comuns podem publicar locais.');
      return;
    }

    if (!form.name.trim() || !form.location.trim() || !form.description.trim()) {
      setPublishMessage('Preencha nome, localização e descrição.');
      return;
    }

    try {
      const endpoint = apiUrl ? `${apiUrl}/explore/` : '/api/explore/';
      const response = await fetchWithAuth(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: form.name.trim(),
          location: form.location.trim(),
          description: form.description.trim(),
          image_url: form.image_url.trim(),
          category: normalizeCategory(form.category),
          highlights: form.highlights
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean),
          activities: form.activities
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean),
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error || 'Erro ao publicar local');
      }

      setPublishMessage('Local publicado com sucesso!');
      setForm({
        name: '',
        location: '',
        description: '',
        image_url: '',
        category: 'Cultura',
        highlights: '',
        activities: '',
      });
      setShowForm(false);
      await fetchSpots();
    } catch (error) {
      setPublishMessage(error instanceof Error ? error.message : 'Não foi possível publicar o local.');
    }
  };

  return (
    <div className="px-4 py-6 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <h2 className="text-2xl font-bold mb-1">Explorar</h2>
          <p className="text-gray-600">Descubra locais e também publique novos sítios para a comunidade</p>
        </div>
        {isNormalUser && (
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700"
          >
            <Plus className="size-4" />
            Publicar
          </button>
        )}
      </div>

      {publishMessage && (
        <div className={`px-4 py-3 rounded-xl border text-sm ${publishMessage.includes('sucesso')
          ? 'bg-green-50 border-green-200 text-green-700'
          : 'bg-red-50 border-red-200 text-red-700'
        }`}>
          {publishMessage}
        </div>
      )}

      {errorMessage && (
        <div className="px-4 py-3 rounded-xl border bg-red-50 border-red-200 text-red-700 text-sm">
          {errorMessage}
        </div>
      )}

      {showForm && isNormalUser && (
        <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg">Publicar novo local</h3>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200"
            >
              <X className="size-4" />
            </button>
          </div>

          <input
            type="text"
            placeholder="Nome do local *"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          <input
            type="text"
            placeholder="Localização *"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          <textarea
            placeholder="Descrição *"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={3}
            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
          />
          <input
            type="url"
            placeholder="URL da imagem (opcional)"
            value={form.image_url}
            onChange={(e) => setForm({ ...form, image_url: e.target.value })}
            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            {canonicalCategoryOrder.map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Destaques (separados por vírgula)"
            value={form.highlights}
            onChange={(e) => setForm({ ...form, highlights: e.target.value })}
            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          <input
            type="text"
            placeholder="Atividades (separadas por vírgula)"
            value={form.activities}
            onChange={(e) => setForm({ ...form, activities: e.target.value })}
            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500"
          />

          <button
            type="button"
            onClick={handlePublish}
            className="w-full bg-red-600 text-white py-2.5 rounded-lg font-medium hover:bg-red-700 transition-colors"
          >
            Publicar Local
          </button>
        </div>
      )}

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

      <div className="text-sm text-gray-600">
        {loading ? 'A carregar locais...' : `${filteredDestinations.length} ${filteredDestinations.length === 1 ? 'destino encontrado' : 'destinos encontrados'}`}
      </div>

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
                <span className="text-sm font-medium">{destination.rating.toFixed(1)}</span>
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

      {!loading && filteredDestinations.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p className="mb-2">Nenhum local publicado ainda</p>
          <p className="text-sm">Se for utilizador comum, publique um novo local para começar.</p>
        </div>
      )}
    </div>
  );
}
