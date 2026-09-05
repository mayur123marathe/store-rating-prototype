import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Store, User, PaginationMeta } from '../../types';
import { DataTable, Column } from '../../components/DataTable';
import { Modal } from '../../components/Modal';
import { StarRating } from '../../components/StarRating';
import { Plus, Store as StoreIcon, AlertCircle } from 'lucide-react';

export const AdminStoresPage: React.FC = () => {
  const [stores, setStores] = useState<Store[]>([]);
  const [owners, setOwners] = useState<User[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);

  // Filters & Sorting state
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Add Store Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [ownerId, setOwnerId] = useState<string>('');
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const fetchStores = async () => {
    try {
      setLoading(true);
      const params: Record<string, any> = {
        page: pagination.page,
        limit: pagination.limit,
        sortBy,
        sortOrder,
      };

      if (search.trim()) params.search = search.trim();

      const res = await api.get('/admin/stores', { params });
      setStores(res.data.data.stores);
      setPagination(res.data.data.pagination);
    } catch (err) {
      console.error('Error fetching stores:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchOwners = async () => {
    try {
      const res = await api.get('/admin/users', { params: { role: 'STORE_OWNER', limit: 100 } });
      setOwners(res.data.data.users);
    } catch (err) {
      console.error('Error fetching owners:', err);
    }
  };

  useEffect(() => {
    fetchStores();
  }, [pagination.page, sortBy, sortOrder]);

  useEffect(() => {
    fetchOwners();
  }, []);

  // Debounced search trigger
  useEffect(() => {
    const handler = setTimeout(() => {
      setPagination((prev) => ({ ...prev, page: 1 }));
      fetchStores();
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  const handleSort = (columnKey: string) => {
    if (sortBy === columnKey) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(columnKey);
      setSortOrder('asc');
    }
  };

  const isAddressValid = address.trim().length > 0 && address.trim().length <= 400;

  const handleCreateStore = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);

    if (!isAddressValid) {
      setCreateError('Address must be between 1 and 400 characters long.');
      return;
    }

    setCreateLoading(true);

    try {
      await api.post('/admin/stores', {
        name: name.trim(),
        email: email.trim(),
        address: address.trim(),
        ownerId: ownerId || null,
      });

      setIsModalOpen(false);
      setName('');
      setEmail('');
      setAddress('');
      setOwnerId('');
      fetchStores();
    } catch (err: any) {
      setCreateError(
        err.response?.data?.errors?.[0]?.message ||
        err.response?.data?.message ||
        'Failed to create store.'
      );
    } finally {
      setCreateLoading(false);
    }
  };

  const columns: Column<Store>[] = [
    {
      header: 'Store Name',
      accessor: 'name',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
            <StoreIcon className="w-4 h-4" />
          </div>
          <div>
            <p className="font-semibold text-slate-900 dark:text-slate-100">{row.name}</p>
            {row.owner && (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Owner: <span className="font-medium text-slate-700 dark:text-slate-300">{row.owner.name}</span>
              </p>
            )}
          </div>
        </div>
      ),
    },
    {
      header: 'Store Email',
      accessor: 'email',
      sortable: true,
      render: (row) => <span className="text-slate-600 dark:text-slate-400 font-mono text-xs">{row.email}</span>,
    },
    {
      header: 'Address',
      accessor: 'address',
      sortable: true,
      render: (row) => (
        <span className="text-slate-600 dark:text-slate-400 text-xs max-w-xs truncate block" title={row.address}>
          {row.address}
        </span>
      ),
    },
    {
      header: 'Overall Rating',
      accessor: 'overallRating',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-2">
          <StarRating rating={row.overallRating} size="sm" />
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
            {row.overallRating > 0 ? row.overallRating.toFixed(2) : '0.00'}
          </span>
          <span className="text-[11px] text-slate-400">
            ({row.ratingCount})
          </span>
        </div>
      ),
    },
  ];

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Store Registry & Ratings
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Browse all stores, review score indexes, and add new verified merchant locations
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-500/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          Add New Store
        </button>
      </div>

      {/* Stores DataTable */}
      <DataTable
        columns={columns}
        data={stores}
        loading={loading}
        pagination={pagination}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
        onPageChange={(page) => setPagination((prev) => ({ ...prev, page }))}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Filter stores by Name, Email, or Address..."
      />

      {/* Add Store Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Register New Store"
        maxWidth="lg"
      >
        {createError && (
          <div className="mb-4 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex items-center gap-2.5 text-rose-600 dark:text-rose-400 text-xs">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{createError}</span>
          </div>
        )}

        <form onSubmit={handleCreateStore} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
              Store Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Apex Electronics & Gadget Hub"
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                Store Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="store@domain.com"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                Assign Store Owner (Optional)
              </label>
              <select
                value={ownerId}
                onChange={(e) => setOwnerId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="">-- No Owner Assigned --</option>
                {owners.map((owner) => (
                  <option key={owner.id} value={owner.id}>
                    {owner.name} ({owner.email})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Store Address (Max 400 chars)
              </label>
              <span className="text-xs text-slate-400">{address.length}/400</span>
            </div>
            <textarea
              rows={3}
              required
              maxLength={400}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Commercial unit, street, district, city..."
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createLoading}
              className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-500/20 disabled:opacity-50"
            >
              {createLoading ? 'Registering Store...' : 'Register Store'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
