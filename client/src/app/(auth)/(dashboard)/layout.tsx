"use client";
import Navbar from "@/components/app-components/Navbar";
import { NAVBAR_HEIGHT } from "../../../../lib/constants";

import { ReactNode, useEffect, useState } from "react";

import { SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "@/components/app-components/AppSidebar";
import { usePathname, useRouter } from "next/navigation";
import { useGetAuthUserQuery } from "../../../../state/api";

const DashboardLayout = ({ children }: { children: ReactNode }): ReactNode => {
  const pathname = usePathname();
  const { data: authUser, isLoading: authLoading } = useGetAuthUserQuery();
  const router = useRouter();
  const [loading, setIsLoading] = useState(true);
  const userType = pathname.includes("managers") ? "manager" : "tenant";
  useEffect(() => {
    const userRole = authUser?.userRole?.toLowerCase();
    if (
      (userRole === "manager" && pathname.startsWith("/tenants")) ||
      (userRole === "tenants" && pathname.startsWith("/managers"))
    ) {
      router.push(
        userRole === "manager" ? "/managers/properties" : "/tenants/favorites"
      );
    } else {
      setIsLoading(false);
    }
  }, [authUser, router, pathname]);
  if (authLoading || loading) return <div>Loading</div>;

  return (
    <div className="min-h-screen w-full bg-primary-100">
      <SidebarProvider>
        <Navbar />
        <div style={{ paddingTop: `${NAVBAR_HEIGHT}px` }}>
          <main className="flex">
            <AppSidebar userType={userType} />
            <div className="flex-grow transition-all duration-300">
              {children}
            </div>
          </main>
        </div>
      </SidebarProvider>
    </div>
  );
};
export default DashboardLayout;
