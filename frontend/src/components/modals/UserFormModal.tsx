import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import Modal from '../Modal';
import { usersAPI } from '@/api';
import { User, UserRole } from '@/types';

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: User | null;
}

export default function UserFormModal({ isOpen, onClose, user }: UserFormModalProps) {
  const queryClient = useQueryClient();
  const isEdit = !!user;

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: UserRole.CLIENT,
    address: '',
  });

  // Populate form when editing
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        password: '',
        phone: user.phone || '',
        role: user.role || UserRole.CLIENT,
        address: user.address || '',
      });
    } else {
      setFormData({
        name: '',
        email: '',
        password: '',
        phone: '',
        role: UserRole.CLIENT,
        address: '',
      });
    }
  }, [user]);

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: typeof formData) => usersAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('تم إضافة المستخدم بنجاح');
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'فشل في إضافة المستخدم');
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data: Partial<typeof formData>) =>
      usersAPI.update(user!._id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('تم تحديث المستخدم بنجاح');
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'فشل في تحديث المستخدم');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isEdit) {
      // Don't send password if empty when editing
      const updateData = { ...formData };
      if (!updateData.password) {
        delete updateData.password;
      }
      updateMutation.mutate(updateData);
    } else {
      createMutation.mutate(formData);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? 'تعديل مستخدم' : 'إضافة مستخدم جديد'} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium mb-2">الاسم الكامل *</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="input w-full"
            placeholder="أدخل الاسم الكامل"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium mb-2">البريد الإلكتروني *</label>
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="input w-full"
            placeholder="أدخل البريد الإلكتروني"
          />
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-medium mb-2">
            كلمة المرور {!isEdit && '*'}
          </label>
          <input
            type="password"
            required={!isEdit}
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="input w-full"
            placeholder={isEdit ? 'اتركه فارغاً للحفاظ على كلمة المرور الحالية' : 'أدخل كلمة المرور'}
          />
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium mb-2">رقم الهاتف</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="input w-full"
            placeholder="أدخل رقم الهاتف"
          />
        </div>

        {/* Role */}
        <div>
          <label className="block text-sm font-medium mb-2">الدور *</label>
          <select
            required
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
            className="input w-full"
          >
            <option value={UserRole.CLIENT}>عميل</option>
            <option value={UserRole.COMMERCIAL}>تجاري</option>
            <option value={UserRole.STORE}>متجر</option>
            <option value={UserRole.ADMIN}>مدير</option>
          </select>
        </div>

        {/* Address */}
        <div>
          <label className="block text-sm font-medium mb-2">العنوان</label>
          <textarea
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            className="input w-full"
            rows={3}
            placeholder="أدخل العنوان"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end pt-4">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-secondary"
            disabled={isLoading}
          >
            إلغاء
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isLoading}
          >
            {isLoading ? 'جاري الحفظ...' : isEdit ? 'تحديث' : 'إضافة'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
