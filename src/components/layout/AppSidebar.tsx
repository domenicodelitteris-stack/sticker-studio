import { Book, Image, ChevronDown, Package } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useState } from "react";

const menuItems = [
  { title: "Gestione Figurine", icon: Image, url: "/figurine" },
  { title: "Gestione Album", icon: Book, url: "/album" },
  { title: "Gestione Pacchetti", icon: Package, url: "/pacchetti" },
];

export function AppSidebar() {
  const location = useLocation();
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    figurine: true,
    album: true,
    pacchetti: true,
  });

  const isActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(path + "/");

  return (
    <Sidebar className="border-r border-sidebar-border">
      <SidebarHeader className="bg-sidebar p-5 border-b border-sidebar-border">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
            <Image className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-bold text-base tracking-tight text-white">
            Album Digitale
          </span>
        </div>
      </SidebarHeader>

      <SidebarContent className="bg-sidebar px-3 pt-4">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {menuItems.map((item) => {
                const key = item.url.slice(1);
                const active = isActive(item.url);
                return (
                  <Collapsible
                    key={item.title}
                    open={openGroups[key]}
                    onOpenChange={(open) =>
                      setOpenGroups((prev) => ({ ...prev, [key]: open }))
                    }
                  >
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton
                          className={`group w-full justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                            active
                              ? "bg-white/5 text-white border border-white/10 hover:bg-white/10"
                              : "text-sidebar-foreground hover:bg-white/5 hover:text-white border border-transparent"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <item.icon
                              className={`h-4 w-4 ${active ? "text-primary" : "text-sidebar-muted group-hover:text-white"}`}
                            />
                            <span>{item.title}</span>
                          </div>
                          <ChevronDown
                            className={`h-3.5 w-3.5 text-sidebar-muted transition-transform ${
                              openGroups[key] ? "rotate-180" : ""
                            }`}
                          />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="ml-4 mt-1 pl-4 border-l border-sidebar-border">
                          <NavLink
                            to={item.url}
                            className="block px-3 py-1.5 text-sm rounded-md text-sidebar-muted hover:text-white transition-colors"
                            activeClassName="text-primary font-semibold"
                          >
                            {item.title.replace("Gestione ", "")}
                          </NavLink>
                        </div>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="bg-sidebar border-t border-sidebar-border p-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[11px] font-semibold text-white">
            AD
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-xs font-semibold text-white truncate">
              Admin User
            </p>
            <p className="text-[10px] text-sidebar-muted truncate">
              admin@album.com
            </p>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
