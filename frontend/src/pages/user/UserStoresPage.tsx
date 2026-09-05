import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Store, PaginationMeta } from '../../types';
import { StarRating } from '../../components/StarRating';
import { RatingModal } from '../../components/RatingModal';
import { Modal } from '../../components/Modal';
import { useAuth } from '../../context/AuthContext';
import {
  Search,
  Store as StoreIcon,
  MapPin,
  Star,
  Sparkles,
  Edit3,
  SlidersHorizontal,
  LayoutGrid,
  List,
  LogIn,
  UserPlus,
  Lock,
  ArrowRight,
} from 'lucide-react';

export const UserStoresPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stores, setStores] = useState<Store[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>({
    total: 0,
    page: 1,
    limit: 9,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);

  // Search & Sorting state
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<string>('overallRating');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Rating Modal state
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);

  // Auth Prompt Modal state for unauthenticated visitors
  const [authPromptStore, setAuthPromptStore] = useState<Store | null>(null);
  const [isAuthPromptOpen, setIsAuthPromptOpen] = useState(false);

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

      const res = await api.get('/stores', { params });
      setStores(res.data.data.stores);
      setPagination(res.data.data.pagination);
    } catch (err) {
      console.error('Error fetching stores:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, [pagination.page, sortBy, sortOrder]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPagination((prev) => ({ ...prev, page: 1 }));
      fetchStores();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleOpenRatingModal = (store: Store) => {
    setSelectedStore(store);
    setIsRatingModalOpen(true);
  };

  const handleCardClick = (store: Store) => {
    if (!user) {
      setAuthPromptStore(store);
      setIsAuthPromptOpen(true);
      return;
    }
    if (user.role === 'USER') {
      handleOpenRatingModal(store);
    }
  };

  const handleRatingSuccess = (_storeId: string, _newRating: number) => {
    fetchStores();
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8 animate-fade-in">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-800 p-8 sm:p-10 text-white shadow-xl">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold text-indigo-100 border border-white/20">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            Verified Customer Ratings Platform
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Discover & Rate Registered Stores
          </h1>
          <p className="text-sm sm:text-base text-indigo-100 leading-relaxed">
            Browse verified merchants, inspect community review scores, and submit or modify your 1-to-5 star ratings anytime.
          </p>
        </div>

        {/* Decorative background element */}
        <div className="absolute right-0 bottom-0 opacity-10 translate-x-12 translate-y-12 pointer-events-none">
          <StoreIcon className="w-96 h-96 text-white" />
        </div>
      </div>

      {/* Guest Notice Banner (Prompts Visitors to Log In) */}
      {!user && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-indigo-50/90 via-purple-50/90 to-blue-50/90 dark:from-slate-900/90 dark:via-indigo-950/40 dark:to-slate-900/90 border border-indigo-200/80 dark:border-indigo-800/60 shadow-sm">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center flex-shrink-0 shadow-md shadow-indigo-500/25">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                Sign in required to rate stores
                <span className="text-[10px] uppercase font-extrabold tracking-wider px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300">
                  Guest Mode
                </span>
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                You are currently browsing as a guest. Log in or create an account to submit 1-to-5 star store ratings.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 w-full sm:w-auto flex-shrink-0">
            <Link
              to="/login"
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-500/20 transition-all"
            >
              <LogIn className="w-4 h-4" /> Sign In to Rate
            </Link>
            <Link
              to="/register"
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-all"
            >
              <UserPlus className="w-4 h-4" /> Create Account
            </Link>
          </div>
        </div>
      )}

      {/* Search, Sort, and View Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 glass-card p-4 rounded-2xl shadow-sm">
        {/* Search Input (Name and Address) */}
        <div className="relative flex-1 max-w-lg">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search stores by Name or Physical Address..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
        </div>

        {/* Sort Controls & View Switcher */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-slate-400" />
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [newSort, newOrder] = e.target.value.split('-');
                setSortBy(newSort);
                setSortOrder(newOrder as any);
              }}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="overallRating-desc">Highest Rated (5★ to 1★)</option>
              <option value="overallRating-asc">Lowest Rated (1★ to 5★)</option>
              <option value="name-asc">Store Name (A to Z)</option>
              <option value="name-desc">Store Name (Z to A)</option>
              <option value="createdAt-desc">Recently Added</option>
            </select>
          </div>

          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs font-medium transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs font-medium transition-colors ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Loading Skeletons */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="glass-card rounded-2xl p-6 space-y-4 animate-pulse">
              <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-3/4"></div>
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/2"></div>
              <div className="h-16 bg-slate-100 dark:bg-slate-800/50 rounded-xl"></div>
              <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
            </div>
          ))}
        </div>
      ) : stores.length === 0 ? (
        <div className="glass-card rounded-2xl py-16 px-4 text-center space-y-3">
          <StoreIcon className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">No stores found</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            We couldn't find any stores matching your search query. Try adjusting your keyword or filter.
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        /* Store Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stores.map((store) => (
            <div
              key={store.id}
              onClick={() => handleCardClick(store)}
              className="glass-card rounded-2xl p-6 flex flex-col justify-between glass-card-hover cursor-pointer shadow-sm group transition-all"
            >
              <div className="space-y-4">
                {/* Store Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-500/15 to-purple-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-500/20 flex-shrink-0 group-hover:scale-105 transition-transform">
                      <StoreIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {store.name}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                        {store.email}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Address */}
                <div className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-400">
                  <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                  <p className="line-clamp-2">{store.address}</p>
                </div>

                {/* Rating Overview Box */}
                <div className="p-3.5 rounded-xl bg-slate-50/90 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-700/60 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block mb-0.5">
                      Overall Rating
                    </span>
                    <div className="flex items-center gap-1.5">
                      <StarRating rating={store.overallRating} size="sm" />
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {store.overallRating > 0 ? store.overallRating.toFixed(1) : 'Unrated'}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    {store.ratingCount} {store.ratingCount === 1 ? 'review' : 'reviews'}
                  </span>
                </div>

                {/* User's Submitted Rating Badge */}
                {user?.role === 'USER' && (
                  <div className="pt-1">
                    {store.userRating ? (
                      <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 text-xs">
                        <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300 font-semibold">
                          <Star className="w-3.5 h-3.5 fill-emerald-500 text-emerald-500" />
                          <span>Your Rating: {store.userRating} / 5 Stars</span>
                        </div>
                        <span className="text-[10px] text-emerald-600/80">Submitted</span>
                      </div>
                    ) : (
                      <div className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-700 text-xs text-slate-500 text-center">
                        You haven't rated this store yet
                      </div>
                    )}
                  </div>
                )}

                {/* Guest Callout Badge */}
                {!user && (
                  <div className="pt-1">
                    <div className="px-3 py-2 rounded-xl bg-amber-500/10 dark:bg-amber-950/30 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-300 flex items-center justify-between">
                      <span className="flex items-center gap-1.5 font-medium">
                        <Lock className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                        Sign in to rate this store
                      </span>
                      <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 group-hover:underline flex items-center gap-0.5">
                        Rate <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              {user?.role === 'USER' && (
                <div className="pt-5 mt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenRatingModal(store);
                    }}
                    className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all shadow-sm ${
                      store.userRating
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/20'
                    }`}
                  >
                    {store.userRating ? (
                      <>
                        <Edit3 className="w-3.5 h-3.5 text-indigo-500" />
                        Modify Your Rating
                      </>
                    ) : (
                      <>
                        <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
                        Submit Rating
                      </>
                    )}
                  </button>
                </div>
              )}

              {!user && (
                <div className="pt-5 mt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setAuthPromptStore(store);
                      setIsAuthPromptOpen(true);
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all shadow-sm bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-indigo-500/20 group-hover:shadow-md"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    Sign in to Rate Store
                  </button>
                </div>
              )}

              {user?.role === 'ADMIN' && (
                <div className="pt-5 mt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate('/admin/stores');
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  >
                    Manage Store in Admin Portal &rarr;
                  </button>
                </div>
              )}

              {user?.role === 'STORE_OWNER' && (
                <div className="pt-5 mt-4 border-t border-slate-100 dark:border-slate-800 text-center">
                  <span className="text-xs text-slate-400 italic">
                    Store Owner Mode (Ratings submitted by users)
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        /* Table View */
        <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 glass-card">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/70 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3.5">Store Details</th>
                <th className="px-4 py-3.5">Address</th>
                <th className="px-4 py-3.5">Overall Rating</th>
                {user?.role === 'USER' && <th className="px-4 py-3.5">Your Rating</th>}
                <th className="px-4 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {stores.map((store) => (
                <tr
                  key={store.id}
                  onClick={() => handleCardClick(store)}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3.5">
                    <p className="font-semibold text-slate-900 dark:text-slate-100">{store.name}</p>
                    <p className="text-xs text-slate-500 font-mono">{store.email}</p>
                  </td>
                  <td className="px-4 py-3.5 text-xs text-slate-600 dark:text-slate-400 max-w-xs truncate">
                    {store.address}
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1.5">
                      <StarRating rating={store.overallRating} size="sm" />
                      <span className="text-xs font-bold">{store.overallRating.toFixed(1)}</span>
                      <span className="text-xs text-slate-400">({store.ratingCount})</span>
                    </div>
                  </td>
                  {user?.role === 'USER' && (
                    <td className="px-4 py-3.5">
                      {store.userRating ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          ★ {store.userRating} Stars
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Not rated</span>
                      )}
                    </td>
                  )}
                  <td className="px-4 py-3.5 text-right">
                    {user?.role === 'USER' ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenRatingModal(store);
                        }}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 transition-colors"
                      >
                        {store.userRating ? 'Modify' : 'Rate'}
                      </button>
                    ) : !user ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setAuthPromptStore(store);
                          setIsAuthPromptOpen(true);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-500/20 transition-all"
                      >
                        <LogIn className="w-3.5 h-3.5" />
                        Sign in to Rate
                      </button>
                    ) : (
                      <span className="text-xs text-slate-400">
                        {user.role === 'ADMIN' ? 'Admin' : 'Owner'}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Controls */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-slate-500">
            Page {pagination.page} of {pagination.totalPages} ({pagination.total} stores total)
          </p>
          <div className="flex items-center gap-2">
            <button
              disabled={pagination.page <= 1}
              onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold disabled:opacity-40"
            >
              Previous
            </button>
            <button
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Interactive Rating Modal for Authenticated Users */}
      <RatingModal
        isOpen={isRatingModalOpen}
        onClose={() => setIsRatingModalOpen(false)}
        store={selectedStore}
        onRatingSuccess={handleRatingSuccess}
      />

      {/* Auth Prompt Modal for Unauthenticated Visitors */}
      <Modal
        isOpen={isAuthPromptOpen}
        onClose={() => setIsAuthPromptOpen(false)}
        title="Sign In Required"
        maxWidth="sm"
      >
        <div className="space-y-5 text-center">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-500/30 shadow-inner">
            <Lock className="w-7 h-7" />
          </div>

          <div className="space-y-1.5">
            <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Want to rate {authPromptStore ? `"${authPromptStore.name}"` : 'this store'}?
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Only logged-in normal users can submit and modify 1-to-5 star store ratings. Please log in or register to share your rating.
            </p>
          </div>

          {/* Recruiter / Reviewer Fast-Track Hint */}
          <div className="p-3.5 rounded-xl bg-gradient-to-r from-indigo-50/80 to-purple-50/80 dark:from-slate-800/80 dark:to-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 text-left text-xs space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-indigo-700 dark:text-indigo-300">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
              <span>1-Click Demo Available!</span>
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
              The login page features a 1-click test button for normal users so you can test rating immediately without typing.
            </p>
          </div>

          {/* Action CTAs */}
          <div className="space-y-2 pt-1">
            <button
              onClick={() => {
                setIsAuthPromptOpen(false);
                navigate('/login');
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/25 transition-all"
            >
              <LogIn className="w-4 h-4" /> Go to Sign In
            </button>
            <button
              onClick={() => {
                setIsAuthPromptOpen(false);
                navigate('/register');
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
            >
              <UserPlus className="w-4 h-4" /> Create New Account
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
