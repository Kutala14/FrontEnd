import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Image as ImageIcon, ToggleLeft, ToggleRight } from 'lucide-react';
import { useSession } from '../../context/SessionProvider';

interface MenuManagementProps {
  restaurantId: number;
}

interface MenuItem {
  id: number;
  category_id: number;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  is_available: boolean;
}

interface MenuCategory {
  id: number;
  name: string;
}

export function MenuManagement({ restaurantId }: MenuManagementProps) {
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showItemForm, setShowItemForm] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [categoryForm, setCategoryForm] = useState({ name: '' });
  const [itemForm, setItemForm] = useState({
    name: '',
    description: '',
    price: '',
    image_url: '',
    is_available: true,
  });

  const { fetchWithAuth } = useSession();
  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    loadMenuData();
  }, [restaurantId]);

  const getEndpoint = (path: string) => (apiUrl ? `${apiUrl}${path}` : `/api${path}`);

  const loadMenuData = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetchWithAuth(getEndpoint(`/restaurants/${restaurantId}/menu`));
      if (!response.ok) {
        throw new Error('Erro ao carregar menu');
      }

      const data = await response.json();
      setCategories(Array.isArray(data.categories) ? data.categories : []);
      setMenuItems(Array.isArray(data.items) ? data.items : []);

      setSelectedCategory((current) => {
        if (current && data.categories?.some((category: MenuCategory) => category.id === current)) {
          return current;
        }
        return data.categories?.[0]?.id ?? null;
      });
    } catch {
      setError('Não foi possível carregar o menu.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCategory = async () => {
    if (!categoryForm.name.trim()) return;

    try {
      const response = await fetchWithAuth(getEndpoint(`/restaurants/${restaurantId}/menu/categories`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: categoryForm.name.trim() }),
      });

      if (!response.ok) {
        throw new Error('Erro ao adicionar categoria');
      }

      const createdCategory: MenuCategory = await response.json();
      setCategories((prev) => [...prev, createdCategory]);
      setSelectedCategory(createdCategory.id);
      setCategoryForm({ name: '' });
      setShowCategoryForm(false);
    } catch {
      setError('Não foi possível adicionar a categoria.');
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (!confirm('Tem certeza que deseja remover esta categoria? Todos os itens desta categoria serão removidos.')) return;

    try {
      const response = await fetchWithAuth(getEndpoint(`/restaurants/${restaurantId}/menu/categories/${id}`), {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Erro ao remover categoria');
      }

      setCategories((prev) => prev.filter((category) => category.id !== id));
      setMenuItems((prev) => prev.filter((item) => item.category_id !== id));
      if (selectedCategory === id) {
        setSelectedCategory(null);
      }
    } catch {
      setError('Não foi possível remover a categoria.');
    }
  };

  const handleSaveItem = async () => {
    if (!itemForm.name.trim() || !itemForm.price || !selectedCategory) return;

    const payload = {
      category_id: selectedCategory,
      name: itemForm.name.trim(),
      description: itemForm.description.trim(),
      price: Number(itemForm.price),
      image_url: itemForm.image_url.trim(),
      is_available: itemForm.is_available,
    };

    try {
      if (editingItem) {
        const response = await fetchWithAuth(
          getEndpoint(`/restaurants/${restaurantId}/menu/items/${editingItem.id}`),
          {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          },
        );

        if (!response.ok) {
          throw new Error('Erro ao atualizar item');
        }

        const updatedItem: MenuItem = await response.json();
        setMenuItems((prev) => prev.map((item) => (item.id === updatedItem.id ? updatedItem : item)));
      } else {
        const response = await fetchWithAuth(getEndpoint(`/restaurants/${restaurantId}/menu/items`), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error('Erro ao criar item');
        }

        const createdItem: MenuItem = await response.json();
        setMenuItems((prev) => [createdItem, ...prev]);
      }

      setItemForm({ name: '', description: '', price: '', image_url: '', is_available: true });
      setShowItemForm(false);
      setEditingItem(null);
    } catch {
      setError('Não foi possível guardar o item do menu.');
    }
  };

  const handleEditItem = (item: MenuItem) => {
    setEditingItem(item);
    setSelectedCategory(item.category_id);
    setItemForm({
      name: item.name,
      description: item.description || '',
      price: item.price.toString(),
      image_url: item.image_url || '',
      is_available: item.is_available,
    });
    setShowItemForm(true);
  };

  const handleDeleteItem = async (id: number) => {
    if (!confirm('Tem certeza que deseja remover este item?')) return;

    try {
      const response = await fetchWithAuth(getEndpoint(`/restaurants/${restaurantId}/menu/items/${id}`), {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Erro ao remover item');
      }

      setMenuItems((prev) => prev.filter((item) => item.id !== id));
    } catch {
      setError('Não foi possível remover o item.');
    }
  };

  const toggleItemAvailability = async (item: MenuItem) => {
    try {
      const response = await fetchWithAuth(
        getEndpoint(`/restaurants/${restaurantId}/menu/items/${item.id}`),
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ is_available: !item.is_available }),
        },
      );

      if (!response.ok) {
        throw new Error('Erro ao atualizar disponibilidade');
      }

      const updatedItem: MenuItem = await response.json();
      setMenuItems((prev) => prev.map((currentItem) => (currentItem.id === updatedItem.id ? updatedItem : currentItem)));
    } catch {
      setError('Não foi possível atualizar a disponibilidade.');
    }
  };

  const filteredItems = selectedCategory
    ? menuItems.filter((item) => item.category_id === selectedCategory)
    : menuItems;

  return (
    <div className="p-4 lg:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Gestão de Menu</h1>
          <p className="text-gray-600">Gerencie categorias e itens do menu</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">{error}</div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg">Categorias</h3>
          <button
            onClick={() => setShowCategoryForm(!showCategoryForm)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600 to-yellow-500 text-white rounded-xl font-medium hover:shadow-lg transition-shadow"
          >
            <Plus className="size-4" />
            Nova Categoria
          </button>
        </div>

        {showCategoryForm && (
          <div className="mb-4 p-4 bg-gray-50 rounded-xl space-y-3">
            <input
              type="text"
              placeholder="Nome da categoria"
              value={categoryForm.name}
              onChange={(e) => setCategoryForm({ name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <div className="flex gap-2">
              <button
                onClick={handleAddCategory}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700"
              >
                Adicionar
              </button>
              <button
                onClick={() => setShowCategoryForm(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-8 text-gray-500">A carregar menu...</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {categories.map((category) => (
              <div
                key={category.id}
                onClick={() => setSelectedCategory(selectedCategory === category.id ? null : category.id)}
                className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  selectedCategory === category.id
                    ? 'border-red-500 bg-gradient-to-r from-red-50 to-yellow-50 shadow-md'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-center">
                  <p className="font-semibold text-sm text-gray-900">{category.name}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {menuItems.filter((item) => item.category_id === category.id).length} itens
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteCategory(category.id);
                  }}
                  className="absolute top-2 right-2 p-1 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                >
                  <Trash2 className="size-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg">
            {selectedCategory
              ? `Itens - ${categories.find((category) => category.id === selectedCategory)?.name}`
              : 'Todos os Itens'}
          </h3>
          <button
            onClick={() => {
              setEditingItem(null);
              setItemForm({ name: '', description: '', price: '', image_url: '', is_available: true });
              setShowItemForm(true);
            }}
            disabled={!selectedCategory}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600 to-yellow-500 text-white rounded-xl font-medium hover:shadow-lg transition-shadow disabled:opacity-50"
          >
            <Plus className="size-4" />
            Novo Item
          </button>
        </div>

        {!selectedCategory && (
          <div className="text-center py-8 text-gray-500">Selecione uma categoria para ver e adicionar itens</div>
        )}

        {showItemForm && selectedCategory && (
          <div className="mb-6 p-6 bg-gray-50 rounded-xl space-y-4">
            <h4 className="font-semibold text-gray-900">{editingItem ? 'Editar Item' : 'Novo Item'}</h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nome *</label>
                <input
                  type="text"
                  value={itemForm.name}
                  onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Ex: Muamba de Galinha"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Preço (USD) *</label>
                <input
                  type="number"
                  step="0.01"
                  value={itemForm.price}
                  onChange={(e) => setItemForm({ ...itemForm, price: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="25.00"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Descrição</label>
              <textarea
                value={itemForm.description}
                onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                placeholder="Descreva o prato..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">URL da Imagem</label>
              <input
                type="url"
                value={itemForm.image_url}
                onChange={(e) => setItemForm({ ...itemForm, image_url: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="https://..."
              />
            </div>

            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={itemForm.is_available}
                  onChange={(e) => setItemForm({ ...itemForm, is_available: e.target.checked })}
                  className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
                />
                <span className="text-sm font-medium text-gray-700">Disponível</span>
              </label>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleSaveItem}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700"
              >
                {editingItem ? 'Atualizar' : 'Adicionar'}
              </button>
              <button
                onClick={() => {
                  setShowItemForm(false);
                  setEditingItem(null);
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {selectedCategory && filteredItems.length === 0 && !showItemForm && (
          <div className="text-center py-8 text-gray-500">Nenhum item nesta categoria. Clique em "Novo Item" para adicionar.</div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className={`border-2 rounded-xl p-4 ${
                item.is_available ? 'border-gray-200' : 'border-gray-300 bg-gray-50 opacity-75'
              }`}
            >
              <div className="flex gap-4">
                {item.image_url ? (
                  <img src={item.image_url} alt={item.name} className="w-20 h-20 rounded-lg object-cover" />
                ) : (
                  <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                    <ImageIcon className="size-8 text-gray-400" />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h4 className="font-semibold text-gray-900">{item.name}</h4>
                  </div>
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">{item.description}</p>
                  <p className="text-lg font-bold text-red-600">${item.price.toFixed(2)}</p>
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => toggleItemAvailability(item)}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${
                    item.is_available ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  {item.is_available ? <ToggleRight className="size-4" /> : <ToggleLeft className="size-4" />}
                  {item.is_available ? 'Disponível' : 'Indisponível'}
                </button>
                <button
                  onClick={() => handleEditItem(item)}
                  className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
                >
                  <Edit2 className="size-4" />
                </button>
                <button
                  onClick={() => handleDeleteItem(item.id)}
                  className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
