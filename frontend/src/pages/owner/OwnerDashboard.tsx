import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { StoreOwnerDashboardData, RatingReviewer, PaginationMeta } from '../../types';
import { DataTable, Column } from '../../components/DataTable';
import { StarRating } from '../../components/StarRating';
import { Store, Star, Users, MapPin, Mail, Award, AlertCircle } from 'lucide-react';

export const OwnerDashboard: React.FC = () => {
  const [data, setData] = useState<StoreOwnerDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  // Reviewers pagination & sorting
  const [pagination, setPagination] = useState<PaginationMeta>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const params: Record<string, any> = {
        page: pagination.page,
        limit: pagination.limit,
        sortBy,
        sortOrder,
      };

      if (search.trim()) params.search = search.trim();

      const res = await api.get('/stores/owner/dashboard', { params });
      setData(res.data.data);
      if (res.data.data?.pagination) {
        setPagination(res.data.data.pagination);
      }
    } catch (err) {
      console.error('Error fetching owner dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [pagination.page, sortBy, sortOrder]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPagination((prev) => ({ ...prev, page: 1 }));
      fetchDashboardData();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleSort = (columnKey: string) => {
    if (sortBy === columnKey) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(columnKey);
      setSortOrder('asc');
    }
  };

  if (loading && !data) {
    return (
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 animate-pulse space-y-6">
        <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-3xl"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-40 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
          <div className="h-40 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
          <div className="h-40 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  if (!data?.hasStore || !data.store) {
    return (
      <div className="max-w-3xl mx-auto py-16 px-4 text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          No Store Assigned Yet
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
          {data?.message ||
            'Your store owner account is not currently linked to an active store. Please contact the system administrator to assign your merchant profile.'}
        </p>
      </div>
    );
  }

  const { store } = data;
  const totalRatings = store.totalRatings || 0;

  const columns: Column<RatingReviewer>[] = [
    {
      header: 'Reviewer Name',
      accessor: 'name',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold text-xs flex items-center justify-center">
            {row.user.name.charAt(0)}
          </div>
          <span className="font-semibold text-slate-900 dark:text-slate-100">{row.user.name}</span>
        </div>
      ),
    },
    {
      header: 'Reviewer Email',
      accessor: 'email',
      sortable: true,
      render: (row) => <span className="text-slate-600 dark:text-slate-400 font-mono text-xs">{row.user.email}</span>,
    },
    {
      header: 'Address',
      accessor: 'address',
      sortable: true,
      render: (row) => (
        <span className="text-slate-600 dark:text-slate-400 text-xs max-w-xs truncate block" title={row.user.address}>
          {row.user.address}
        </span>
      ),
    },
    {
      header: 'Rating Score',
      accessor: 'score',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-1.5">
          <StarRating rating={row.score} size="sm" />
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
            {row.score} / 5
          </span>
        </div>
      ),
    },
    {
      header: 'Submitted Date',
      accessor: 'createdAt',
      sortable: true,
      render: (row) => (
        <span className="text-xs text-slate-500">
          {new Date(row.createdAt).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })}
        </span>
      ),
    },
  ];

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8 animate-fade-in">
      {/* Store Header Banner */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-amber-500/20 flex-shrink-0">
              <Store className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Store Owner Dashboard
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">
                {store.name}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400 pt-1">
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" /> {store.email}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" /> {store.address}
                </span>
              </div>
            </div>
          </div>

          {/* Average Rating KPI Pill */}
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-indigo-50 dark:from-slate-800 dark:to-slate-800/80 border border-amber-200/60 dark:border-slate-700">
            <div className="text-center">
              <p className="text-3xl font-black text-slate-900 dark:text-slate-100">
                {store.averageRating > 0 ? store.averageRating.toFixed(2) : '0.00'}
              </p>
              <p className="text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                Average Rating
              </p>
            </div>
            <div className="h-10 w-[1px] bg-slate-200 dark:bg-slate-700"></div>
            <div className="space-y-1">
              <StarRating rating={store.averageRating} size="md" />
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Based on <span className="font-bold text-slate-700 dark:text-slate-200">{totalRatings}</span> {totalRatings === 1 ? 'review' : 'reviews'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics & Rating Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Rating Breakdown Progress Bars */}
        <div className="glass-card rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Rating Breakdown
            </h3>
            <Award className="w-5 h-5 text-amber-500" />
          </div>

          <div className="space-y-3">
            {[5, 4, 3, 2, 1].map((stars) => {
              const count = store.scoreDistribution[stars] || 0;
              const percentage = totalRatings > 0 ? Math.round((count / totalRatings) * 100) : 0;

              return (
                <div key={stars} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                      {stars} <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    </span>
                    <span className="text-slate-500">
                      {count} ({percentage}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        stars >= 4
                          ? 'bg-emerald-500'
                          : stars === 3
                          ? 'bg-amber-400'
                          : 'bg-rose-500'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Reviewers Data Table */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-500" />
                Users Who Submitted Ratings
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Detailed customer feedback submissions with reviewer profiles
              </p>
            </div>
          </div>

          <DataTable
            columns={columns}
            data={data.reviewers || []}
            loading={loading}
            pagination={pagination}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSort={handleSort}
            onPageChange={(page) => setPagination((prev) => ({ ...prev, page }))}
            searchValue={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search reviewer by Name, Email, or Address..."
            emptyMessage="No customer reviews submitted yet for this store."
          />
        </div>
      </div>
    </div>
  );
};
