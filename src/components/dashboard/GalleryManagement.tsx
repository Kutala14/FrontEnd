import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Image as ImageIcon } from 'lucide-react';
import { useSession } from '../../context/SessionProvider';

interface GalleryManagementProps {
  restaurantId: number;
}

interface GalleryItem {
  id: number;
  restaurant_id: number;
  title: string;
  image_url: string;
  created_at?: string;
}

export function GalleryManagement({ restaurantId }: GalleryManagementProps) {
  const { fetchWithAuth } = useSession();
  const apiUrl = import.meta.env.VITE_API_URL;

  const [items, setItems] = useState<GalleryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);
  const [form, setForm] = useState({
    title: '',
    image_url: '',
  });

  const getEndpoint = (path: string) => (apiUrl ? `${apiUrl}${path}` : `/api${path}`);

  useEffect(() => {
    loadGallery();
  }, [restaurantId]);

  const loadGallery = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(getEndpoint(`/restaurants/${restaurantId}/gallery`));
      if (!response.ok) {
        throw new Error('Erro ao carregar galeria');
      }

      const data = await response.json();
      setItems(Array.isArray(data.items) ? data.items : []);
    } catch {
      setError('Não foi possível carregar a galeria.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setForm({ title: '', image_url: '' });
    setEditingItem(null);
    setShowForm(false);
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.image_url.trim()) return;

    setError('');

    try {
      if (editingItem) {
        const response = await fetchWithAuth(
          getEndpoint(`/restaurants/${restaurantId}/gallery/items/${editingItem.id}`),
          {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: form.title.trim(),
              image_url: form.image_url.trim(),
            }),
          },
        );

        if (!response.ok) {
          throw new Error('Erro ao atualizar imagem');
        }

        const updatedItem: GalleryItem = await response.json();
        setItems((prev) => prev.map((item) => (item.id === updatedItem.id ? updatedItem : item)));
      } else {
        const response = await fetchWithAuth(getEndpoint(`/restaurants/${restaurantId}/gallery/items`), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: form.title.trim(),
            image_url: form.image_url.trim(),
          }),
        });

        if (!response.ok) {
          throw new Error('Erro ao criar imagem');
        }

        const createdItem: GalleryItem = await response.json();
        setItems((prev) => [createdItem, ...prev]);
      }

      resetForm();
    } catch {
      setError('Não foi possível guardar a imagem da galeria.');
    }
  };

  const handleEdit = (item: GalleryItem) => {
    setEditingItem(item);
    setForm({
      title: item.title,
      image_url: item.image_url,
    });
    setShowForm(true);
  };

  const handleDelete = async (itemId: number) => {
    if (!confirm('Tem certeza que deseja remover esta imagem da galeria?')) return;

    setError('');

    try {
      const response = await fetchWithAuth(getEndpoint(`/restaurants/${restaurantId}/gallery/items/${itemId}`), {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Erro ao remover imagem');
      }

      setItems((prev) => prev.filter((item) => item.id !== itemId));
    } catch {
      setError('Não foi possível remover a imagem.');
    }
  };

  return (
    <div className="p-4 lg:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Galeria</h1>
          <p className="text-gray-600">Adicione imagens que vão aparecer na página pública do hotel</p>
        </div>

        <button
          onClick={() => {
            setEditingItem(null);
            setForm({ title: '', image_url: '' });
            setShowForm((prev) => !prev);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600 to-yellow-500 text-white rounded-xl font-medium hover:shadow-lg transition-shadow"
        >
          <Plus className="size-4" />
          Nova Imagem
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">{error}</div>
      )}

      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h3 className="font-bold text-lg">{editingItem ? 'Editar imagem' : 'Nova imagem da galeria'}</h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Título *</label>
            <input
              type="text"
              value={form.title}
              onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Ex: Área externa ao pôr do sol"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">URL da Imagem *</label>
            <input
              type="url"
              value={form.image_url}
              onChange={(event) => setForm((prev) => ({ ...prev, image_url: event.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="https://..."
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700"
            >
              {editingItem ? 'Atualizar' : 'Adicionar'}
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

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        {isLoading ? (
          <div className="text-center py-8 text-gray-500">A carregar galeria...</div>
        ) : items.length === 0 ? (
          <div className="text-center py-8 text-gray-500">Sem imagens na galeria. Clique em "Nova Imagem" para adicionar.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {items.map((item) => (
              <div key={item.id} className="border border-gray-200 rounded-xl overflow-hidden bg-white">
                <div className="h-44 w-full bg-gray-100">
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="size-10 text-gray-400" />
                    </div>
                  )}
                </div>

                <div className="p-4 space-y-3">
                  <h4 className="font-semibold text-gray-900">{item.title}</h4>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(item)}
                      className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg font-medium hover:bg-blue-100"
                    >
                      <Edit2 className="size-4" />
                      Editar
                    </button>

                    <button
                      onClick={() => handleDelete(item.id)}
                      className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 bg-red-50 text-red-700 rounded-lg font-medium hover:bg-red-100"
                    >
                      <Trash2 className="size-4" />
                      Remover
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
