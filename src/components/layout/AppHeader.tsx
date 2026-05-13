import { SidebarTrigger } from "@/components/ui/sidebar";
import { User } from "lucide-react";
import { ChevronRight } from "lucide-react";

interface AppHeaderProps {
  title: string;
  breadcrumb?: string;
}

export function AppHeader({ title, breadcrumb }: AppHeaderProps) {
  return (
    <header className="relative z-20 h-12 bg-slate-950 flex items-center justify-between px-6">
      <div className="flex items-center gap-3 text-xs font-medium text-white/70">
        <SidebarTrigger className="text-white/70 hover:text-white -ml-2" />
        <span className="hover:text-white transition-colors cursor-default">
          {title}
        </span>
        {breadcrumb && (
          <>
            <ChevronRight className="h-3.5 w-3.5 text-white/30" />
            <span className="text-white">{breadcrumb}</span>
          </>
        )}
      </div>
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-full bg-white/10 border border-white/15 flex items-center justify-center">
          <User className="h-3.5 w-3.5 text-white/80" />
        </div>
        <span className="text-xs font-medium text-white/90">Admin</span>
      </div>
    </header>
  );
}
