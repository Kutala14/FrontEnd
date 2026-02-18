import { useState, useEffect } from 'react';
import { Save, MapPin, Phone, Clock, Image as ImageIcon } from 'lucide-react';
import { useSession } from '../../context/SessionProvider';

interface RestaurantManagementProps {
  restaurantId: number;
}

interface RestaurantData {
  id: number;
  name: string;
  description: string;
  cuisine_id: number | null;
  location: string;
  phone: string;
  openHours: string;
  priceRange: string;
  image: string;
  specialties: string[];
}

interface CuisineOption {
  id: number;
  name: string;
}

interface LocationOption {
  id: number;
  full_address: string;
}

export function RestaurantManagement({ restaurantId }: RestaurantManagementProps) {
  const [restaurantData, setRestaurantData] = useState<RestaurantData>({
    id: restaurantId,
    name: '',
    description: '',
    cuisine_id: null,
    location: '',
    phone: '',
    openHours: '',
    priceRange: '$$',
    image: '',
    specialties: [],
  });
  const [newSpecialty, setNewSpecialty] = useState('');
  const [cuisines, setCuisines] = useState<CuisineOption[]>([]);
  const [locations, setLocations] = useState<LocationOption[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const { fetchWithAuth } = useSession();
  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    loadRestaurantData();
  }, [restaurantId, fetchWithAuth, apiUrl]);

  const loadRestaurantData = async () => {
    try {
      const restaurantEndpoint = apiUrl ? `${apiUrl}/restaurants/${restaurantId}` : `/api/restaurants/${restaurantId}`;
      const cuisinesEndpoint = apiUrl ? `${apiUrl}/restaurants/cuisines` : '/api/restaurants/cuisines';
      const locationsEndpoint = apiUrl ? `${apiUrl}/restaurants/locations` : '/api/restaurants/locations';

      const [restaurantResponse, cuisinesResponse, locationsResponse] = await Promise.all([
        fetchWithAuth(restaurantEndpoint),
        fetch(cuisinesEndpoint),
        fetch(locationsEndpoint),
      ]);

      if (!restaurantResponse.ok) {
        throw new Error('Erro ao buscar hotel');
      }

      const data = await restaurantResponse.json();
      const cuisinesData = cuisinesResponse.ok ? await cuisinesResponse.json() : [];
      const locationsData = locationsResponse.ok ? await locationsResponse.json() : [];

      setCuisines(Array.isArray(cuisinesData) ? cuisinesData : []);
      setLocations(Array.isArray(locationsData) ? locationsData : []);

      setRestaurantData({
        id: data.id,
        name: data.name || '',
        description: data.description || '',
        cuisine_id: data.cuisine_id ?? null,
        location: data.location || '',
        phone: data.phone || '',
        openHours: data.open_hours || '',
        priceRange: data.price_range || '$$',
        image: data.image_url || '',
        specialties: Array.isArray(data.specialties) ? data.specialties : [],
      });

    } catch (error) {
      console.error(error);
      setSaveMessage({ type: 'error', text: 'Erro ao carregar hotel' });
    }
  };


  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage(null);

    try {
      const endpoint = apiUrl ? `${apiUrl}/restaurants/${restaurantId}` : `/api/restaurants/${restaurantId}`;

      const response = await fetchWithAuth(endpoint, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: restaurantData.name,
          description: restaurantData.description,
          phone: restaurantData.phone,
          open_hours: restaurantData.openHours,
          price_range: restaurantData.priceRange,
          image_url: restaurantData.image,
          cuisine_id: restaurantData.cuisine_id,
          location: restaurantData.location.trim() || null,
          specialties: restaurantData.specialties,
        })
      });

      if (!response.ok) {
        throw new Error("Erro ao atualizar hotel");
      }

      setSaveMessage({ type: 'success', text: 'Dados guardados com sucesso 🔥' });

    } catch (error) {
      console.error(error);
      setSaveMessage({ type: 'error', text: 'Erro ao salvar alterações' });
    }

    setIsSaving(false);
    setTimeout(() => setSaveMessage(null), 3000);
  };

  const addSpecialty = () => {
    const value = newSpecialty.trim();
    if (!value) return;

    const exists = restaurantData.specialties.some((item) => item.toLowerCase() === value.toLowerCase());
    if (exists) {
      setNewSpecialty('');
      return;
    }

    setRestaurantData((prev) => ({
      ...prev,
      specialties: [...prev.specialties, value],
    }));
    setNewSpecialty('');
  };

  const removeSpecialty = (name: string) => {
    setRestaurantData((prev) => ({
      ...prev,
      specialties: prev.specialties.filter((item) => item !== name),
    }));
  };

  return (
    <div className="p-4 lg:p-8 space-y-6">
      {/* Header */}
      <div>
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Meu Hotel</h1>
          <p className="text-gray-600">Gerencie as informações do seu hotel</p>
        </div>
      </div>

      {/* Success Message */}
      {saveMessage && (
        <div className={`px-4 py-3 rounded-xl border ${
          saveMessage.type === 'success'
            ? 'bg-green-50 border-green-200 text-green-700'
            : 'bg-red-50 border-red-200 text-red-700'
        }`}>
          {saveMessage.text}
        </div>
      )}

      {/* Image Upload */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-bold text-lg mb-4">Imagem do Hotel</h3>
        <div className="space-y-4">
          {restaurantData.image ? (
            <div className="relative w-full h-48 rounded-xl overflow-hidden">
              <img
                src={restaurantData.image}
                alt={restaurantData.name}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setRestaurantData({ ...restaurantData, image: '' })}
                className="absolute top-2 right-2 bg-red-600 text-white px-3 py-1 rounded-lg text-sm font-medium hover:bg-red-700"
              >
                Remover
              </button>
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
              <ImageIcon className="size-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 mb-2">Nenhuma imagem carregada</p>
              <input
                type="url"
                placeholder="Cole o URL da imagem"
                value={restaurantData.image}
                onChange={(e) => setRestaurantData({ ...restaurantData, image: e.target.value })}
                className="w-full max-w-md mx-auto px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          )}
        </div>
      </div>

      {/* Basic Information */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-bold text-lg mb-4">Informações Básicas</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome do Hotel *
            </label>
            <input
              type="text"
              value={restaurantData.name}
              onChange={(e) => setRestaurantData({ ...restaurantData, name: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Hotel Sabor Angolano"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Cozinha *
            </label>
            <select
              value={restaurantData.cuisine_id ?? ''}
              onChange={(e) =>
                setRestaurantData({
                  ...restaurantData,
                  cuisine_id: e.target.value ? Number(e.target.value) : null,
                })
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="">Selecione...</option>
              {cuisines.map((cuisine) => (
                <option key={cuisine.id} value={cuisine.id}>{cuisine.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Telefone *
            </label>
            <input
              type="tel"
              value={restaurantData.phone}
              onChange={(e) => setRestaurantData({ ...restaurantData, phone: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="+244 923 456 789"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Localização *
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
              <input
                type="text"
                list="restaurant-locations"
                value={restaurantData.location}
                onChange={(e) => setRestaurantData({ ...restaurantData, location: e.target.value })}
                className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Luanda, Talatona"
              />
              <datalist id="restaurant-locations">
                {locations.map((location) => (
                  <option key={location.id} value={location.full_address} />
                ))}
              </datalist>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Horário de Funcionamento *
            </label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
              <input
                type="text"
                value={restaurantData.openHours}
                onChange={(e) => setRestaurantData({ ...restaurantData, openHours: e.target.value })}
                className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Seg-Dom: 12:00 - 23:00"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Faixa de Preço
            </label>
            <select
              value={restaurantData.priceRange}
              onChange={(e) => setRestaurantData({ ...restaurantData, priceRange: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="$">$ - Económico</option>
              <option value="$$">$$ - Moderado</option>
              <option value="$$$">$$$ - Alto</option>
              <option value="$$$$">$$$$ - Premium</option>
            </select>
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Descrição *
          </label>
          <textarea
            value={restaurantData.description}
            onChange={(e) => setRestaurantData({ ...restaurantData, description: e.target.value })}
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
            placeholder="Descreva o seu hotel, o ambiente, a experiência gastronómica..."
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-bold text-lg mb-4">Especialidades</h3>

        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={newSpecialty}
            onChange={(e) => setNewSpecialty(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addSpecialty();
              }
            }}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            placeholder="Ex: Muamba de galinha"
          />
          <button
            type="button"
            onClick={addSpecialty}
            className="px-4 py-2 bg-gray-900 text-white rounded-lg font-medium hover:bg-black"
          >
            Adicionar
          </button>
        </div>

        {restaurantData.specialties.length === 0 ? (
          <p className="text-sm text-gray-500">Sem especialidades cadastradas.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {restaurantData.specialties.map((specialty) => (
              <span
                key={specialty}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm bg-red-50 text-red-700 border border-red-200"
              >
                {specialty}
                <button
                  type="button"
                  onClick={() => removeSpecialty(specialty)}
                  className="text-red-700 hover:text-red-900"
                  aria-label={`Remover ${specialty}`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-red-600 to-yellow-500 text-white rounded-xl font-semibold hover:shadow-lg transition-shadow disabled:opacity-50"
        >
          <Save className="size-5" />
          {isSaving ? 'A guardar...' : 'Guardar Alterações'}
        </button>
      </div>
    </div>
  );
}
