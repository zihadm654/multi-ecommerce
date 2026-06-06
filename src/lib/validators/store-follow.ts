import { z } from "zod";

export const toggleStoreFollowSchema = z.object({
  shopId: z.string().min(1, "Shop ID is required"),
});

export type ToggleStoreFollowInput = z.infer<typeof toggleStoreFollowSchema>;
