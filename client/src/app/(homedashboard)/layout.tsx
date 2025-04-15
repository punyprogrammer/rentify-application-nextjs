import Navbar from "@/components/app-components/Navbar";
import { ReactNode } from "react";

const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <div className={`w-full h-full flex flex-col`}>
      <Navbar />
      <main>{children}</main>
    </div>
  );
};

export default Layout;
