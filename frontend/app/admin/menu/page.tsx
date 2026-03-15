'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Edit2, Loader2, Plus, Trash2, Upload, X } from 'lucide-react';
import { Cormorant_Garamond } from 'next/font/google';
import { useCategories } from '@/hooks/useCategories';
import { useMenuItems } from '@/hooks/useMenuItems';
import { uploadMenuItemImage, type MenuItemsQuery } from '@/lib/api/menu-items';
import { getErrorMessage } from '@/lib/errors';
import { Category, MenuItem } from '@/types';
import Pagination from '@/components/shared/Pagination';

type AdminTab = 'menu' | 'categories';

type FormData = {
  name: string;
  price: string;
  description: string;
  image: string;
  categoryId: string;
  isAvailable: boolean;
};

const defaultFormData: FormData = {
  name: '',
  price: '',
  description: '',
  image: '',
  categoryId: '',
  isAvailable: true,
};

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['600'],
});

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

  const [activeTab, setActiveTab] = useState<AdminTab>('menu');
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryName, setCategoryName] = useState('');
  const [formData, setFormData] = useState<FormData>(defaultFormData);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const limit = 14;
  const isEditItemMode = Boolean(editingItem);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    const query: MenuItemsQuery = { limit, offset: (currentPage - 1) * limit };
    fetchItems(query);
  }, [fetchItems, currentPage]);

  const currentFileName = useMemo(() => {
    if (!formData.image) return '';
    try {
      return decodeURIComponent(
        formData.image.split('/').pop() || 'Uploaded file'
      );
    } catch {
      return formData.image;
    }
  }, [formData.image]);

  const handleOpenModal = (item?: MenuItem) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name,
        price: item.price.toString(),
        description: item.description || '',
        image: item.image || '',
        categoryId: item.category?.id?.toString() || '',
        isAvailable: item.isAvailable,
      });
    } else {
      setEditingItem(null);
      setFormData({
        ...defaultFormData,
        categoryId: categories[0]?.id?.toString() || '',
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    setFormData(defaultFormData);
  };

  const handleOpenCategoryModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setCategoryName(category.name);
    } else {
      setEditingCategory(null);
      setCategoryName('');
    }
    setIsCategoryModalOpen(true);
  };

  const handleCloseCategoryModal = () => {
    setIsCategoryModalOpen(false);
    setEditingCategory(null);
    setCategoryName('');
  };

  const handleUploadImage = async (file: File) => {
    if (!file) return;

    try {
      setIsUploading(true);
      const data = await uploadMenuItemImage(file);
      setFormData((prev) => ({ ...prev, image: data.url }));
    } catch (error: unknown) {
      alert(getErrorMessage(error, 'Failed to upload image'));
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;
    await handleUploadImage(selectedFile);
  };

  const handleDropImage = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const droppedFile = event.dataTransfer.files?.[0];
    if (!droppedFile) return;
    await handleUploadImage(droppedFile);
  };

  const handleSaveItem = async (event: React.FormEvent) => {
    event.preventDefault();

    const { categoryId: rawCategoryId, price: rawPrice, ...rest } = formData;
    const categoryId = rawCategoryId ? parseInt(rawCategoryId, 10) : undefined;

    const payload = {
      ...rest,
      price: parseFloat(rawPrice),
      ...(categoryId !== undefined ? { categoryId } : {}),
    };

    try {
      await saveItem(payload, editingItem?.id);
      handleCloseModal();
      await fetchItems({ limit, offset: (currentPage - 1) * limit });
    } catch (error: unknown) {
      alert(getErrorMessage(error, 'Failed to save item'));
    }
  };

  const handleDeleteItem = async (id: number) => {
    if (!confirm('Are you sure you want to delete this menu item?')) return;
    try {
      await deleteItem(id);
      await fetchItems({ limit, offset: (currentPage - 1) * limit });
    } catch (error: unknown) {
      alert(getErrorMessage(error, 'Failed to delete item'));
    }
  };

  const handleToggleAvailability = async (item: MenuItem) => {
    try {
      await saveItem({ isAvailable: !item.isAvailable }, item.id);
      await fetchItems({ limit, offset: (currentPage - 1) * limit });
    } catch (error: unknown) {
      alert(getErrorMessage(error, 'Failed to update availability'));
    }
  };

  const handleSaveCategory = async (event: React.FormEvent) => {
    event.preventDefault();
    const value = categoryName.trim();
    if (!value) return;

    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, value);
      } else {
        await createCategory(value);
      }
      await fetchCategories();
      handleCloseCategoryModal();
    } catch (error: unknown) {
      alert(getErrorMessage(error, 'Failed to save category'));
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (
      !confirm(
        'Delete this category? Items in this category will be unassigned.'
      )
    ) {
      return;
    }

    try {
      await deleteCategory(id);
      await fetchCategories();
    } catch (error: unknown) {
      alert(getErrorMessage(error, 'Failed to delete category'));
    }
  };

  if (catLoading || itemLoading) {
    return (
      <Loader2 className="mx-auto mt-20 h-10 w-10 animate-spin text-[#1A4B42]" />
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-[#F8F8F8]">
      <div className="shrink-0 border-b border-gray-200 bg-white px-6 py-3">
        <h1
          className={`${cormorant.className} text-[26px] leading-[26px] font-semibold tracking-[-0.05em] text-[#1A3C34]`}
        >
          Menu Items
        </h1>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden p-6">
        <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-gray-200 bg-white">
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
            <div className="inline-flex rounded-xl bg-[#F1F1F1] p-1">
              <button
                onClick={() => setActiveTab('menu')}
                className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-colors ${
                  activeTab === 'menu'
                    ? 'bg-white text-[#2E2E2E]'
                    : 'text-gray-500'
                }`}
              >
                Menu Items
              </button>
              <button
                onClick={() => setActiveTab('categories')}
                className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-colors ${
                  activeTab === 'categories'
                    ? 'bg-white text-[#2E2E2E]'
                    : 'text-gray-500'
                }`}
              >
                Categories
              </button>
            </div>

            <button
              onClick={
                activeTab === 'menu'
                  ? () => handleOpenModal()
                  : () => handleOpenCategoryModal()
              }
              className="inline-flex items-center gap-2 rounded-full bg-[#1A4B42] px-4 py-2 text-sm font-semibold text-white"
            >
              <Plus className="h-4 w-4" />
              {activeTab === 'menu' ? 'Add Item' : 'Add Category'}
            </button>
          </div>

          {activeTab === 'menu' ? (
            <div className="flex min-h-0 flex-1 flex-col px-6 py-4">
              <div className="min-h-0 flex-1 overflow-auto">
                <table className="w-full min-w-180 text-sm text-[#2E2E2E]">
                  <thead>
                    <tr className="border-b border-gray-200 text-left text-sm font-semibold text-gray-600">
                      <th className="py-3">Name</th>
                      <th className="py-3">Category</th>
                      <th className="py-3">Price</th>
                      <th className="py-3">Status</th>
                      <th className="py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr
                        key={item.id}
                        className="border-b border-gray-100 last:border-0"
                      >
                        <td className="py-4">{item.name}</td>
                        <td className="py-4">{item.category?.name || 'N/A'}</td>
                        <td className="py-4">
                          ${Number(item.price).toFixed(2)}
                        </td>
                        <td className="py-4">
                          <button
                            onClick={() => handleToggleAvailability(item)}
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              item.isAvailable
                                ? 'bg-[#D6F5DE] text-[#1E9E51]'
                                : 'bg-red-100 text-red-600'
                            }`}
                          >
                            {item.isAvailable ? 'Available' : 'Unavailable'}
                          </button>
                        </td>
                        <td className="py-4">
                          <div className="flex items-center justify-end gap-3 text-gray-500">
                            <button
                              onClick={() => handleOpenModal(item)}
                              className="rounded-md p-1.5 text-[#7A7A7A] transition-colors hover:bg-[#EEF4F2] hover:text-[#1A3C34] active:scale-95"
                              aria-label={`Edit ${item.name}`}
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteItem(item.id)}
                              className="rounded-md p-1.5 text-[#FF4D4F] transition-colors hover:bg-red-50 hover:text-red-600 active:scale-95"
                              aria-label={`Delete ${item.name}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-auto shrink-0 pt-4">
                <Pagination
                  currentPage={currentPage}
                  total={total}
                  limit={limit}
                  onPageChange={setCurrentPage}
                />
              </div>
            </div>
          ) : (
            <div className="flex min-h-0 flex-1 flex-col px-6 py-4">
              <div className="min-h-0 flex-1 overflow-auto">
                <table className="w-full min-w-120 text-sm text-[#2E2E2E]">
                  <thead>
                    <tr className="border-b border-gray-200 text-left text-sm font-semibold text-gray-600">
                      <th className="py-3">Name</th>
                      <th className="py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map((category) => (
                      <tr
                        key={category.id}
                        className="border-b border-gray-100 last:border-0"
                      >
                        <td className="py-4">{category.name}</td>
                        <td className="py-4">
                          <div className="flex items-center justify-end gap-3 text-gray-500">
                            <button
                              onClick={() => handleOpenCategoryModal(category)}
                              className="rounded-md p-1.5 text-[#7A7A7A] transition-colors hover:bg-[#EEF4F2] hover:text-[#1A3C34] active:scale-95"
                              aria-label={`Edit ${category.name}`}
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteCategory(category.id)}
                              className="rounded-md p-1.5 text-[#FF4D4F] transition-colors hover:bg-red-50 hover:text-red-600 active:scale-95"
                              aria-label={`Delete ${category.name}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 p-6">
          <div className="max-h-[calc(100vh-3rem)] w-full max-w-128 overflow-y-auto rounded-xl border border-[#E6E2D8] bg-[#FBFAF8] px-[25px] pb-[24px] pt-[24px] shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)]">
            <div className="mb-5 flex h-[18px] items-center justify-between">
              <h2 className="text-[18px] leading-[18px] font-bold text-[#1A3C34]">
                {isEditItemMode ? 'Edit Item' : 'Add New Item'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="opacity-70 text-[#7A7A7A]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm leading-[14px] font-medium tracking-[-0.150391px] text-[#1A1A1A]">
                    Name
                  </label>
                  <input
                    type="text"
                    required
                    className="h-9 w-full rounded-md border border-[#E6E2D8] bg-white px-3 text-sm leading-5 tracking-[-0.150391px] text-[#292929] outline-none"
                    value={formData.name}
                    onChange={(event) =>
                      setFormData((prev) => ({
                        ...prev,
                        name: event.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm leading-[14px] font-medium tracking-[-0.150391px] text-[#1A1A1A]">
                    Price
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    className="h-9 w-full rounded-md border border-[#E6E2D8] bg-white px-3 text-sm leading-5 tracking-[-0.150391px] text-[#292929] outline-none"
                    value={formData.price}
                    onChange={(event) =>
                      setFormData((prev) => ({
                        ...prev,
                        price: event.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm leading-[14px] font-medium tracking-[-0.150391px] text-[#1A1A1A]">
                  Category
                </label>
                <select
                  required
                  className="h-9 w-full rounded-md border border-[#E6E2D8] bg-white px-3 text-sm leading-5 tracking-[-0.150391px] text-[#292929] outline-none"
                  value={formData.categoryId}
                  onChange={(event) =>
                    setFormData((prev) => ({
                      ...prev,
                      categoryId: event.target.value,
                    }))
                  }
                >
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm leading-[14px] font-medium tracking-[-0.150391px] text-[#1A1A1A]">
                  Description
                </label>
                {isEditItemMode ? (
                  <input
                    type="text"
                    className="h-9 w-full rounded-md border border-[#E6E2D8] bg-white px-3 text-sm leading-5 tracking-[-0.150391px] text-[#292929] outline-none"
                    value={formData.description}
                    onChange={(event) =>
                      setFormData((prev) => ({
                        ...prev,
                        description: event.target.value,
                      }))
                    }
                  />
                ) : (
                  <textarea
                    className="h-25 w-full rounded-md border border-[#E6E2D8] bg-white px-3 py-2 text-sm leading-5 tracking-[-0.150391px] text-[#292929] outline-none"
                    value={formData.description}
                    onChange={(event) =>
                      setFormData((prev) => ({
                        ...prev,
                        description: event.target.value,
                      }))
                    }
                  />
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm leading-[14px] font-medium tracking-[-0.150391px] text-[#1A1A1A]">
                  Image
                </label>

                {!isEditItemMode && (
                  <div
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={handleDropImage}
                    className="mb-2 flex h-[104px] cursor-pointer flex-col items-center justify-center rounded-md border border-[#E6E2D8] bg-white px-3 pb-[30px] pt-1 text-center"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="mb-[7px] h-[30px] w-[30px] text-[#757575]" />
                    <p className="text-sm leading-[19px] font-medium tracking-[-0.150391px] text-[#1A1A1A]">
                      Drag or click <span className="font-semibold">here</span>{' '}
                      to upload
                    </p>
                    <p className="text-[11px] leading-[15px] font-medium tracking-[-0.150391px] text-[#7A7A7A]">
                      Size must be maximum 2mb. Supported formats : PNG & JPEG
                    </p>
                  </div>
                )}

                {formData.image && (
                  <div
                    className="mb-2 flex h-[31px] cursor-pointer items-center justify-between rounded-md border border-[#E6E2D8] bg-white px-3 text-[12px] leading-4 font-medium tracking-[-0.150391px] text-[#1A1A1A]"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <span className="truncate">{currentFileName}</span>
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        setFormData((prev) => ({ ...prev, image: '' }));
                      }}
                      className="text-gray-500"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                )}

                {isEditItemMode && !formData.image && (
                  <button
                    type="button"
                    className="mb-2 flex h-[31px] w-full items-center rounded-md border border-[#E6E2D8] bg-white px-3 text-left text-[12px] leading-4 font-medium tracking-[-0.150391px] text-[#1A1A1A]"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Choose image file
                  </button>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>

              <div className="flex h-[18.39px] items-center gap-2.5">
                <button
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      isAvailable: !prev.isAvailable,
                    }))
                  }
                  className={`relative h-[18.39px] w-8 shrink-0 rounded-full transition-colors ${
                    formData.isAvailable ? 'bg-[#C7E2DD]' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`absolute left-[2px] top-[1.2px] h-4 w-4 rounded-full bg-[#1A3C34] transition-transform ${
                      formData.isAvailable ? 'translate-x-3' : 'translate-x-0'
                    }`}
                  />
                </button>
                <span className="text-sm leading-[14px] font-medium tracking-[-0.150391px] text-[#1A1A1A]">
                  Available for Order
                </span>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  disabled={isUploading}
                  className="h-9 min-w-[125.59px] rounded-[46px] bg-[#1A3C34] px-4 text-sm leading-5 font-medium tracking-[-0.150391px] text-[#FDF8F0] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isUploading ? 'Uploading...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 p-6">
          <div className="relative max-h-[calc(100vh-3rem)] w-full max-w-128 overflow-y-auto rounded-xl border border-[#E6E2D8] bg-[#FBFAF8] px-[25px] pb-6 pt-6 shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)]">
            <div className="mb-[22px] flex h-[18px] items-center justify-between">
              <h2 className="text-[18px] leading-[18px] font-bold text-[#1A3C34]">
                {editingCategory ? 'Edit Category' : 'Add Category'}
              </h2>
              <button
                onClick={handleCloseCategoryModal}
                className="opacity-70 text-[#7A7A7A]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-[31px]">
              <div>
                <label className="mb-2 block text-sm leading-[14px] font-medium tracking-[-0.150391px] text-[#1A1A1A]">
                  Name
                </label>
                <input
                  type="text"
                  required
                  value={categoryName}
                  onChange={(event) => setCategoryName(event.target.value)}
                  className="h-9 w-full rounded-md border border-[#E6E2D8] bg-white px-3 text-sm leading-5 tracking-[-0.150391px] text-[#292929] outline-none"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className={`h-9 rounded-[46px] bg-[#1A3C34] px-4 text-sm leading-5 font-medium tracking-[-0.150391px] text-white ${
                    editingCategory ? 'min-w-[93px]' : 'min-w-[63.75px]'
                  }`}
                >
                  {editingCategory ? 'Save' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
