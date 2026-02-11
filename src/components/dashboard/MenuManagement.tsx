import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Image as ImageIcon, Star, ToggleLeft, ToggleRight } from 'lucide-react';

interface MenuManagementProps {
  restaurantId: number;
}

interface MenuItem {
  id: number;
  categoryId: number;
  name: string;
  description: string;
  price: number;
  image: string;
  isAvailable: boolean;
  isSpecial: boolean;
}

interface MenuCategory {
  id: number;
  name: string;
  icon: string;
}

export function MenuManagement({ restaurantId }: MenuManagementProps) {
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showItemForm, setShowItemForm] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  const [categoryForm, setCategoryForm] = useState({ name: '', icon: '🍽️' });
  const [itemForm, setItemForm] = useState({
    name: '',
    description: '',
    price: '',
    image: '',
    isAvailable: true,
    isSpecial: false
  });

  const iconOptions = ['🍽️', '🥗', '🍕', '🍔', '🍖', '🍜', '🍤', '🥘', '🍲', '🍱', '🍰', '🍹', '☕', '🍷'];

  useEffect(() => {
    loadMenuData();
  }, [restaurantId]);

  const loadMenuData = () => {
    const categoriesData = localStorage.getItem(`tukula_menu_categories_${restaurantId}`);
    const itemsData = localStorage.getItem(`tukula_menu_items_${restaurantId}`);

    const loadedCategories = categoriesData ? JSON.parse(categoriesData) : [
      { id: 1, name: 'Entradas', icon: '🥗' },
      { id: 2, name: 'Pratos Principais', icon: '🍖' },
      { id: 3, name: 'Bebidas', icon: '🍹' },
      { id: 4, name: 'Sobremesas', icon: '🍰' }
    ];

    const loadedItems = itemsData ? JSON.parse(itemsData) : [];

    setCategories(loadedCategories);
    setMenuItems(loadedItems);

    if (!categoriesData) {
      localStorage.setItem(`tukula_menu_categories_${restaurantId}`, JSON.stringify(loadedCategories));
    }
  };

  const saveCategories = (cats: MenuCategory[]) => {
    localStorage.setItem(`tukula_menu_categories_${restaurantId}`, JSON.stringify(cats));
    setCategories(cats);
  };

  const saveMenuItems = (items: MenuItem[]) => {
    localStorage.setItem(`tukula_menu_items_${restaurantId}`, JSON.stringify(items));
    setMenuItems(items);
  };

  const handleAddCategory = () => {
    if (!categoryForm.name.trim()) return;

    const newCategory = {
      id: Date.now(),
      name: categoryForm.name,
      icon: categoryForm.icon
    };

    saveCategories([...categories, newCategory]);
    setCategoryForm({ name: '', icon: '🍽️' });
    setShowCategoryForm(false);
  };

  const handleDeleteCategory = (id: number) => {
    if (!confirm('Tem certeza que deseja remover esta categoria? Todos os itens desta categoria serão removidos.')) return;

    saveCategories(categories.filter(c => c.id !== id));
    saveMenuItems(menuItems.filter(i => i.categoryId !== id));
  };

  const handleSaveItem = () => {
    if (!itemForm.name.trim() || !itemForm.price || !selectedCategory) return;

    if (editingItem) {
      const updatedItems = menuItems.map(item =>
        item.id === editingItem.id
          ? { ...editingItem, ...itemForm, price: parseFloat(itemForm.price), categoryId: selectedCategory }
          : item
      );
      saveMenuItems(updatedItems);
    } else {
      const newItem: MenuItem = {
        id: Date.now(),
        categoryId: selectedCategory,
        name: itemForm.name,
        description: itemForm.description,
        price: parseFloat(itemForm.price),
        image: itemForm.image,
        isAvailable: itemForm.isAvailable,
        isSpecial: itemForm.isSpecial
      };
      saveMenuItems([...menuItems, newItem]);
    }

    setItemForm({ name: '', description: '', price: '', image: '', isAvailable: true, isSpecial: false });
    setShowItemForm(false);
    setEditingItem(null);
  };

  const handleEditItem = (item: MenuItem) => {
    setEditingItem(item);
    setItemForm({
      name: item.name,
      description: item.description,
      price: item.price.toString(),
      image: item.image,
      isAvailable: item.isAvailable,
      isSpecial: item.isSpecial
    });
    setSelectedCategory(item.categoryId);
    setShowItemForm(true);
  };

  const handleDeleteItem = (id: number) => {
    if (!confirm('Tem certeza que deseja remover este item?')) return;
    saveMenuItems(menuItems.filter(i => i.id !== id));
  };

  const toggleItemAvailability = (id: number) => {
    const updatedItems = menuItems.map(item =>
      item.id === id ? { ...item, isAvailable: !item.isAvailable } : item
    );
    saveMenuItems(updatedItems);
  };

  const filteredItems = selectedCategory
    ? menuItems.filter(item => item.categoryId === selectedCategory)
    : menuItems;

  return (
    <div className="p-4 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Gestão de Menu</h1>
          <p className="text-gray-600">Gerencie categorias e itens do menu</p>
        </div>
      </div>

      {/* Categories */}
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
              onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Escolha um ícone:</label>
              <div className="flex flex-wrap gap-2">
                {iconOptions.map(icon => (
                  <button
                    key={icon}
                    onClick={() => setCategoryForm({ ...categoryForm, icon })}
                    className={`w-12 h-12 text-2xl rounded-lg border-2 transition-colors ${
                      categoryForm.icon === icon
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>
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

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {categories.map(category => (
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
                <div className="text-3xl mb-2">{category.icon}</div>
                <p className="font-semibold text-sm text-gray-900">{category.name}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {menuItems.filter(i => i.categoryId === category.id).length} itens
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
      </div>

      {/* Menu Items */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg">
            {selectedCategory
              ? `Itens - ${categories.find(c => c.id === selectedCategory)?.name}`
              : 'Todos os Itens'}
          </h3>
          <button
            onClick={() => {
              setEditingItem(null);
              setItemForm({ name: '', description: '', price: '', image: '', isAvailable: true, isSpecial: false });
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
          <div className="text-center py-8 text-gray-500">
            Selecione uma categoria para ver e adicionar itens
          </div>
        )}

        {showItemForm && selectedCategory && (
          <div className="mb-6 p-6 bg-gray-50 rounded-xl space-y-4">
            <h4 className="font-semibold text-gray-900">
              {editingItem ? 'Editar Item' : 'Novo Item'}
            </h4>

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
                value={itemForm.image}
                onChange={(e) => setItemForm({ ...itemForm, image: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="https://..."
              />
            </div>

            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={itemForm.isAvailable}
                  onChange={(e) => setItemForm({ ...itemForm, isAvailable: e.target.checked })}
                  className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
                />
                <span className="text-sm font-medium text-gray-700">Disponível</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={itemForm.isSpecial}
                  onChange={(e) => setItemForm({ ...itemForm, isSpecial: e.target.checked })}
                  className="w-4 h-4 text-yellow-600 rounded focus:ring-yellow-500"
                />
                <span className="text-sm font-medium text-gray-700">Especial do Dia</span>
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
          <div className="text-center py-8 text-gray-500">
            Nenhum item nesta categoria. Clique em "Novo Item" para adicionar.
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredItems.map(item => (
            <div key={item.id} className={`border-2 rounded-xl p-4 ${
              item.isAvailable ? 'border-gray-200' : 'border-gray-300 bg-gray-50 opacity-75'
            }`}>
              <div className="flex gap-4">
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-20 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                    <ImageIcon className="size-8 text-gray-400" />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h4 className="font-semibold text-gray-900">{item.name}</h4>
                    {item.isSpecial && (
                      <Star className="size-4 text-yellow-500 fill-yellow-500 flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">{item.description}</p>
                  <p className="text-lg font-bold text-red-600">${item.price.toFixed(2)}</p>
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => toggleItemAvailability(item.id)}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${
                    item.isAvailable
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  {item.isAvailable ? <ToggleRight className="size-4" /> : <ToggleLeft className="size-4" />}
                  {item.isAvailable ? 'Disponível' : 'Indisponível'}
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
