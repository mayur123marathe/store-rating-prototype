import React, { useState } from 'react';
import { Modal } from './Modal';
import { StarRating } from './StarRating';
import { Store } from '../types';
import api from '../services/api';
import { Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  store: Store | null;
  onRatingSuccess: (storeId: string, newRating: number) => void;
}

export const RatingModal: React.FC<RatingModalProps> = ({
  isOpen,
  onClose,
  store,
  onRatingSuccess,
}) => {
  if (!store) return null;

  const [score, setScore] = useState<number>(store.userRating || 5);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await api.post('/ratings', {
        storeId: store.id,
        score,
      });

      setSuccessMsg(
        store.userRating
          ? `Your rating for ${store.name} was updated to ${score} stars!`
          : `Thanks for rating ${store.name} with ${score} stars!`
      );

      onRatingSuccess(store.id, score);

      setTimeout(() => {
        setSuccessMsg(null);
        onClose();
      }, 1200);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit rating. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const getScoreDescription = (s: number) => {
    switch (s) {
      case 5:
        return '⭐⭐⭐⭐⭐ Exceptional (5/5)';
      case 4:
        return '⭐⭐⭐⭐ Great Experience (4/5)';
      case 3:
        return '⭐⭐⭐ Average (3/5)';
      case 2:
        return '⭐⭐ Needs Improvement (2/5)';
      case 1:
        return '⭐ Poor (1/5)';
      default:
        return '';
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={store.userRating ? `Modify Rating for ${store.name}` : `Rate ${store.name}`}
    >
      {successMsg ? (
        <div className="py-6 flex flex-col items-center text-center gap-3">
          <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <h4 className="font-semibold text-slate-900 dark:text-slate-100">Rating Saved!</h4>
          <p className="text-sm text-slate-500 dark:text-slate-400">{successMsg}</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
              Store Address
            </p>
            <p className="text-sm text-slate-700 dark:text-slate-300 mt-0.5">{store.address}</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex flex-col items-center gap-3">
            <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
              Select your rating (1 to 5 stars):
            </p>
            <StarRating
              rating={score}
              interactive={true}
              size="xl"
              onChange={(newScore) => setScore(newScore)}
            />
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
              {getScoreDescription(score)}
            </span>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex items-center gap-2 text-rose-600 dark:text-rose-400 text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-md shadow-indigo-500/20 transition-all disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              {submitting ? 'Saving...' : store.userRating ? 'Update Rating' : 'Submit Rating'}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
};
