import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { User, Role, PaginationMeta } from '../../types';
import { DataTable, Column } from '../../components/DataTable';
import { Modal } from '../../components/Modal';
import { StarRating } from '../../components/StarRating';
import { UserPlus, Shield, Briefcase, User as UserIcon, CheckCircle2, XCircle, AlertCircle, Filter } from 'lucide-react';

export const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);

  // Filters & Sorting state
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | Role>('ALL');
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Add User Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newRole, setNewRole] = useState<Role>('USER');
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params: Record<string, any> = {
        page: pagination.page,
        limit: pagination.limit,
        sortBy,
        sortOrder,
      };

      if (search.trim()) params.search = search.trim();
      if (roleFilter !== 'ALL') params.role = roleFilter;

      const res = await api.get('/admin/users', { params });
      setUsers(res.data.data.users);
      setPagination(res.data.data.pagination);
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [pagination.page, roleFilter, sortBy, sortOrder]);

  // Debounced search trigger
  useEffect(() => {
    const handler = setTimeout(() => {
      setPagination((prev) => ({ ...prev, page: 1 }));
      fetchUsers();
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

  // Password / Form validation checks
  const isNameValid = newName.trim().length >= 20 && newName.trim().length <= 60;
  const isAddressValid = newAddress.trim().length > 0 && newAddress.trim().length <= 400;
  const isLengthValid = newPassword.length >= 8 && newPassword.length <= 16;
  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(newPassword);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);

    if (!isNameValid) {
      setCreateError('Name must be between 20 and 60 characters long.');
      return;
    }
    if (!isAddressValid) {
      setCreateError('Address must be between 1 and 400 characters long.');
      return;
    }
    if (!isLengthValid || !hasUppercase || !hasSpecialChar) {
      setCreateError('Password must meet complexity rules (8-16 chars, uppercase, special char).');
      return;
    }

    setCreateLoading(true);

    try {
      await api.post('/admin/users', {
        name: newName.trim(),
        email: newEmail.trim(),
        password: newPassword,
        address: newAddress.trim(),
        role: newRole,
      });

      setIsModalOpen(false);
      setNewName('');
      setNewEmail('');
      setNewPassword('');
      setNewAddress('');
      setNewRole('USER');
      fetchUsers();
    } catch (err: any) {
      setCreateError(
        err.response?.data?.errors?.[0]?.message ||
        err.response?.data?.message ||
        'Failed to create user.'
      );
    } finally {
      setCreateLoading(false);
    }
  };

  const getRoleBadge = (role: Role) => {
    switch (role) {
      case 'ADMIN':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
            <Shield className="w-3 h-3" /> Admin
          </span>
        );
      case 'STORE_OWNER':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <Briefcase className="w-3 h-3" /> Store Owner
          </span>
        );
      case 'USER':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
            <UserIcon className="w-3 h-3" /> Normal User
          </span>
        );
    }
  };

  const columns: Column<User>[] = [
    {
      header: 'Full Name',
      accessor: 'name',
      sortable: true,
      render: (row) => (
        <div>
          <p className="font-semibold text-slate-900 dark:text-slate-100">{row.name}</p>
          {row.storeName && (
            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
              <span>Store:</span> <span className="font-medium text-slate-700 dark:text-slate-300">{row.storeName}</span>
            </p>
          )}
        </div>
      ),
    },
    {
      header: 'Email Address',
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
      header: 'Role',
      accessor: 'role',
      sortable: true,
      render: (row) => getRoleBadge(row.role),
    },
    {
      header: 'Store Rating',
      accessor: 'storeRating',
      sortable: true,
      render: (row) => {
        if (row.role !== 'STORE_OWNER') {
          return <span className="text-xs text-slate-400 italic">N/A (Not Owner)</span>;
        }
        if (row.storeRating === null || row.storeRating === undefined) {
          return <span className="text-xs text-slate-400 italic">No store assigned</span>;
        }
        return (
          <div className="flex items-center gap-1.5">
            <StarRating rating={row.storeRating} size="sm" />
            <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
              {row.storeRating > 0 ? row.storeRating.toFixed(2) : '0.00'}
            </span>
          </div>
        );
      },
    },
  ];

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            User Directory & Management
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            View, filter, sort, and register system administrators, store owners, and normal users
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-500/20 transition-all"
        >
          <UserPlus className="w-4 h-4" />
          Add New User
        </button>
      </div>

      {/* Users DataTable */}
      <DataTable
        columns={columns}
        data={users}
        loading={loading}
        pagination={pagination}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
        onPageChange={(page) => setPagination((prev) => ({ ...prev, page }))}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Filter by Name, Email, or Address..."
        filterComponent={
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value as any);
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
              className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="ALL">All Roles</option>
              <option value="ADMIN">Admins Only</option>
              <option value="STORE_OWNER">Store Owners Only</option>
              <option value="USER">Normal Users Only</option>
            </select>
          </div>
        }
      />

      {/* Add User Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Register New Platform User"
        maxWidth="lg"
      >
        {createError && (
          <div className="mb-4 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex items-center gap-2.5 text-rose-600 dark:text-rose-400 text-xs">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{createError}</span>
          </div>
        )}

        <form onSubmit={handleCreateUser} className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Full Name (Min 20, Max 60)
              </label>
              <span className={`text-xs font-medium ${isNameValid ? 'text-emerald-500' : 'text-amber-500'}`}>
                {newName.length}/60
              </span>
            </div>
            <input
              type="text"
              required
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. Jonathan Christopher Davis"
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="user@example.com"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                User Role
              </label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as Role)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="USER">Normal User</option>
                <option value="STORE_OWNER">Store Owner</option>
                <option value="ADMIN">System Administrator</option>
              </select>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Address (Max 400 chars)
              </label>
              <span className="text-xs text-slate-400">{newAddress.length}/400</span>
            </div>
            <textarea
              rows={2}
              required
              maxLength={400}
              value={newAddress}
              onChange={(e) => setNewAddress(e.target.value)}
              placeholder="Physical street address..."
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
              Password (8-16 chars, 1 uppercase, 1 special char)
            </label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />

            <div className="mt-2 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 grid grid-cols-3 gap-1 text-[11px]">
              <span className={isLengthValid ? 'text-emerald-500 flex items-center gap-1 font-medium' : 'text-slate-400 flex items-center gap-1'}>
                {isLengthValid ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />} 8-16 chars
              </span>
              <span className={hasUppercase ? 'text-emerald-500 flex items-center gap-1 font-medium' : 'text-slate-400 flex items-center gap-1'}>
                {hasUppercase ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />} 1 Uppercase
              </span>
              <span className={hasSpecialChar ? 'text-emerald-500 flex items-center gap-1 font-medium' : 'text-slate-400 flex items-center gap-1'}>
                {hasSpecialChar ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />} 1 Special (!@#$)
              </span>
            </div>
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
              {createLoading ? 'Creating User...' : 'Create User'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
