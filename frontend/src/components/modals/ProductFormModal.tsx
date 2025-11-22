import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import Modal from '../Modal';
import { productsAPI } from '@/api';
import { Product } from '@/types';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: Product | null;
}

export default function ProductFormModal({ isOpen, onClose, product }: ProductFormModalProps) {
  const queryClient = useQueryClient();
  const isEdit = !!product;

  const [formData, setFormData] = useState({
    title: '',
    titleAr: '',
    description: '',
    descriptionAr: '',
    SKU: '',
    category: '',
    retailPrice: 0,
    costPrice: 0,
    stockQuantity: 0,
    isSpecial: false,
  });

  // Populate form when editing
  useEffect(() => {
    if (product) {
      setFormData({
        title: product.title || '',
        titleAr: product.titleAr || '',
        description: product.description || '',
        descriptionAr: product.descriptionAr || '',
        SKU: product.SKU || '',
        category: typeof product.category === 'object' ? product.category._id : product.category || '',
        retailPrice: product.price?.retail || 0,
        costPrice: product.price?.cost || 0,
        stockQuantity: product.stock?.quantity || 0,
        isSpecial: product.isSpecial || false,
      });
    } else {
      setFormData({
        title: '',
        titleAr: '',
        description: '',
        descriptionAr: '',
        SKU: '',
        category: '',
        retailPrice: 0,
        costPrice: 0,
        stockQuantity: 0,
        isSpecial: false,
      });
    }
  }, [product]);

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: any) => productsAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast.success('تم إضافة المنتج بنجاح');
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'فشل في إضافة المنتج');
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data: any) => productsAPI.update(product!._id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast.success('تم تحديث المنتج بنجاح');
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'فشل في تحديث المنتج');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const submitData = {
      title: formData.title,
      titleAr: formData.titleAr,
      description: formData.description,
      descriptionAr: formData.descriptionAr,
      SKU: formData.SKU,
      category: formData.category,
      price: {
        retail: formData.retailPrice,
        cost: formData.costPrice,
      },
      stock: {
        quantity: formData.stockQuantity,
      },
      isSpecial: formData.isSpecial,
    };

    if (isEdit) {
      updateMutation.mutate(submitData);
    } else {
      createMutation.mutate(submitData);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'تعديل منتج' : 'إضافة منتج جديد'}
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-2">العنوان (English) *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="input w-full"
              placeholder="Enter product title"
            />
          </div>

          {/* Title Arabic */}
          <div>
            <label className="block text-sm font-medium mb-2">العنوان (عربي) *</label>
            <input
              type="text"
              required
              value={formData.titleAr}
              onChange={(e) => setFormData({ ...formData, titleAr: e.target.value })}
              className="input w-full"
              placeholder="أدخل عنوان المنتج"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium mb-2">الوصف (English)</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="input w-full"
            rows={3}
            placeholder="Enter product description"
          />
        </div>

        {/* Description Arabic */}
        <div>
          <label className="block text-sm font-medium mb-2">الوصف (عربي)</label>
          <textarea
            value={formData.descriptionAr}
            onChange={(e) => setFormData({ ...formData, descriptionAr: e.target.value })}
            className="input w-full"
            rows={3}
            placeholder="أدخل وصف المنتج"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* SKU */}
          <div>
            <label className="block text-sm font-medium mb-2">رمز المنتج (SKU) *</label>
            <input
              type="text"
              required
              value={formData.SKU}
              onChange={(e) => setFormData({ ...formData, SKU: e.target.value })}
              className="input w-full"
              placeholder="SKU-001"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium mb-2">الفئة</label>
            <input
              type="text"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="input w-full"
              placeholder="أدخل الفئة"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Retail Price */}
          <div>
            <label className="block text-sm font-medium mb-2">سعر التجزئة (TND) *</label>
            <input
              type="number"
              required
              min="0"
              step="0.01"
              value={formData.retailPrice}
              onChange={(e) => setFormData({ ...formData, retailPrice: parseFloat(e.target.value) })}
              className="input w-full"
              placeholder="0.00"
            />
          </div>

          {/* Cost Price */}
          <div>
            <label className="block text-sm font-medium mb-2">سعر التكلفة (TND) *</label>
            <input
              type="number"
              required
              min="0"
              step="0.01"
              value={formData.costPrice}
              onChange={(e) => setFormData({ ...formData, costPrice: parseFloat(e.target.value) })}
              className="input w-full"
              placeholder="0.00"
            />
          </div>

          {/* Stock Quantity */}
          <div>
            <label className="block text-sm font-medium mb-2">الكمية في المخزون</label>
            <input
              type="number"
              min="0"
              value={formData.stockQuantity}
              onChange={(e) => setFormData({ ...formData, stockQuantity: parseInt(e.target.value) })}
              className="input w-full"
              placeholder="0"
            />
          </div>
        </div>

        {/* Is Special */}
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="isSpecial"
            checked={formData.isSpecial}
            onChange={(e) => setFormData({ ...formData, isSpecial: e.target.checked })}
            className="w-4 h-4 text-gold bg-gray-100 border-gray-300 rounded focus:ring-gold focus:ring-2"
          />
          <label htmlFor="isSpecial" className="text-sm font-medium">
            منتج قابل للتخصيص (Special Product)
          </label>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-secondary"
            disabled={isLoading}
          >
            إلغاء
          </button>
          <button type="submit" className="btn btn-primary" disabled={isLoading}>
            {isLoading ? 'جاري الحفظ...' : isEdit ? 'تحديث' : 'إضافة'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
