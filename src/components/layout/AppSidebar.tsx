import { Book, Image, ChevronDown, Package } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useState } from "react";

const menuItems = [
  {
    title: "Gestione Figurine",
    icon: Image,
    url: "/figurine",
  },
  {
    title: "Gestione Album",
    icon: Book,
    url: "/album",
  },
  {
    title: "Gestione Pacchetti",
    icon: Package,
    url: "/pacchetti",
  },
];

export function AppSidebar() {
  const location = useLocation();
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    figurine: true,
    album: true,
    pacchetti: true,
  });

  const isActive = (path: string) => location.pathname === path;

  return (
    <Sidebar className="border-r-0">
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg">AD</span>
          </div>
          <span className="font-semibold text-sidebar-foreground">Album Digitale</span>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="p-2">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <Collapsible
                  key={item.title}
                  open={openGroups[item.url.slice(1)]}
                  onOpenChange={(open) =>
                    setOpenGroups((prev) => ({ ...prev, [item.url.slice(1)]: open }))
                  }
                >
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton
                        className={`w-full justify-between text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-border/50 ${
                          isActive(item.url) ? "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground" : ""
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <item.icon className="h-5 w-5" />
                          <span>{item.title}</span>
                        </div>
                        <ChevronDown className={`h-4 w-4 transition-transform ${openGroups[item.url.slice(1)] ? "rotate-180" : ""}`} />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="ml-8 mt-1 space-y-1">
                        <NavLink
                          to={item.url}
                          className="block px-3 py-2 text-sm rounded-md text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-border/50"
                          activeClassName="bg-primary text-primary-foreground hover:bg-primary"
                        >
                          {item.title.replace("Gestione ", "")}
                        </NavLink>
                      </div>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
