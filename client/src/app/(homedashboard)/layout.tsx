"use client";
import Navbar from "@/components/app-components/Navbar";
import { ReactNode } from "react";
import { useGetAuthUserQuery } from "../../../state/api";


const Layout = ({ children }: { children: ReactNode }) => {
  const { data: authUser } = useGetAuthUserQuery();
  return (
    <div className={`w-full h-full flex flex-col`}>
      <Navbar />
      <main>{children}</main>
    </div>
  );
};

export default Layout;
