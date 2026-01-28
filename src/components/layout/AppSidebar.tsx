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
import BoingLogo from "@/assets/BoingLogoITA.png";
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
      <SidebarHeader
        style={{ backgroundColor: "white" }}
        className="p-4 border-b gray"
      >
        <div className="flex items-center gap-2">
          <img
            src={BoingLogo}
            alt="Boing Logo"
            className="w-12 h-12 object-cover"
          />

          <span
            style={{ color: "black" }}
            className="font-semibold text-sidebar-foreground"
          >
            Album Digitale
          </span>
        </div>
      </SidebarHeader>

      <SidebarContent style={{ backgroundColor: "white" }} className="p-2">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <Collapsible
                  key={item.title}
                  open={openGroups[item.url.slice(1)]}
                  onOpenChange={(open) =>
                    setOpenGroups((prev) => ({
                      ...prev,
                      [item.url.slice(1)]: open,
                    }))
                  }
                >
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton
                        className={`w-full justify-between text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-border/50 ${
                          isActive(item.url)
                            ? "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
                            : ""
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <item.icon className="h-5 w-5" />
                          <span style={{ color: "black" }}>{item.title}</span>
                        </div>
                        <ChevronDown
                          className={`h-4 w-4 transition-transform ${openGroups[item.url.slice(1)] ? "rotate-180" : ""}`}
                        />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="ml-8 mt-1 space-y-1">
                        <NavLink
                          to={item.url}
                          className="block px-3 py-2 text-sm rounded-md text-black hover:text-black"
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
