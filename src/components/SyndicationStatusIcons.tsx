import { Globe, Smartphone, Tv, Monitor } from "lucide-react";
import { SyndicationPlatform } from "@/types";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface SyndicationStatusIconsProps {
  syndication: SyndicationPlatform[];
}

export function SyndicationStatusIcons({ syndication }: SyndicationStatusIconsProps) {
  const getPlatformIcon = (platform: string, isPublished: boolean) => {
    const baseClass = "h-4 w-4";
    const activeClass = isPublished ? "text-primary" : "text-muted-foreground/40";
    
    switch (platform) {
      case "Web":
        return <Globe className={cn(baseClass, activeClass)} />;
      case "iOS":
        return <Smartphone className={cn(baseClass, activeClass)} />;
      case "Android":
        return <Monitor className={cn(baseClass, activeClass)} />;
      case "Smart TV":
        return <Tv className={cn(baseClass, activeClass)} />;
      default:
        return null;
    }
  };

  return (
    <TooltipProvider>
      <div className="flex items-center gap-1">
        {syndication.map((item) => (
          <Tooltip key={item.platform}>
            <TooltipTrigger asChild>
              <span className="cursor-pointer">
                {getPlatformIcon(item.platform, item.isPublished)}
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p>
                {item.platform}: {item.isPublished ? "Pubblicato" : "Non pubblicato"}
              </p>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
}
