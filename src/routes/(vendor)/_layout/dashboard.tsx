import { queryOptions, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { BarChart3, DollarSign, Package, ShoppingBag } from "lucide-react";
import { VendorDashboardSkeleton } from "@/components/base/vendors/skeleton/vendor-dashboard-skeleton";
import VendorDashboardTemplate from "@/components/templates/vendor/vendor-dashboard-template";
import { vendorShopsQueryOptions } from "@/hooks/vendors/use-shops";
import { getVendorOrderStats } from "@/lib/functions/vendor/order";

const vendorStatsQueryOptions = () =>
  queryOptions({
    queryKey: ["vendor-orders", "stats", undefined],
    queryFn: () => getVendorOrderStats({ data: {} }),
  });

export const Route = createFileRoute("/(vendor)/_layout/dashboard")({
  component: VendorDashboardPage,
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(vendorShopsQueryOptions()),
      context.queryClient.ensureQueryData(vendorStatsQueryOptions()),
    ]);
  },
  pendingComponent: VendorDashboardSkeleton,
});

function VendorDashboardPage() {
  const { data: shopsData } = useQuery(vendorShopsQueryOptions());
  const { data: statsData } = useQuery(vendorStatsQueryOptions());

  const shops = shopsData?.shops ?? [];
  const totalProducts = shops.reduce(
    (sum, shop) => sum + (shop.totalProducts ?? 0),
    0,
  );
  const totalShops = shops.length;
  const totalOrders = statsData?.totalOrders ?? 0;
  const totalRevenue = statsData?.totalRevenue ?? 0;

  const stats = [
    {
      title: "Total Revenue",
      value: new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(totalRevenue),
      change: "Revenue from delivered orders",
      icon: DollarSign,
    },
    {
      title: "Total Shops",
      value: totalShops.toString(),
      change: "Active shops",
      icon: ShoppingBag,
    },
    {
      title: "Total Products",
      value: totalProducts.toLocaleString(),
      change: "Across all shops",
      icon: Package,
    },
    {
      title: "Total Orders",
      value: totalOrders.toLocaleString(),
      change: "All orders including pending",
      icon: BarChart3,
    },
  ];

  return <VendorDashboardTemplate stats={stats} />;
}
