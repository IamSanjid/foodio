'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Check, X, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useCategories } from '@/hooks/useCategories';
import { useMenuItems } from '@/hooks/useMenuItems';
import { Category, MenuItem } from '@/types';
import Pagination from '@/components/shared/Pagination';

export default function MenuManagement() {
  const {
    categories,
    loading: catLoading,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
  } = useCategories();

  const {
    items,
    total,
    loading: itemLoading,
    fetchItems,
    saveItem,
    deleteItem,
  } = useMenuItems();

  const [currentPage, setCurrentPage] = useState(1);
  const limit = 5;

  // Category Logic
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingCategoryName, setEditingCategoryName] = useState('');

  // Item Logic
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    image: '',
    categoryId: '',
    isAvailable: true,
  });

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchItems({ limit, offset: (currentPage - 1) * limit });
  }, [fetchItems, currentPage]);

  const handleCreateCategory = async () => {
    if (!newCategoryName) return;
    try {
      await createCategory(newCategoryName);
      setNewCategoryName('');
      setIsAddingCategory(false);
    } catch {
      alert('Failed to create category');
    }
  };

  const handleUpdateCategory = async (id: number) => {
    if (!editingCategoryName) return;
    try {
      await updateCategory(id, editingCategoryName);
      setEditingCategory(null);
    } catch {
      alert('Failed to update category');
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (!confirm('Are you sure? Items in this category will be unassigned.'))
      return;
    try {
      await deleteCategory(id);
    } catch {
      alert('Failed to delete category');
    }
  };

  const handleOpenModal = (item?: MenuItem) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name,
        price: item.price.toString(),
        description: item.description || '',
        image: item.image,
        categoryId: item.category?.id.toString() || '',
        isAvailable: item.isAvailable,
      });
    } else {
      setEditingItem(null);
      setFormData({
        name: '',
        price: '',
        description: '',
        image: '',
        categoryId: '',
        isAvailable: true,
      });
    }
    setIsModalOpen(true);
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    const { categoryId: rawCategoryId, price: rawPrice, ...rest } = formData;
    const categoryId = rawCategoryId ? parseInt(rawCategoryId, 10) : undefined;
    const payload = {
      ...rest,
      price: parseFloat(rawPrice),
      ...(categoryId !== undefined ? { categoryId } : {}),
    };

    try {
      await saveItem(payload, editingItem?.id);
      setIsModalOpen(false);
      fetchItems({ limit, offset: (currentPage - 1) * limit });
    } catch {
      alert('Failed to save item');
    }
  };

  const handleDeleteItem = async (id: number) => {
    if (!confirm('Are you sure you want to delete this menu item?')) return;
    try {
      await deleteItem(id);
      fetchItems({ limit, offset: (currentPage - 1) * limit });
    } catch {
      alert('Failed to delete item');
    }
  };

  const handleToggleAvailability = async (item: MenuItem) => {
    try {
      await saveItem({ isAvailable: !item.isAvailable }, item.id);
      fetchItems({ limit, offset: (currentPage - 1) * limit });
    } catch (err) {
      console.error(err);
    }
  };

  if (catLoading || itemLoading)
    return (
      <Loader2 className="w-10 h-10 animate-spin text-[#FF5C00] mx-auto mt-20" />
    );

  return (
    <div className="space-y-12">
      {/* Category Management */}
      <section className="bg-white p-10 rounded-[3rem] premium-shadow">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-black">Categories</h2>
          {isAddingCategory ? (
            <div className="flex gap-2">
              <input
                type="text"
                className="px-4 py-2 bg-gray-50 rounded-xl"
                placeholder="Category Name"
                autoFocus
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
              />
              <button
                onClick={handleCreateCategory}
                className="bg-green-500 text-white p-2 rounded-xl"
              >
                <Check className="w-5 h-5" />
              </button>
              <button
                onClick={() => setIsAddingCategory(false)}
                className="bg-red-500 text-white p-2 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsAddingCategory(true)}
              className="btn-primary py-2 px-4 text-sm flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add Category
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="bg-gray-50 p-6 rounded-2xl flex items-center justify-between group"
            >
              {editingCategory?.id === cat.id ? (
                <div className="flex gap-2 w-full">
                  <input
                    type="text"
                    className="px-4 py-2 bg-white rounded-xl grow"
                    autoFocus
                    value={editingCategoryName}
                    onChange={(e) => setEditingCategoryName(e.target.value)}
                  />
                  <button
                    onClick={() => handleUpdateCategory(cat.id)}
                    className="text-green-500 p-1"
                  >
                    <Check className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setEditingCategory(null)}
                    className="text-red-500 p-1"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <>
                  <span className="font-bold text-lg">{cat.name}</span>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                    <button
                      onClick={() => {
                        setEditingCategory(cat);
                        setEditingCategoryName(cat.name);
                      }}
                      className="text-gray-300 hover:text-blue-500"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(cat.id)}
                      className="text-gray-300 hover:text-red-500"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Menu Item Management */}
      <section className="bg-white p-10 rounded-[3rem] premium-shadow">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-black">Menu Items</h2>
          <button
            onClick={() => handleOpenModal()}
            className="btn-primary py-2 px-4 text-sm flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add New Item
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-gray-100">
                <th className="pb-4 font-bold text-gray-400">Item</th>
                <th className="pb-4 font-bold text-gray-400">Category</th>
                <th className="pb-4 font-bold text-gray-400">Price</th>
                <th className="pb-4 font-bold text-gray-400">Availability</th>
                <th className="pb-4 font-bold text-gray-400 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-gray-50 last:border-0 group"
                >
                  <td className="py-6 flex items-center gap-4">
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden shadow-sm">
                      <Image
                        src={
                          item.image ||
                          'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200'
                        }
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <span className="font-bold">{item.name}</span>
                  </td>
                  <td className="py-6 font-medium text-gray-600">
                    {item.category?.name || 'N/A'}
                  </td>
                  <td className="py-6 font-black text-[#FF5C00]">
                    ${item.price}
                  </td>
                  <td className="py-6">
                    <button
                      onClick={() => handleToggleAvailability(item)}
                      className={`px-3 py-1 rounded-full text-xs font-bold ${item.isAvailable ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}
                    >
                      {item.isAvailable ? 'Available' : 'Unavailable'}
                    </button>
                  </td>
                  <td className="py-6 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                      <button
                        onClick={() => handleOpenModal(item)}
                        className="p-2 text-gray-400 hover:text-blue-500 bg-gray-50 rounded-lg"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="p-2 text-gray-400 hover:text-red-500 bg-gray-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={currentPage}
          total={total}
          limit={limit}
          onPageChange={setCurrentPage}
        />
      </section>

      {/* Menu Item Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white w-full max-w-2xl rounded-[3rem] p-10 premium-shadow max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-black">
                {editingItem ? 'Edit' : 'Add'} Menu Item
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2">
                  <label className="text-sm font-bold text-gray-500 mb-2 block">
                    Item Name
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full bg-gray-50 h-14 px-6 rounded-2xl focus:ring-2 focus:ring-[#FF5C00] outline-none transition-all"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="text-sm font-bold text-gray-500 mb-2 block">
                    Price ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    className="w-full bg-gray-50 h-14 px-6 rounded-2xl focus:ring-2 focus:ring-[#FF5C00] outline-none transition-all"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="text-sm font-bold text-gray-500 mb-2 block">
                    Category
                  </label>
                  <select
                    required
                    className="w-full bg-gray-50 h-14 px-6 rounded-2xl focus:ring-2 focus:ring-[#FF5C00] outline-none transition-all appearance-none"
                    value={formData.categoryId}
                    onChange={(e) =>
                      setFormData({ ...formData, categoryId: e.target.value })
                    }
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-bold text-gray-500 mb-2 block">
                    Image URL
                  </label>
                  <input
                    type="url"
                    required
                    className="w-full bg-gray-50 h-14 px-6 rounded-2xl focus:ring-2 focus:ring-[#FF5C00] outline-none transition-all"
                    value={formData.image}
                    onChange={(e) =>
                      setFormData({ ...formData, image: e.target.value })
                    }
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-bold text-gray-500 mb-2 block">
                    Description
                  </label>
                  <textarea
                    className="w-full bg-gray-50 p-6 rounded-2xl focus:ring-2 focus:ring-[#FF5C00] outline-none transition-all h-32"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="flex justify-end gap-4 pt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-8 py-4 font-bold text-gray-500 hover:text-gray-900"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary px-10 py-4">
                  {editingItem ? 'Save Changes' : 'Create Item'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
