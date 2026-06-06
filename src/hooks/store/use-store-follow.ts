import {
  queryOptions,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import {
  checkStoreFollowStatus,
  toggleStoreFollow,
} from "@/lib/functions/store/store-follow";
import type { ToggleStoreFollowInput } from "@/lib/validators/store-follow";
import { storeShopsKeys } from "./use-store-shops";

export const storeFollowKeys = {
  all: ["store", "follow"] as const,
  status: (shopId: string) => [...storeFollowKeys.all, "status", shopId] as const,
};

export const storeFollowStatusQueryOptions = (shopId: string) =>
  queryOptions({
    queryKey: storeFollowKeys.status(shopId),
    queryFn: () => checkStoreFollowStatus({ data: { shopId } }),
    enabled: !!shopId,
  });

export const useStoreFollowMutations = () => {
  const queryClient = useQueryClient();

  const invalidateFollowStatus = (shopId: string) => {
    queryClient.invalidateQueries({
      queryKey: storeFollowKeys.status(shopId),
    });
  };

  const toggleFollowMutation = useMutation({
    mutationFn: async (data: ToggleStoreFollowInput) => {
      const result = await toggleStoreFollow({ data });
      return { ...result, shopId: data.shopId };
    },
    onSuccess: (result) => {
      if (result.following) {
        toast.success("Following store");
      } else {
        toast.success("Unfollowed store");
      }
      invalidateFollowStatus(result.shopId);
      queryClient.invalidateQueries({
        queryKey: storeShopsKeys.details(),
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update follow status");
    },
  });

  return {
    toggleFollow: toggleFollowMutation.mutateAsync,
    isToggling: toggleFollowMutation.isPending,
  };
};
