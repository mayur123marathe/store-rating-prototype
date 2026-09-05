export type Role = 'ADMIN' | 'USER' | 'STORE_OWNER';

export interface User {
  id: string;
  name: string;
  email: string;
  address: string;
  role: Role;
  createdAt: string;
  storeName?: string | null;
  storeRating?: number | null;
  totalStoreRatings?: number;
  store?: {
    id: string;
    name: string;
    email: string;
    address: string;
  } | null;
}

export interface Store {
  id: string;
  name: string;
  email: string;
  address: string;
  overallRating: number;
  ratingCount: number;
  userRating?: number | null;
  userRatingId?: string | null;
  userRatedAt?: string | null;
  owner?: {
    id: string;
    name: string;
    email: string;
  } | null;
  createdAt: string;
}

export interface RatingReviewer {
  id?: string;
  ratingId: string;
  score: number;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    address: string;
  };
}

export interface StoreOwnerDashboardData {
  hasStore: boolean;
  message?: string;
  store?: {
    id: string;
    name: string;
    email: string;
    address: string;
    averageRating: number;
    totalRatings: number;
    scoreDistribution: Record<number, number>;
  };
  reviewers?: RatingReviewer[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface AdminDashboardData {
  totalUsers: number;
  totalStores: number;
  totalRatings: number;
  averagePlatformRating: number;
  roleStats: {
    admin: number;
    user: number;
    storeOwner: number;
  };
  scoreDistribution: Record<number, number>;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
