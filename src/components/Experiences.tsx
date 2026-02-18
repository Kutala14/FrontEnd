import { useEffect, useMemo, useState } from 'react';
import { Clock, DollarSign, Users, Star, ChevronRight, Plus, Edit2, Trash2 } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useSession } from '../context/SessionProvider';

interface Experience {
  id: number;
  title: string;
  description: string | null;
  image_url: string | null;
  duration: string | null;
  price_from: number | null;
  min_group_size: number | null;
  max_group_size: number | null;
  rating: number;
  reviews_count: number;
  category: string | null;
  owner_id: string | null;
  schedule_type: 'one_time' | 'recurring';
  event_date: string | null;
  recurrence_days: string[];
  schedule_label: string;
  participants_count: number;
  available_spots: number | null;
  is_joined: boolean;
  my_participation: {
    reservation_id: number;
    status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
    people_count: number;
    reservation_date: string | null;
  } | null;
}

interface ExperienceCategory {
  id: number;
  name: string;
}

const normalizeCategory = (value: string | null | undefined) => String(value || '').trim().toLowerCase();

interface ExperienceParticipation {
  id: number;
  user_id: string;
  experience_id: number;
  experience_title: string | null;
  participant_name: string | null;
  participant_email: string | null;
  participant_phone: string | null;
  reservation_date: string | null;
  people_count: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  notes: string | null;
  created_at: string | null;
}

const defaultImage =
  'https://images.unsplash.com/photo-1561789706-b21375e5392e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080';
const weekdayOptions = [
  { key: 'mon', label: 'Seg' },
  { key: 'tue', label: 'Ter' },
  { key: 'wed', label: 'Qua' },
  { key: 'thu', label: 'Qui' },
  { key: 'fri', label: 'Sex' },
  { key: 'sat', label: 'Sáb' },
  { key: 'sun', label: 'Dom' },
];

export function Experiences() {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [categories, setCategories] = useState<ExperienceCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingExperience, setEditingExperience] = useState<Experience | null>(null);
  const [participantsByExperience, setParticipantsByExperience] = useState<Record<number, ExperienceParticipation[]>>({});
  const [openParticipantsExperienceId, setOpenParticipantsExperienceId] = useState<number | null>(null);
  const [loadingParticipantsExperienceId, setLoadingParticipantsExperienceId] = useState<number | null>(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    image_url: '',
    duration: '',
    price_from: '',
    min_group_size: '1',
    max_group_size: '10',
    category: '',
    schedule_type: 'recurring' as 'one_time' | 'recurring',
    event_date: '',
    recurrence_days: [] as string[],
  });

  const { user, fetchWithAuth } = useSession();
  const apiUrl = import.meta.env.VITE_API_URL;

  const getEndpoint = (path: string) => (apiUrl ? `${apiUrl}${path}` : `/api${path}`);

  const isRestaurantUser = user?.type === 'hotel';

  const loadExperiences = async () => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const [experiencesResponse, categoriesResponse] = await Promise.all([
        fetch(getEndpoint('/experiences/')),
        fetch(getEndpoint('/experiences/categories')),
      ]);

      if (!experiencesResponse.ok) {
        throw new Error('Erro ao carregar experiências');
      }

      const experiencesData = await experiencesResponse.json();
      const categoriesData = categoriesResponse.ok ? await categoriesResponse.json() : [];

      setExperiences(experiencesData);
      setCategories(categoriesData);
    } catch {
      setErrorMessage('Não foi possível carregar as experiências.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadExperiences();
  }, []);

  const visibleCategories = useMemo(() => {
    const ordered: string[] = [];
    const seen = new Set<string>();

    [...categories.map((category) => category.name), ...experiences.map((experience) => experience.category || '')]
      .map((value) => String(value || '').trim())
      .filter(Boolean)
      .forEach((value) => {
        const key = normalizeCategory(value);
        if (seen.has(key)) return;
        seen.add(key);
        ordered.push(value);
      });

    return ['Todas', ...ordered];
  }, [experiences, categories]);

  const filteredExperiences = experiences.filter(
    (experience) => selectedCategory === 'Todas' || normalizeCategory(experience.category) === normalizeCategory(selectedCategory),
  );

  const resetForm = () => {
    setForm({
      title: '',
      description: '',
      image_url: '',
      duration: '',
      price_from: '',
      min_group_size: '1',
      max_group_size: '10',
      category: '',
      schedule_type: 'recurring',
      event_date: '',
      recurrence_days: [],
    });
    setEditingExperience(null);
    setShowForm(false);
  };

  const handleSaveExperience = async () => {
    if (!form.title.trim()) return;

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      image_url: form.image_url.trim(),
      duration: form.duration.trim(),
      price_from: form.price_from ? Number(form.price_from) : null,
      min_group_size: Number(form.min_group_size || 1),
      max_group_size: Number(form.max_group_size || 1),
      category: form.category.trim(),
      schedule_type: form.schedule_type,
      event_date: form.schedule_type === 'one_time' ? form.event_date : null,
      recurrence_days: form.schedule_type === 'recurring' ? form.recurrence_days : [],
    };

    try {
      const endpoint = editingExperience
        ? getEndpoint(`/experiences/${editingExperience.id}`)
        : getEndpoint('/experiences/');

      const response = await fetchWithAuth(endpoint, {
        method: editingExperience ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const payloadError = await response.json().catch(() => null);
        throw new Error(payloadError?.error || 'Erro ao guardar experiência');
      }

      await loadExperiences();
      resetForm();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Não foi possível guardar a experiência.');
    }
  };

  const handleEditExperience = (experience: Experience) => {
    setEditingExperience(experience);
    setForm({
      title: experience.title || '',
      description: experience.description || '',
      image_url: experience.image_url || '',
      duration: experience.duration || '',
      price_from: experience.price_from?.toString() || '',
      min_group_size: (experience.min_group_size || 1).toString(),
      max_group_size: (experience.max_group_size || 10).toString(),
      category: experience.category || '',
      schedule_type: experience.schedule_type || 'recurring',
      event_date: experience.event_date || '',
      recurrence_days: experience.recurrence_days || [],
    });
    setShowForm(true);
  };

  const handleDeleteExperience = async (experienceId: number) => {
    if (!confirm('Tem certeza que deseja remover esta experiência?')) return;

    try {
      const response = await fetchWithAuth(getEndpoint(`/experiences/${experienceId}`), {
        method: 'DELETE',
      });

      if (!response.ok) {
        const payloadError = await response.json().catch(() => null);
        throw new Error(payloadError?.error || 'Erro ao remover experiência');
      }

      setExperiences((prev) => prev.filter((experience) => experience.id !== experienceId));
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Não foi possível remover a experiência.');
    }
  };

  const handleJoinExperience = async (experience: Experience) => {
    if (!user || user.type !== 'user') {
      setErrorMessage('Inicie sessão como utilizador para participar em experiências.');
      return;
    }

    let reservationDate = '';
    if (experience.schedule_type === 'one_time') {
      if (!experience.event_date) {
        setErrorMessage('Esta experiência não possui data fixa configurada.');
        return;
      }
      reservationDate = experience.event_date;
    } else {
      const defaultDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const allowedDaysText = experience.recurrence_days?.length
        ? `Dias: ${experience.recurrence_days.join(', ')}`
        : 'Todos os dias';
      reservationDate = window.prompt(`Data da participação (YYYY-MM-DD) - ${allowedDaysText}`, defaultDate) || '';
      if (!reservationDate) {
        setErrorMessage('A data é obrigatória para experiências recorrentes.');
        return;
      }
    }

    const peopleCountInput = window.prompt('Número de participantes:', '1') || '1';
    const peopleCount = Number(peopleCountInput);

    if (!Number.isInteger(peopleCount) || peopleCount < 1) {
      setErrorMessage('Número de participantes inválido.');
      return;
    }

    try {
      const response = await fetchWithAuth(getEndpoint(`/experiences/${experience.id}/participate`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reservation_date: reservationDate,
          people_count: peopleCount,
          notes: `Participação na experiência: ${experience.title}`,
        }),
      });

      if (!response.ok) {
        const payloadError = await response.json().catch(() => null);
        throw new Error(payloadError?.error || 'Erro ao participar na experiência');
      }

      setErrorMessage('Participação enviada com sucesso.');
      await loadExperiences();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Não foi possível participar na experiência.');
    }
  };

  const handleCancelParticipation = async (experience: Experience) => {
    try {
      const response = await fetchWithAuth(getEndpoint(`/experiences/${experience.id}/participate`), {
        method: 'DELETE',
      });

      if (!response.ok) {
        const payloadError = await response.json().catch(() => null);
        throw new Error(payloadError?.error || 'Erro ao cancelar participação');
      }

      setErrorMessage('Participação cancelada com sucesso.');
      await loadExperiences();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Não foi possível cancelar a participação.');
    }
  };

  const loadParticipants = async (experienceId: number) => {
    setLoadingParticipantsExperienceId(experienceId);
    try {
      const response = await fetchWithAuth(getEndpoint(`/experiences/${experienceId}/participants`));
      if (!response.ok) {
        const payloadError = await response.json().catch(() => null);
        throw new Error(payloadError?.error || 'Erro ao carregar participantes');
      }
      const data = await response.json();
      setParticipantsByExperience((prev) => ({ ...prev, [experienceId]: data }));
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Não foi possível carregar os participantes.');
    } finally {
      setLoadingParticipantsExperienceId(null);
    }
  };

  const toggleParticipantsPanel = async (experienceId: number) => {
    if (openParticipantsExperienceId === experienceId) {
      setOpenParticipantsExperienceId(null);
      return;
    }

    setOpenParticipantsExperienceId(experienceId);
    if (!participantsByExperience[experienceId]) {
      await loadParticipants(experienceId);
    }
  };

  const updateParticipationStatus = async (
    experienceId: number,
    participationId: number,
    status: 'pending' | 'confirmed' | 'cancelled' | 'completed',
  ) => {
    try {
      const response = await fetchWithAuth(getEndpoint(`/experiences/participations/${participationId}/status`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        const payloadError = await response.json().catch(() => null);
        throw new Error(payloadError?.error || 'Erro ao atualizar status da participação');
      }

      await loadParticipants(experienceId);
      await loadExperiences();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Não foi possível atualizar o status.');
    }
  };

  const getParticipationStatusLabel = (status: ExperienceParticipation['status']) => {
    if (status === 'confirmed') return 'Confirmada';
    if (status === 'cancelled') return 'Cancelada';
    if (status === 'completed') return 'Concluída';
    return 'Pendente';
  };

  const getParticipationStatusClassName = (status: ExperienceParticipation['status']) => {
    if (status === 'confirmed') return 'bg-green-50 text-green-700 border-green-200';
    if (status === 'cancelled') return 'bg-red-50 text-red-700 border-red-200';
    if (status === 'completed') return 'bg-blue-50 text-blue-700 border-blue-200';
    return 'bg-yellow-50 text-yellow-700 border-yellow-200';
  };

  const toggleWeekday = (dayKey: string) => {
    setForm((prev) => ({
      ...prev,
      recurrence_days: prev.recurrence_days.includes(dayKey)
        ? prev.recurrence_days.filter((item) => item !== dayKey)
        : [...prev.recurrence_days, dayKey],
    }));
  };

  return (
    <div className="px-4 py-6 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold mb-1">Experiências</h2>
          <p className="text-gray-600">Atividades e tours únicos em Angola</p>
        </div>

        {isRestaurantUser && (
          <button
            onClick={() => {
              setEditingExperience(null);
              setShowForm(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
          >
            <Plus className="size-4" />
            Nova Experiência
          </button>
        )}
      </div>

      {errorMessage && (
        <div className={`border px-4 py-3 rounded-xl ${
          errorMessage.includes('sucesso')
            ? 'bg-green-50 border-green-200 text-green-700'
            : 'bg-red-50 border-red-200 text-red-700'
        }`}>
          {errorMessage}
        </div>
      )}

      {showForm && isRestaurantUser && (
        <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
          <h3 className="font-semibold text-lg">{editingExperience ? 'Editar Experiência' : 'Nova Experiência'}</h3>

          <input
            type="text"
            placeholder="Título *"
            value={form.title}
            onChange={(event) => setForm({ ...form, title: event.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          />

          <textarea
            placeholder="Descrição"
            value={form.description}
            onChange={(event) => setForm({ ...form, description: event.target.value })}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              type="url"
              placeholder="Imagem (URL)"
              value={form.image_url}
              onChange={(event) => setForm({ ...form, image_url: event.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <input
              type="text"
              placeholder="Duração (ex: 3 horas)"
              value={form.duration}
              onChange={(event) => setForm({ ...form, duration: event.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input
              type="number"
              step="0.01"
              placeholder="Preço base"
              value={form.price_from}
              onChange={(event) => setForm({ ...form, price_from: event.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <input
              type="number"
              placeholder="Grupo mínimo"
              value={form.min_group_size}
              onChange={(event) => setForm({ ...form, min_group_size: event.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <input
              type="number"
              placeholder="Grupo máximo"
              value={form.max_group_size}
              onChange={(event) => setForm({ ...form, max_group_size: event.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <input
            type="text"
            placeholder="Categoria"
            value={form.category}
            onChange={(event) => setForm({ ...form, category: event.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Tipo de experiência</label>
              <select
                value={form.schedule_type}
                onChange={(event) =>
                  setForm({
                    ...form,
                    schedule_type: event.target.value as 'one_time' | 'recurring',
                    event_date: event.target.value === 'one_time' ? form.event_date : '',
                    recurrence_days: event.target.value === 'recurring' ? form.recurrence_days : [],
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="recurring">Recorrente</option>
                <option value="one_time">Evento com data fixa</option>
              </select>
            </div>

            {form.schedule_type === 'one_time' ? (
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Data do evento</label>
                <input
                  type="date"
                  value={form.event_date}
                  onChange={(event) => setForm({ ...form, event_date: event.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            ) : (
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Dias de ocorrência (opcional)</label>
                <div className="flex flex-wrap gap-2">
                  {weekdayOptions.map((option) => (
                    <button
                      key={option.key}
                      type="button"
                      onClick={() => toggleWeekday(option.key)}
                      className={`px-2.5 py-1 rounded-full text-xs border ${
                        form.recurrence_days.includes(option.key)
                          ? 'bg-red-600 text-white border-red-600'
                          : 'bg-white text-gray-700 border-gray-300'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSaveExperience}
              className="flex-1 bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700"
            >
              {editingExperience ? 'Atualizar' : 'Criar'}
            </button>
            <button
              onClick={resetForm}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
        {visibleCategories.map((category) => (
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

      {isLoading ? (
        <div className="text-center py-10 text-gray-500">A carregar experiências...</div>
      ) : (
        <div className="space-y-4 pb-4">
          {filteredExperiences.map((experience) => {
            const canManage = isRestaurantUser && user?.userId === experience.owner_id;

            return (
              <div
                key={experience.id}
                className="bg-white rounded-xl overflow-hidden border border-gray-100 hover:border-red-200 transition-all hover:shadow-md"
              >
                <div className="relative h-48">
                  <ImageWithFallback
                    src={experience.image_url || defaultImage}
                    alt={experience.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2.5 py-1.5 rounded-full flex items-center gap-1">
                    <Star className="size-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{experience.rating?.toFixed(1) || '0.0'}</span>
                    <span className="text-xs text-gray-500">({experience.reviews_count || 0})</span>
                  </div>
                  {experience.category && (
                    <div className="absolute top-3 left-3 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                      {experience.category}
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-2">{experience.title}</h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{experience.description}</p>

                  <div className="mb-3 text-xs text-gray-600 border border-gray-200 rounded-lg px-3 py-2 bg-gray-50">
                    {experience.schedule_type === 'one_time'
                      ? `Evento em ${experience.event_date || '-'}`
                      : experience.schedule_label || 'Recorrente'}
                  </div>

                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="flex items-center gap-1.5 text-gray-600">
                      <Clock className="size-4" />
                      <span className="text-xs">{experience.duration || '-'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-600">
                      <Users className="size-4" />
                      <span className="text-xs">{experience.min_group_size || 1}-{experience.max_group_size || 1}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-600">
                      <DollarSign className="size-4" />
                      <span className="text-xs font-medium">
                        {experience.price_from != null ? `Desde $${experience.price_from}` : 'Sob consulta'}
                      </span>
                    </div>
                  </div>

                  <div className="mb-4 text-xs text-gray-600 flex items-center justify-between">
                    <span>Participantes: {experience.participants_count ?? 0}</span>
                    {experience.available_spots != null && <span>Vagas disponíveis: {experience.available_spots}</span>}
                  </div>

                  {canManage ? (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <button
                          onClick={() => toggleParticipantsPanel(experience.id)}
                          className="flex-1 bg-gray-800 text-white py-2.5 rounded-lg font-medium hover:bg-gray-900 transition-colors"
                        >
                          Participantes
                        </button>
                        <button
                          onClick={() => handleEditExperience(experience)}
                          className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                        >
                          <Edit2 className="size-4" />
                          Editar
                        </button>
                      </div>

                      <button
                        onClick={() => handleDeleteExperience(experience.id)}
                        className="w-full bg-red-600 text-white py-2.5 rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                      >
                        <Trash2 className="size-4" />
                        Remover
                      </button>

                      {openParticipantsExperienceId === experience.id && (
                        <div className="rounded-lg border border-gray-200 p-3 space-y-2 bg-gray-50">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-semibold text-gray-700">Participantes</h4>
                            {loadingParticipantsExperienceId === experience.id && (
                              <span className="text-xs text-gray-500">A carregar...</span>
                            )}
                          </div>

                          {(participantsByExperience[experience.id] || []).length === 0 ? (
                            <p className="text-xs text-gray-500">Nenhum participante ainda.</p>
                          ) : (
                            <div className="space-y-2">
                              {(participantsByExperience[experience.id] || []).map((participation) => (
                                <div key={participation.id} className="bg-white border border-gray-200 rounded-lg p-2">
                                  <div className="flex items-center justify-between gap-2 mb-2">
                                    <div>
                                      <p className="text-sm font-medium text-gray-800">{participation.participant_name || 'Utilizador'}</p>
                                      <p className="text-xs text-gray-500">
                                        {participation.people_count} pessoa(s) • {participation.reservation_date || '-'}
                                      </p>
                                    </div>
                                    <span
                                      className={`text-xs px-2 py-1 rounded-full border ${getParticipationStatusClassName(participation.status)}`}
                                    >
                                      {getParticipationStatusLabel(participation.status)}
                                    </span>
                                  </div>

                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => updateParticipationStatus(experience.id, participation.id, 'confirmed')}
                                      className="flex-1 text-xs py-1.5 rounded bg-green-600 text-white hover:bg-green-700"
                                    >
                                      Confirmar
                                    </button>
                                    <button
                                      onClick={() => updateParticipationStatus(experience.id, participation.id, 'completed')}
                                      className="flex-1 text-xs py-1.5 rounded bg-blue-600 text-white hover:bg-blue-700"
                                    >
                                      Concluir
                                    </button>
                                    <button
                                      onClick={() => updateParticipationStatus(experience.id, participation.id, 'cancelled')}
                                      className="flex-1 text-xs py-1.5 rounded bg-red-600 text-white hover:bg-red-700"
                                    >
                                      Cancelar
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {experience.is_joined && experience.my_participation ? (
                        <>
                          <div className="text-xs rounded-lg px-3 py-2 border border-green-200 bg-green-50 text-green-700">
                            Já participa • Status: {getParticipationStatusLabel(experience.my_participation.status)}
                          </div>
                          <button
                            onClick={() => handleCancelParticipation(experience)}
                            className="w-full bg-gray-700 text-white py-2.5 rounded-lg font-medium hover:bg-gray-800 transition-colors"
                          >
                            Cancelar participação
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleJoinExperience(experience)}
                          className="w-full bg-red-600 text-white py-2.5 rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                        >
                          Participar
                          <ChevronRight className="size-4" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {filteredExperiences.length === 0 && (
            <div className="text-center py-10 text-gray-500">Nenhuma experiência encontrada.</div>
          )}
        </div>
      )}
    </div>
  );
}
