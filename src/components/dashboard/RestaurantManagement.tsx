import { useState, useEffect } from 'react';
import { Save, Upload, MapPin, Phone, Clock, Globe, Image as ImageIcon, ToggleLeft, ToggleRight } from 'lucide-react';
import { useSession } from '../../context/SessionProvider';

interface RestaurantManagementProps {
  restaurantId: number;
}

interface RestaurantData {
  id: number;
  name: string;
  description: string;
  cuisine_id: string;
  location_id: string;
  phone: string;
  email: string;
  openHours: string;
  priceRange: string;
  image: string;
  isActive: boolean;
  website?: string;
  specialties: string[];
}

export function RestaurantManagement({ restaurantId }: RestaurantManagementProps) {
  const [restaurantData, setRestaurantData] = useState<RestaurantData>({
    id: restaurantId,
    name: '',
    description: '',
    cuisine_id: '',
    location_id: '',
    phone: '',
    email: '',
    openHours: '',
    priceRange: '$$',
    image: '',
    isActive: true,
    website: '',
    specialties: []
  });

  const [newSpecialty, setNewSpecialty] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const { fetchWithAuth } = useSession();
  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    loadRestaurantData();
  }, [restaurantId, fetchWithAuth, apiUrl]);

  const loadRestaurantData = async () => {
    try {
      const endpoint = apiUrl ? `${apiUrl}/restaurants/${restaurantId}` : `/api/restaurants/${restaurantId}`;
      const response = await fetchWithAuth(endpoint);

      if (!response.ok) {
        throw new Error("Erro ao buscar restaurante");
      }

      const data = await response.json();

      setRestaurantData({
        id: data.id,
        name: data.name || '',
        description: data.description || '',
        cuisine_id: data.cuisine_id ? data.cuisine_id : '',
        location_id: data.location_id ? data.location_id : '',
        phone: data.phone || '',
        email: '', // email vem do User, não do Restaurant
        openHours: data.open_hours || '',
        priceRange: data.price_range || '$$',
        image: data.image_url || '',
        isActive: true, // ainda não existe no backend
        website: '',
        specialties: [] // ainda não está modelado no backend
      });

    } catch (error) {
      console.error(error);
      setSaveMessage("Erro ao carregar restaurante");
    }
  };


  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage('');

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
          cuisine_id: restaurantData.cuisine_id || null,
          location_id: restaurantData.location_id || null
        })
      });

      if (!response.ok) {
        throw new Error("Erro ao atualizar restaurante");
      }

      setSaveMessage("Dados guardados com sucesso 🔥");

    } catch (error) {
      console.error(error);
      setSaveMessage("Erro ao salvar alterações");
    }

    setIsSaving(false);
    setTimeout(() => setSaveMessage(''), 3000);
  };

  const addSpecialty = () => {
    if (newSpecialty.trim() && !restaurantData.specialties.includes(newSpecialty.trim())) {
      setRestaurantData({
        ...restaurantData,
        specialties: [...restaurantData.specialties, newSpecialty.trim()]
      });
      setNewSpecialty('');
    }
  };

  const removeSpecialty = (specialty: string) => {
    setRestaurantData({
      ...restaurantData,
      specialties: restaurantData.specialties.filter(s => s !== specialty)
    });
  };

  return (
    <div className="p-4 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Meu Restaurante</h1>
          <p className="text-gray-600">Gerencie as informações do seu restaurante</p>
        </div>
        <button
          onClick={() => setRestaurantData({ ...restaurantData, isActive: !restaurantData.isActive })}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors ${
            restaurantData.isActive
              ? 'bg-green-100 text-green-700 hover:bg-green-200'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {restaurantData.isActive ? (
            <>
              <ToggleRight className="size-5" />
              <span className="hidden sm:inline">Ativo</span>
            </>
          ) : (
            <>
              <ToggleLeft className="size-5" />
              <span className="hidden sm:inline">Inativo</span>
            </>
          )}
        </button>
      </div>

      {/* Success Message */}
      {saveMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl">
          {saveMessage}
        </div>
      )}

      {/* Image Upload */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-bold text-lg mb-4">Imagem do Restaurante</h3>
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
              Nome do Restaurante *
            </label>
            <input
              type="text"
              value={restaurantData.name}
              onChange={(e) => setRestaurantData({ ...restaurantData, name: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Restaurante Sabor Angolano"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Cozinha *
            </label>
            <select
              value={restaurantData.cuisine_id}
              onChange={(e) => setRestaurantData({ ...restaurantData, cuisine_id: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="">Selecione...</option>
              <option value="Angolana">Angolana</option>
              <option value="Portuguesa">Portuguesa</option>
              <option value="Brasileira">Brasileira</option>
              <option value="Italiana">Italiana</option>
              <option value="Internacional">Internacional</option>
              <option value="Frutos do Mar">Frutos do Mar</option>
              <option value="Churrasco">Churrasco</option>
              <option value="Vegetariana">Vegetariana</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email *
            </label>
            <input
              type="email"
              value={restaurantData.email}
              onChange={(e) => setRestaurantData({ ...restaurantData, email: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="contato@restaurante.ao"
            />
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
                value={restaurantData.location_id}
                onChange={(e) => setRestaurantData({ ...restaurantData, location_id: e.target.value })}
                className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Luanda, Talatona"
              />
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Website (opcional)
            </label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
              <input
                type="url"
                value={restaurantData.website || ''}
                onChange={(e) => setRestaurantData({ ...restaurantData, website: e.target.value })}
                className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="https://www.meurestaurante.ao"
              />
            </div>
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
            placeholder="Descreva o seu restaurante, o ambiente, a experiência gastronómica..."
          />
        </div>
      </div>

      {/* Specialties */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-bold text-lg mb-4">Especialidades</h3>
        <div className="space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={newSpecialty}
              onChange={(e) => setNewSpecialty(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSpecialty())}
              placeholder="Ex: Muamba de Galinha"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <button
              onClick={addSpecialty}
              className="px-6 py-3 bg-gradient-to-r from-red-600 to-yellow-500 text-white rounded-xl font-medium hover:shadow-lg transition-shadow"
            >
              Adicionar
            </button>
          </div>

          {restaurantData.specialties.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {restaurantData.specialties.map((specialty, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-red-50 to-yellow-50 border border-red-200 rounded-lg"
                >
                  <span className="text-sm font-medium text-gray-900">{specialty}</span>
                  <button
                    onClick={() => removeSpecialty(specialty)}
                    className="text-red-600 hover:text-red-700"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
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
