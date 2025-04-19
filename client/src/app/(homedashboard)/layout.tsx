"use client";
import Navbar from "@/components/app-components/Navbar";
import { ReactNode, useState, useEffect } from "react";
import { useGetAuthUserQuery } from "../../../state/api";
import { usePathname, useRouter } from "next/navigation";

const Layout = ({ children }: { children: ReactNode }) => {
  const pathname = usePathname();
  const { data: authUser, isLoading: authLoading } = useGetAuthUserQuery();
  const router = useRouter();
  const [loading, setIsLoading] = useState(true);

  useEffect(() => {
    const userRole = authUser?.userRole?.toLowerCase();
    if (
      (userRole === "manager" && pathname.startsWith("/search")) ||
      (userRole === "manager" && pathname === "/")
    ) {
      router.push("/managers/properties");
    } else {
      setIsLoading(false);
    }
  }, [authUser, router, pathname]);
  if (authLoading || loading) return <div>Loading</div>;
  return (
    <div className={`w-full h-full flex flex-col`}>
      <Navbar />
      <main>{children}</main>
    </div>
  );
};

export default Layout;
