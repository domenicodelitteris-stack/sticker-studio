import { SidebarTrigger } from "@/components/ui/sidebar";
import { User } from "lucide-react";

interface AppHeaderProps {
  title: string;
  breadcrumb?: string;
}

export function AppHeader({ title, breadcrumb }: AppHeaderProps) {
  return (
    <header
      style={{ background: "var(--header-gradient)" }}
      className="h-14 border-border bg-card flex items-center justify-between px-4"
    >
      <div className="flex items-center gap-4">
        <SidebarTrigger className="text-white hover:text-white" />
        <div className="flex items-center gap-2 text-sm">
          <span style={{ color: "white" }} className="text-primary font-medium">
            {title}
          </span>
          {breadcrumb && (
            <>
              <span className="text-muted-foreground">&gt;</span>
              <span
                style={{ color: "white" }}
                className="text-muted-foreground"
              >
                {breadcrumb}
              </span>
            </>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
          <User className="h-4 w-4 text-muted-foreground" />
        </div>
        <span className="text-sm text-foreground">Admin</span>
      </div>
    </header>
  );
}
