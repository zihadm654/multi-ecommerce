import { createServerFn } from "@tanstack/react-start";
import { and, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { storeFollowers } from "@/lib/db/schema/store-followers-schema";
import { shops } from "@/lib/db/schema/shop-schema";
import { authMiddleware } from "@/lib/middleware/auth";
import { optionalAuthMiddleware } from "@/lib/middleware/optional-auth";
import { toggleStoreFollowSchema } from "@/lib/validators/store-follow";

export const toggleStoreFollow = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator(toggleStoreFollowSchema)
  .handler(async ({ context, data }) => {
    const userId = context.session?.user?.id;

    if (!userId) {
      throw new Error("Unauthorized: User not found");
    }

    const { shopId } = data;

    const existing = await db.query.storeFollowers.findFirst({
      where: and(
        eq(storeFollowers.userId, userId),
        eq(storeFollowers.shopId, shopId),
      ),
    });

    if (existing) {
      await db
        .delete(storeFollowers)
        .where(
          and(
            eq(storeFollowers.userId, userId),
            eq(storeFollowers.shopId, shopId),
          ),
        );

      await db
        .update(shops)
        .set({ followersCount: sql`GREATEST(${shops.followersCount} - 1, 0)` })
        .where(eq(shops.id, shopId));

      return { following: false };
    } else {
      await db.insert(storeFollowers).values({
        id: crypto.randomUUID(),
        userId,
        shopId,
      });

      await db
        .update(shops)
        .set({ followersCount: sql`${shops.followersCount} + 1` })
        .where(eq(shops.id, shopId));

      return { following: true };
    }
  });

export const checkStoreFollowStatus = createServerFn({ method: "POST" })
  .middleware([optionalAuthMiddleware])
  .inputValidator(toggleStoreFollowSchema)
  .handler(async ({ context, data }) => {
    const userId = context.session?.user?.id;

    if (!userId) {
      return { isFollowing: false };
    }

    const follow = await db.query.storeFollowers.findFirst({
      where: and(
        eq(storeFollowers.userId, userId),
        eq(storeFollowers.shopId, data.shopId),
      ),
    });

    return { isFollowing: !!follow };
  });
