import { VaartaMark } from './Logo';

/**
 * Suspense fallback for lazily-loaded routes.
 *
 * Deliberately quiet — a branded pulse rather than a spinner, so a fast chunk
 * load doesn't flash a loading state at the user.
 */
export function RouteFallback() {
  return (
    <div className="min-h-screen w-full bg-canvas flex items-center justify-center">
      <div className="relative">
        <div className="absolute inset-0 rounded-full bg-iris-soft blur-xl animate-breathe" />
        <VaartaMark size={34} className="relative text-iris" />
      </div>
    </div>
  );
}
