import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "../ui/sidebar";
import {
  Building,
  FileText,
  Heart,
  Home,
  Menu,
  Settings,
  X,
} from "lucide-react";
import { NAVBAR_HEIGHT } from "../../../lib/constants";
import { cn } from "../../../lib/utils";
import Link from "next/link";

const AppSidebar = ({ userType }: AppSidebarProps): ReactNode => {
  const pathname = usePathname();
  const { open, toggleSidebar } = useSidebar();
  const navLinks =
    userType === "manager"
      ? [
          { icon: Building, label: "Properties", href: "/managers/properties" },
          {
            icon: FileText,
            label: "Applications",
            href: "/managers/applications",
          },
          {
            icon: Settings,
            label: "Applications",
            href: "/managers/settings",
          },
        ]
      : [
          { icon: Heart, label: "Favourites", href: "/tenants/favorites" },
          {
            icon: FileText,
            label: "Applications",
            href: "/tenants/applications",
          },
          {
            icon: Home,
            label: "Residents",
            href: "/tenants/residences",
          },
          {
            icon: Settings,
            label: "Settings",
            href: "/tenants/settings",
          },
        ];
  return (
    <Sidebar
      collapsible="icon"
      className="fixed left-0 bg-white shadow-2xl border-4"
      style={{
        top: `${NAVBAR_HEIGHT}px`,
        height: `calc(100vh - ${NAVBAR_HEIGHT}px)`,
      }}
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <div
              className={cn(
                "flex min-h-[50px] w-full items-center pt-3 mb-3",
                open ? "justify-between px-6" : "justify-center"
              )}
            >
              {open ? (
                <>
                  <h1 className="text-xl font-bold text-gra-800">
                    {userType === "manager" ? "Manager View" : "Render View"}
                  </h1>
                  <button
                    className="hover:bg-gray-100 p-2 rounded-md cursor-pointer"
                    onClick={() => toggleSidebar()}
                  >
                    <X className="h-6 w-6 text-gray-600" />
                  </button>
                </>
              ) : (
                <>
                  <button
                    className="hover:bg-gray-100 p-2 rounded-md cursor-pointer"
                    onClick={() => toggleSidebar()}
                  >
                    <Menu className="h-6 w-6 text-gray-600" />
                  </button>
                </>
              )}
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <SidebarMenuItem key={link.href}>
                <SidebarMenuButton
                  asChild
                  className={`flex items-center px-7 py-7 ${
                    isActive ? "bg-gray-100" : "text-gray-600 hover:bg-gray-100"
                  } ${open ? "text-blue-600" : "ml-[5px]"}`}
                >
                  <Link href={link.href} className="w-full">
                    <div className="flex items-center p-6 gap-3">
                      <link.icon
                        className={`h-5 w-5 ${
                          isActive ? "text-blue-600" : "text-gray-600"
                        }`}
                      />
                      {open && (
                        <span
                          className={`${
                            isActive ? "text-blue-600" : "text-gray-600"
                          }`}
                        >
                          {link.label}
                        </span>
                      )}
                    </div>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
};
export default AppSidebar;
