import { useState, type ComponentType } from 'react';
import {
  Settings,
  Send,
  // DollarSign,
  Layers,
  Truck,
  Plus,
  Edit2,
  Trash2,
  Loader2,
  Megaphone,
  Users,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { notificationsApi } from '../../api/notifications';
// import { settingsApi } from '../../api/settings';
import { categoriesApi } from '../../api/categories';
import { vehiclesApi } from '../../api/vehicles';
import { usersApi } from '../../api/users';
import { clsx } from 'clsx';
import { Modal } from '../../components/ui/Modal';
import type { DeliveryCategory, DeliveryVehicle, ApiResponse } from '../../types';
import type { AxiosError } from 'axios';

type Tab = 'pricing' | 'categories' | 'vehicles' | 'user-tools';

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('pricing');

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
            <Settings className="w-5 h-5 text-slate-400" />
          </div>
          <div>
            <p className="text-lg font-bold text-slate-700">Settings</p>
            <p className="text-xs text-slate-400">Platform-wide configuration and admin tools</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-fit">
        {/* <TabButton
          active={activeTab === 'pricing'}
          onClick={() => setActiveTab('pricing')}
          icon={DollarSign}
          label="Pricing"
        /> */}
        <TabButton
          active={activeTab === 'categories'}
          onClick={() => setActiveTab('categories')}
          icon={Layers}
          label="Categories"
        />
        <TabButton
          active={activeTab === 'vehicles'}
          onClick={() => setActiveTab('vehicles')}
          icon={Truck}
          label="Vehicles"
        />
        <TabButton
          active={activeTab === 'user-tools'}
          onClick={() => setActiveTab('user-tools')}
          icon={Users}
          label="User Tools"
        />
      </div>

      <div className="min-h-[400px]">
        {/* {activeTab === 'pricing' && <PricingTab />} */}
        {activeTab === 'categories' && <CategoriesTab />}
        {activeTab === 'vehicles' && <VehiclesTab />}
        {activeTab === 'user-tools' && <UserToolsTab />}
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
        active ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
      )}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );
}

// --- Pricing Tab ---
// function PricingTab() {
//   const queryClient = useQueryClient();
//   const [isModalOpen, setIsModalOpen] = useState(false);

//   const { data: pricing, isLoading } = useQuery({
//     queryKey: ['settings', 'pricing'],
//     queryFn: () => settingsApi.getPricingGroup(),
//   });

//   const createMutation = useMutation({
//     mutationFn: (payload: { key: string; value: string; type: string }) =>
//       settingsApi.create(payload),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['settings', 'pricing'] });
//       toast.success('Setting created');
//       setIsModalOpen(false);
//     },
//     onError: (err: AxiosError<ApiResponse<null>>) =>
//       toast.error(err.response?.data?.message || 'Failed to create setting'),
//   });

//   const updateMutation = useMutation({
//     mutationFn: ({ key, value }: { key: string; value: string }) =>
//       settingsApi.updateSetting(key, value),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['settings', 'pricing'] });
//       toast.success('Setting updated');
//     },
//     onError: () => toast.error('Failed to update setting'),
//   });

//   if (isLoading) return <LoadingState />;

//   return (
//     <div className="space-y-4">
//       <div className="flex justify-end">
//         <button onClick={() => setIsModalOpen(true)} className="btn-primary text-xs h-9">
//           <Plus className="w-4 h-4" />
//           Add Setting
//         </button>
//       </div>
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//         {pricing?.data.map((s) => (
//           <div key={s.key} className="card p-5 space-y-3">
//             <div className="flex items-center justify-between">
//               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
//                 {s.key.replace(/_/g, ' ')}
//               </p>
//               <DollarSign className="w-4 h-4 text-slate-200" />
//             </div>
//             <div className="flex gap-2">
//               <input
//                 type="text"
//                 className="input text-sm h-10"
//                 defaultValue={s.value}
//                 onBlur={(e) => {
//                   if (e.target.value !== s.value) {
//                     updateMutation.mutate({ key: s.key, value: e.target.value });
//                   }
//                 }}
//               />
//             </div>
//           </div>
//         ))}
//       </div>

//       <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Pricing Setting">
//         <PricingForm
//           onSubmit={(data) => createMutation.mutate(data)}
//           isLoading={createMutation.isPending}
//           onCancel={() => setIsModalOpen(false)}
//         />
//       </Modal>
//     </div>
//   );
// }

// function PricingForm({
//   onSubmit,
//   isLoading,
//   onCancel,
// }: {
//   onSubmit: (data: { key: string; value: string; type: string }) => void;
//   isLoading: boolean;
//   onCancel: () => void;
// }) {
//   const [formData, setFormData] = useState({
//     key: 'delivery_base_fare',
//     value: '',
//     type: 'pricing',
//   });

//   const pricingKeys = [
//     { key: 'delivery_base_fare', label: 'Base Fare' },
//     { key: 'delivery_price_per_km', label: 'Price Per KM' },
//     { key: 'delivery_weight_free_kg', label: 'Free Weight Limit (kg)' },
//     { key: 'delivery_weight_surcharge_per_kg', label: 'Weight Surcharge (per kg)' },
//     { key: 'delivery_platform_fee_rate', label: 'Platform Fee Rate (0-1)' },
//   ];

//   return (
//     <div className="space-y-4">
//       <div>
//         <label className="label">Setting Name</label>
//         <select
//           className="input h-10 text-sm"
//           value={formData.key}
//           onChange={(e) => setFormData({ ...formData, key: e.target.value })}
//         >
//           {pricingKeys.map((item) => (
//             <option key={item.key} value={item.key}>
//               {item.label}
//             </option>
//           ))}
//         </select>
//         <p className="text-[10px] text-slate-400 mt-1">Key: {formData.key}</p>
//       </div>
//       <div>
//         <label className="label">Value</label>
//         <input
//           type="text"
//           className="input h-10"
//           value={formData.value}
//           onChange={(e) => setFormData({ ...formData, value: e.target.value })}
//           placeholder="e.g. 1.5 or 500"
//         />
//       </div>
//       <div>
//         <label className="label">Group Type</label>
//         <select
//           className="input h-10 text-sm"
//           value={formData.type}
//           onChange={(e) => setFormData({ ...formData, type: e.target.value })}
//         >
//           <option value="pricing">Pricing</option>
//           <option value="general">General</option>
//           <option value="driver">Driver</option>
//           <option value="payment">Payment</option>
//         </select>
//       </div>
//       <div className="flex gap-2 pt-4">
//         <button
//           type="button"
//           onClick={onCancel}
//           className="btn-secondary flex-1 h-10"
//           disabled={isLoading}
//         >
//           Cancel
//         </button>
//         <button
//           type="button"
//           onClick={() => onSubmit(formData)}
//           className="btn-primary flex-1 h-10"
//           disabled={isLoading || !formData.key || !formData.value}
//         >
//           {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Setting'}
//         </button>
//       </div>
//     </div>
//   );
// }

// --- Categories Tab ---
function CategoriesTab() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<DeliveryCategory | null>(null);

  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.list(),
  });

  const createMutation = useMutation({
    mutationFn: (payload: Partial<DeliveryCategory>) => categoriesApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Category created');
      setIsModalOpen(false);
    },
    onError: (err: AxiosError<ApiResponse<null>>) => toast.error(err.response?.data?.message || 'Failed to create category'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<DeliveryCategory> }) =>
      categoriesApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Category updated');
      setIsModalOpen(false);
    },
    onError: (err: AxiosError<ApiResponse<null>>) => toast.error(err.response?.data?.message || 'Failed to update category'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => categoriesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Category deleted');
    },
    onError: (err: AxiosError<ApiResponse<null>>) => toast.error(err.response?.data?.message || 'Failed to delete category'),
  });

  const toggleMutation = useMutation({
    mutationFn: (id: number) => categoriesApi.toggleStatus(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Status updated');
    },
  });

  if (isLoading) return <LoadingState />;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          onClick={() => {
            setSelectedCategory(null);
            setIsModalOpen(true);
          }}
          className="btn-primary text-xs h-9"
        >
          <Plus className="w-4 h-4" />
          Add Category
        </button>
      </div>
      <div className="card overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 text-[10px] uppercase font-bold tracking-wider">
            <tr>
              <th className="px-5 py-3">Name</th>
              <th className="px-5 py-3">Surcharge</th>
              <th className="px-5 py-3">Max Weight</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {categories?.data.data.map((cat) => (
              <tr key={cat.id} className="text-sm text-slate-600 hover:bg-slate-50/50">
                <td className="px-5 py-3">
                  <p className="font-bold text-slate-800">{cat.name}</p>
                  <p className="text-[11px] text-slate-400 truncate max-w-xs">{cat.description}</p>
                </td>
                <td className="px-5 py-3 font-medium">{(cat.surcharge * 100).toFixed(0)}%</td>
                <td className="px-5 py-3">{cat.max_weight_kg}kg</td>
                <td className="px-5 py-3">
                  <button
                    onClick={() => toggleMutation.mutate(cat.id)}
                    className={clsx(
                      'px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-tight',
                      cat.is_active ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'
                    )}
                  >
                    {cat.is_active ? 'Active' : 'Inactive'}
                  </button>
                </td>
                <td className="px-5 py-3">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => {
                        setSelectedCategory(cat);
                        setIsModalOpen(true);
                      }}
                      className="p-1.5 text-slate-400 hover:text-brand-500 rounded-md hover:bg-brand-50"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Delete this category?')) {
                          deleteMutation.mutate(cat.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-red-500 rounded-md hover:bg-red-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedCategory ? 'Edit Category' : 'Add Category'}
      >
        <CategoryForm
          initialData={selectedCategory}
          onSubmit={(data) => {
            if (selectedCategory) {
              updateMutation.mutate({ id: selectedCategory.id, payload: data });
            } else {
              createMutation.mutate(data);
            }
          }}
          isLoading={createMutation.isPending || updateMutation.isPending}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
}

function CategoryForm({
  initialData,
  onSubmit,
  isLoading,
  onCancel,
}: {
  initialData: DeliveryCategory | null;
  onSubmit: (data: Partial<DeliveryCategory>) => void;
  isLoading: boolean;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    surcharge: initialData?.surcharge || 0,
    max_weight_kg: initialData?.max_weight_kg || 20,
    is_active: initialData?.is_active ?? true,
  });

  return (
    <div className="space-y-4">
      <div>
        <label className="label">Category Name</label>
        <input
          type="text"
          className="input h-10"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g. Fragile Items"
        />
      </div>
      <div>
        <label className="label">Description</label>
        <textarea
          className="input h-20 resize-none py-2"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Brief description of category"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Surcharge (0-1)</label>
          <input
            type="number"
            step="0.01"
            className="input h-10"
            value={formData.surcharge}
            onChange={(e) => setFormData({ ...formData, surcharge: parseFloat(e.target.value) })}
          />
          <p className="text-[10px] text-slate-400 mt-1">e.g. 0.15 for 15%</p>
        </div>
        <div>
          <label className="label">Max Weight (kg)</label>
          <input
            type="number"
            className="input h-10"
            value={formData.max_weight_kg}
            onChange={(e) => setFormData({ ...formData, max_weight_kg: parseInt(e.target.value) })}
          />
        </div>
      </div>
      <div className="flex items-center gap-2 pt-2">
        <input
          type="checkbox"
          id="is_active_cat"
          checked={formData.is_active}
          onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
          className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
        />
        <label htmlFor="is_active_cat" className="text-sm font-medium text-slate-700">
          Active
        </label>
      </div>
      <div className="flex gap-2 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="btn-secondary flex-1 h-10"
          disabled={isLoading}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() => onSubmit(formData)}
          className="btn-primary flex-1 h-10"
          disabled={isLoading || !formData.name}
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Category'}
        </button>
      </div>
    </div>
  );
}

// --- Vehicles Tab ---
function VehiclesTab() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<DeliveryVehicle | null>(null);

  const { data: vehicles, isLoading } = useQuery({
    queryKey: ['vehicles'],
    queryFn: () => vehiclesApi.list(),
  });

  const createMutation = useMutation({
    mutationFn: (payload: Partial<DeliveryVehicle>) => vehiclesApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      toast.success('Vehicle type created');
      setIsModalOpen(false);
    },
    onError: (err: AxiosError<ApiResponse<null>>) => toast.error(err.response?.data?.message || 'Failed to create vehicle type'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<DeliveryVehicle> }) =>
      vehiclesApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      toast.success('Vehicle type updated');
      setIsModalOpen(false);
    },
    onError: (err: AxiosError<ApiResponse<null>>) => toast.error(err.response?.data?.message || 'Failed to update vehicle type'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => vehiclesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      toast.success('Vehicle type deleted');
    },
    onError: (err: AxiosError<ApiResponse<null>>) => toast.error(err.response?.data?.message || 'Failed to delete vehicle type'),
  });

  const toggleMutation = useMutation({
    mutationFn: (id: number) => vehiclesApi.toggleStatus(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      toast.success('Status updated');
    },
  });

  if (isLoading) return <LoadingState />;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          onClick={() => {
            setSelectedVehicle(null);
            setIsModalOpen(true);
          }}
          className="btn-primary text-xs h-9"
        >
          <Plus className="w-4 h-4" />
          Add Vehicle Type
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {vehicles?.data.data.map((v) => (
          <div key={v.id} className="card p-5 group relative overflow-hidden">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
                {v.image_url ? (
                  <img src={v.image_url} alt={v.vehicle} className="w-8 h-8 object-contain" />
                ) : (
                  <Truck className="w-6 h-6 text-slate-300" />
                )}
              </div>
              <button
                onClick={() => toggleMutation.mutate(v.id)}
                className={clsx(
                  'px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-tight',
                  v.is_active ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'
                )}
              >
                {v.is_active ? 'Active' : 'Inactive'}
              </button>
            </div>
            <div>
              <p className="font-bold text-slate-800">{v.vehicle}</p>
              <p className="text-[10px] font-bold text-slate-300 mb-2 uppercase tracking-widest">Code: {v.code}</p>
              <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{v.description}</p>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between">
              <span className="text-[11px] text-slate-400 font-bold">MAX {v.max_weight_kg}KG</span>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => {
                    setSelectedVehicle(v);
                    setIsModalOpen(true);
                  }}
                  className="p-1.5 text-slate-400 hover:text-brand-500 rounded-md hover:bg-brand-50"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => {
                    if (confirm('Delete this vehicle type?')) {
                      deleteMutation.mutate(v.id);
                    }
                  }}
                  className="p-1.5 text-slate-400 hover:text-red-500 rounded-md hover:bg-red-50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedVehicle ? 'Edit Vehicle Type' : 'Add Vehicle Type'}
      >
        <VehicleForm
          initialData={selectedVehicle}
          onSubmit={(data) => {
            if (selectedVehicle) {
              updateMutation.mutate({ id: selectedVehicle.id, payload: data });
            } else {
              createMutation.mutate(data);
            }
          }}
          isLoading={createMutation.isPending || updateMutation.isPending}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
}

function VehicleForm({
  initialData,
  onSubmit,
  isLoading,
  onCancel,
}: {
  initialData: DeliveryVehicle | null;
  onSubmit: (data: Partial<DeliveryVehicle>) => void;
  isLoading: boolean;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    code: initialData?.code || '',
    type: initialData?.type || '',
    vehicle: initialData?.vehicle || '',
    description: initialData?.description || '',
    max_weight_kg: initialData?.max_weight_kg || 20,
    image_url: initialData?.image_url || '',
    is_active: initialData?.is_active ?? true,
  });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Code (Unique)</label>
          <input
            type="text"
            className="input h-10"
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
            placeholder="e.g. bike"
          />
        </div>
        <div>
          <label className="label">Vehicle Name</label>
          <input
            type="text"
            className="input h-10"
            value={formData.vehicle}
            onChange={(e) => setFormData({ ...formData, vehicle: e.target.value })}
            placeholder="e.g. Motorbike"
          />
        </div>
      </div>
      <div>
        <label className="label">Vehicle Type</label>
        <input
          type="text"
          className="input h-10"
          value={formData.type}
          onChange={(e) => setFormData({ ...formData, type: e.target.value })}
          placeholder="e.g. two_wheeler"
        />
      </div>
      <div>
        <label className="label">Description</label>
        <textarea
          className="input h-20 resize-none py-2"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Brief description"
        />
      </div>
      <div>
        <label className="label">Image URL</label>
        <input
          type="text"
          className="input h-10"
          value={formData.image_url}
          onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
          placeholder="https://..."
        />
      </div>
      <div>
        <label className="label">Max Weight (kg)</label>
        <input
          type="number"
          className="input h-10"
          value={formData.max_weight_kg}
          onChange={(e) => setFormData({ ...formData, max_weight_kg: parseInt(e.target.value) })}
        />
      </div>
      <div className="flex items-center gap-2 pt-2">
        <input
          type="checkbox"
          id="is_active_veh"
          checked={formData.is_active}
          onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
          className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
        />
        <label htmlFor="is_active_veh" className="text-sm font-medium text-slate-700">
          Active
        </label>
      </div>
      <div className="flex gap-2 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="btn-secondary flex-1 h-10"
          disabled={isLoading}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() => onSubmit(formData)}
          className="btn-primary flex-1 h-10"
          disabled={isLoading || !formData.code || !formData.vehicle}
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Vehicle'}
        </button>
      </div>
    </div>
  );
}


// --- User Tools Tab ---
function UserToolsTab() {
  const [userId, setUserId] = useState('');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [broadcastType, setBroadcastType] = useState<'all' | 'dispatchers' | 'riders'>('all');

  const notifyMutation = useMutation({
    mutationFn: () =>
      notificationsApi.sendToUser({
        user_id: Number(userId),
        title,
        body,
      }),
    onSuccess: () => {
      toast.success('Notification sent');
      setTitle('');
      setBody('');
    },
    onError: () => toast.error('Failed to send notification'),
  });

  const broadcastMutation = useMutation({
    mutationFn: () =>
      notificationsApi.sendToAll({
        title,
        message: body,
        type: 'general',
        user_type: broadcastType as 'all' | 'riders' | 'drivers' | 'dispatchers',
      }),
    onSuccess: (data) => {
      toast.success(`Broadcast sent to ${data.data.sent_count} users`);
      setTitle('');
      setBody('');
    },
    onError: () => toast.error('Failed to send broadcast'),
  });

  const suspendMutation = useMutation({
    mutationFn: (reason: string) => usersApi.suspend(Number(userId), reason),
    onSuccess: () => toast.success('User suspended'),
    onError: (err: AxiosError<ApiResponse<null>>) => toast.error(err.response?.data?.message || 'Failed to suspend'),
  });

  const unsuspendMutation = useMutation({
    mutationFn: () => usersApi.unsuspend(Number(userId)),
    onSuccess: () => toast.success('User unsuspended'),
    onError: (err: AxiosError<ApiResponse<null>>) => toast.error(err.response?.data?.message || 'Failed to unsuspend'),
  });

  const resetMutation = useMutation({
    mutationFn: () => usersApi.resetPassword(Number(userId)),
    onSuccess: () => toast.success('Password reset and sent via SMS'),
    onError: (err: AxiosError<ApiResponse<null>>) => toast.error(err.response?.data?.message || 'Reset failed'),
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Direct User Actions */}
        <div className="card p-5">
          <p className="section-title mb-4">Direct User Actions</p>
          <div className="space-y-4">
            <div>
              <label className="label">Target User ID</label>
              <input
                type="number"
                className="input h-10"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="e.g. 42"
              />
            </div>
            
            <div className="pt-4 border-t border-slate-50 space-y-4">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Notification</p>
              <div className="space-y-3">
                <input
                  type="text"
                  className="input text-sm h-10"
                  placeholder="Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
                <textarea
                  className="input text-sm h-20 resize-none"
                  placeholder="Message body"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                />
                <button
                  className="btn-primary w-full h-10 text-xs"
                  onClick={() => notifyMutation.mutate()}
                  disabled={!userId || !title || !body || notifyMutation.isPending}
                >
                  <Send className="w-3.5 h-3.5" />
                  Send Notification
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-50 space-y-3">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Moderation</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  className="btn-secondary h-10 text-xs border-red-100 text-red-600 hover:bg-red-50"
                  onClick={() => {
                    const r = prompt('Reason for suspension:');
                    if (r) suspendMutation.mutate(r);
                  }}
                  disabled={!userId || suspendMutation.isPending}
                >
                  Suspend User
                </button>
                <button
                  className="btn-secondary h-10 text-xs"
                  onClick={() => unsuspendMutation.mutate()}
                  disabled={!userId || unsuspendMutation.isPending}
                >
                  Unsuspend
                </button>
              </div>
              <button
                className="btn-secondary w-full h-10 text-xs border-orange-100 text-orange-600 hover:bg-orange-50"
                onClick={() => {
                  if (confirm('Reset user password? This will send a new 10-char password via SMS.')) {
                    resetMutation.mutate();
                  }
                }}
                disabled={!userId || resetMutation.isPending}
              >
                Reset Password
              </button>
            </div>
          </div>
        </div>

        {/* Broadcast Message */}
        <div className="card p-5 border-l-4 border-l-brand-500">
          <div className="flex items-center gap-2 mb-4">
            <Megaphone className="w-4 h-4 text-brand-500" />
            <p className="section-title">Broadcast Message</p>
          </div>
          <div className="space-y-4">
            <div>
              <label className="label">Target Audience</label>
              <select
                className="input h-10 text-sm"
                value={broadcastType}
                onChange={(e) => setBroadcastType(e.target.value as 'all' | 'dispatchers' | 'riders')}
              >
                <option value="all">All Registered Users</option>
                <option value="dispatchers">All Dispatchers</option>
                <option value="riders">Customers Only (Riders)</option>
              </select>
            </div>
            <div className="space-y-3">
              <input
                type="text"
                className="input text-sm h-10"
                placeholder="Broadcast Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <textarea
                className="input text-sm h-32 resize-none"
                placeholder="Write your announcement here..."
                value={body}
                onChange={(e) => setBody(e.target.value)}
              />
              <button
                className="btn-primary w-full h-11 bg-brand-600 hover:bg-brand-700"
                onClick={() => broadcastMutation.mutate()}
                disabled={!title || !body || broadcastMutation.isPending}
              >
                <Megaphone className="w-4 h-4" />
                Send Broadcast
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="h-64 flex flex-col items-center justify-center text-slate-400 gap-3">
      <Loader2 className="w-8 h-8 animate-spin" />
      <p className="text-sm font-medium">Loading platform configuration...</p>
    </div>
  );
}
