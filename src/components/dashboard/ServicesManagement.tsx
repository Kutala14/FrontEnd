import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Hotel, PartyPopper, UtensilsCrossed, ToggleLeft, ToggleRight, DollarSign } from 'lucide-react';
import { useSession } from '../../context/SessionProvider';

interface ServicesManagementProps {
  restaurantId: number;
}

interface Service {
  id: number;
  type: 'hosting' | 'events' | 'catering';
  name: string;
  description: string;
  price: number;
  priceUnit: string;
  isAvailable: boolean;
  features: string[];
}

const serviceTypes = [
  { id: 'hosting', label: 'Hospedagem', icon: Hotel, color: 'blue' },
  { id: 'events', label: 'Eventos Privados', icon: PartyPopper, color: 'purple' },
  { id: 'catering', label: 'Catering', icon: UtensilsCrossed, color: 'green' }
];

export function ServicesManagement({ restaurantId }: ServicesManagementProps) {
  const { fetchWithAuth } = useSession();
  const [services, setServices] = useState<Service[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [newFeature, setNewFeature] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [serviceForm, setServiceForm] = useState({
    type: 'hosting' as 'hosting' | 'events' | 'catering',
    name: '',
    description: '',
    price: '',
    priceUnit: 'noite',
    isAvailable: true,
    features: [] as string[]
  });

  const apiUrl = import.meta.env.VITE_API_URL;
  const getEndpoint = (path: string) => (apiUrl ? `${apiUrl}${path}` : `/api${path}`);

  const mapApiService = (service: any): Service => ({
    id: Number(service.id),
    type: service.type,
    name: service.name,
    description: service.description || '',
    price: Number(service.price || 0),
    priceUnit: service.price_unit || 'unidade',
    isAvailable: Boolean(service.is_available),
    features: Array.isArray(service.features) ? service.features : [],
  });

  useEffect(() => {
    loadServices();
  }, [restaurantId]);

  const loadServices = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetchWithAuth(getEndpoint(`/restaurants/${restaurantId}/services`));
      if (!response.ok) {
        throw new Error('Erro ao carregar serviços');
      }

      const data = await response.json();
      const items = Array.isArray(data.items) ? data.items : [];
      setServices(items.map(mapApiService));
    } catch {
      setError('Não foi possível carregar os serviços.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveService = async () => {
    if (!serviceForm.name.trim() || !serviceForm.price) return;

    setError('');

    const payload = {
      type: serviceForm.type,
      name: serviceForm.name.trim(),
      description: serviceForm.description.trim(),
      price: parseFloat(serviceForm.price),
      price_unit: serviceForm.priceUnit,
      is_available: serviceForm.isAvailable,
      features: serviceForm.features,
    };

    try {
      if (editingService) {
        const response = await fetchWithAuth(
          getEndpoint(`/restaurants/${restaurantId}/services/${editingService.id}`),
          {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          },
        );

        if (!response.ok) {
          throw new Error('Erro ao atualizar serviço');
        }

        const updated = mapApiService(await response.json());
        setServices((prev) => prev.map((service) => (service.id === updated.id ? updated : service)));
      } else {
        const response = await fetchWithAuth(getEndpoint(`/restaurants/${restaurantId}/services`), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error('Erro ao criar serviço');
        }

        const created = mapApiService(await response.json());
        setServices((prev) => [created, ...prev]);
      }

      resetForm();
    } catch {
      setError('Não foi possível guardar o serviço.');
    }
  };

  const resetForm = () => {
    setServiceForm({
      type: 'hosting',
      name: '',
      description: '',
      price: '',
      priceUnit: 'noite',
      isAvailable: true,
      features: []
    });
    setShowForm(false);
    setEditingService(null);
    setNewFeature('');
  };

  const handleEditService = (service: Service) => {
    setEditingService(service);
    setServiceForm({
      type: service.type,
      name: service.name,
      description: service.description,
      price: service.price.toString(),
      priceUnit: service.priceUnit,
      isAvailable: service.isAvailable,
      features: service.features
    });
    setShowForm(true);
  };

  const handleDeleteService = async (id: number) => {
    if (!confirm('Tem certeza que deseja remover este serviço?')) return;

    setError('');
    try {
      const response = await fetchWithAuth(getEndpoint(`/restaurants/${restaurantId}/services/${id}`), {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Erro ao remover serviço');
      }

      setServices((prev) => prev.filter((service) => service.id !== id));
    } catch {
      setError('Não foi possível remover o serviço.');
    }
  };

  const toggleServiceAvailability = async (id: number) => {
    const current = services.find((service) => service.id === id);
    if (!current) return;

    setError('');
    try {
      const response = await fetchWithAuth(getEndpoint(`/restaurants/${restaurantId}/services/${id}`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_available: !current.isAvailable }),
      });

      if (!response.ok) {
        throw new Error('Erro ao alterar disponibilidade');
      }

      const updated = mapApiService(await response.json());
      setServices((prev) => prev.map((service) => (service.id === updated.id ? updated : service)));
    } catch {
      setError('Não foi possível atualizar a disponibilidade.');
    }
  };

  const addFeature = () => {
    if (newFeature.trim() && !serviceForm.features.includes(newFeature.trim())) {
      setServiceForm({
        ...serviceForm,
        features: [...serviceForm.features, newFeature.trim()]
      });
      setNewFeature('');
    }
  };

  const removeFeature = (feature: string) => {
    setServiceForm({
      ...serviceForm,
      features: serviceForm.features.filter(f => f !== feature)
    });
  };

  const getServiceIcon = (type: string) => {
    const serviceType = serviceTypes.find(t => t.id === type);
    return serviceType ? serviceType.icon : Hotel;
  };

  const getServiceColor = (type: string) => {
    const serviceType = serviceTypes.find(t => t.id === type);
    return serviceType ? serviceType.color : 'gray';
  };

  const getPriceUnitOptions = (type: string) => {
    switch (type) {
      case 'hosting':
        return ['noite', 'semana', 'mês'];
      case 'events':
        return ['evento', 'hora', 'dia'];
      case 'catering':
        return ['pessoa', 'evento', 'bandeja'];
      default:
        return ['unidade'];
    }
  };

  return (
    <div className="p-4 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Serviços Adicionais</h1>
          <p className="text-gray-600">Gerencie hospedagem, eventos e catering</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600 to-yellow-500 text-white rounded-xl font-medium hover:shadow-lg transition-shadow"
        >
          <Plus className="size-4" />
          Novo Serviço
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">{error}</div>
      )}

      {/* Service Form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-bold text-lg mb-4">
            {editingService ? 'Editar Serviço' : 'Novo Serviço'}
          </h3>

          <div className="space-y-4">
            {/* Service Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Serviço *</label>
              <div className="grid grid-cols-3 gap-3">
                {serviceTypes.map(type => {
                  const Icon = type.icon;
                  return (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setServiceForm({ ...serviceForm, type: type.id as any })}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        serviceForm.type === type.id
                          ? `border-${type.color}-500 bg-${type.color}-50`
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Icon className={`size-6 mx-auto mb-2 ${
                        serviceForm.type === type.id ? `text-${type.color}-600` : 'text-gray-400'
                      }`} />
                      <p className="text-sm font-medium text-gray-900">{type.label}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Name and Price */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nome *</label>
                <input
                  type="text"
                  value={serviceForm.name}
                  onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Ex: Quarto Duplo Standard"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Preço (USD) *</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    step="0.01"
                    value={serviceForm.price}
                    onChange={(e) => setServiceForm({ ...serviceForm, price: e.target.value })}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="100.00"
                  />
                  <select
                    value={serviceForm.priceUnit}
                    onChange={(e) => setServiceForm({ ...serviceForm, priceUnit: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    {getPriceUnitOptions(serviceForm.type).map(unit => (
                      <option key={unit} value={unit}>/{unit}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Descrição</label>
              <textarea
                value={serviceForm.description}
                onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                placeholder="Descreva o serviço..."
              />
            </div>

            {/* Features */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Características Incluídas</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                  placeholder="Ex: WiFi grátis"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                <button
                  type="button"
                  onClick={addFeature}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300"
                >
                  Adicionar
                </button>
              </div>
              {serviceForm.features.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {serviceForm.features.map((feature, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 px-3 py-1 bg-gray-100 border border-gray-200 rounded-lg"
                    >
                      <span className="text-sm">{feature}</span>
                      <button
                        type="button"
                        onClick={() => removeFeature(feature)}
                        className="text-red-600 hover:text-red-700"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Availability */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={serviceForm.isAvailable}
                onChange={(e) => setServiceForm({ ...serviceForm, isAvailable: e.target.checked })}
                className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
              />
              <span className="text-sm font-medium text-gray-700">Serviço disponível</span>
            </label>

            {/* Actions */}
            <div className="flex gap-2 pt-4">
              <button
                type="button"
                onClick={handleSaveService}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700"
              >
                {editingService ? 'Atualizar' : 'Adicionar'} Serviço
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Services List */}
      {isLoading ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-500">A carregar serviços...</div>
      ) : services.length === 0 && !showForm ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <UtensilsCrossed className="size-16 text-gray-300 mx-auto mb-4" />
          <h3 className="font-semibold text-gray-900 mb-2">Nenhum serviço adicional</h3>
          <p className="text-gray-500 mb-4">Adicione serviços como hospedagem, eventos ou catering</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {services.map(service => {
            const Icon = getServiceIcon(service.type);
            const color = getServiceColor(service.type);

            return (
              <div
                key={service.id}
                className={`bg-white rounded-xl border-2 p-6 ${
                  service.isAvailable ? 'border-gray-200' : 'border-gray-300 bg-gray-50 opacity-75'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 bg-${color}-50 rounded-xl`}>
                      <Icon className={`size-6 text-${color}-600`} />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{service.name}</h3>
                      <p className="text-sm text-gray-500">
                        {serviceTypes.find(t => t.id === service.type)?.label}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">${service.price}</p>
                    <p className="text-xs text-gray-500">/{service.priceUnit}</p>
                  </div>
                </div>

                {service.description && (
                  <p className="text-sm text-gray-600 mb-4">{service.description}</p>
                )}

                {service.features.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Inclui:</p>
                    <div className="flex flex-wrap gap-2">
                      {service.features.map((feature, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-lg"
                        >
                          ✓ {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => toggleServiceAvailability(service.id)}
                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${
                      service.isAvailable
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    {service.isAvailable ? <ToggleRight className="size-4" /> : <ToggleLeft className="size-4" />}
                    {service.isAvailable ? 'Disponível' : 'Indisponível'}
                  </button>
                  <button
                    onClick={() => handleEditService(service)}
                    className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
                  >
                    <Edit2 className="size-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteService(service.id)}
                    className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
