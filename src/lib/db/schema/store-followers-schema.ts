import { relations } from "drizzle-orm";
import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "./auth-schema";
import { shops } from "./shop-schema";

export const storeFollowers = pgTable("store_followers", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  shopId: text("shop_id")
    .notNull()
    .references(() => shops.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const storeFollowersRelations = relations(
  storeFollowers,
  ({ one }) => ({
    user: one(user, {
      fields: [storeFollowers.userId],
      references: [user.id],
    }),
    shop: one(shops, {
      fields: [storeFollowers.shopId],
      references: [shops.id],
    }),
  }),
);

export type StoreFollower = typeof storeFollowers.$inferSelect;
export type NewStoreFollower = typeof storeFollowers.$inferInsert;
