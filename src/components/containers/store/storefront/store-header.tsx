import StoreBanner from "@/components/base/store/storefront/store-banner";
import { StoreStats } from "@/components/base/store/storefront/store-stats";
import type { Store } from "@/types/store-types";

interface StoreHeaderProps {
  store: Store;
  isFollowing?: boolean;
  onToggleFollow?: () => void;
}

export default function StoreHeader({ store, isFollowing, onToggleFollow }: StoreHeaderProps) {
  const stats = {
    totalProducts: store.totalProducts,
    followers: store.followers,
    rating: store.rating,
    memberSince: store.memberSince,
  };

  return (
    <div className="space-y-6">
      <StoreBanner store={store} isFollowing={isFollowing} onToggleFollow={onToggleFollow} />
      <StoreStats stats={stats} />
    </div>
  );
}
