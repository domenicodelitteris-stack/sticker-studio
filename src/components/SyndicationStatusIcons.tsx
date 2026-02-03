import { SyndicationPlatform } from "@/types";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import Android from "@/assets/Android.png";
import iOs from "@/assets/iOS.png";

interface SyndicationStatusIconsProps {
  syndication: SyndicationPlatform[];
}

function formatDateTime(value: string | null) {
  if (!value) return "—";
  try {
    return format(new Date(value), "dd/MM/yyyy HH:mm", { locale: it });
  } catch {
    return "—";
  }
}

export function SyndicationStatusIcons({
  syndication,
}: SyndicationStatusIconsProps) {
  const getPlatformIcon = (platform: string, isPublished: boolean) => {
    const baseClass = "h-8 w-8";

    switch (platform) {
      case "iOS":
        return (
          <img
            src={iOs}
            alt="ios"
            className={cn(baseClass, isPublished ? "" : "opacity-40 grayscale")}
            style={{ objectFit: "contain" }}
          />
        );
      case "Android":
        return (
          <img
            src={Android}
            alt="Android"
            className={cn(baseClass, isPublished ? "" : "opacity-40 grayscale")}
            style={{ objectFit: "contain" }}
          />
        );
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
            <TooltipContent className="max-w-xs">
              <div className="space-y-1 text-sm">
                <div className="font-medium">{item.platform}</div>

                <div>
                  Stato:{" "}
                  <span
                    className={
                      item.isPublished
                        ? "text-primary"
                        : "text-muted-foreground"
                    }
                  >
                    {item.isPublished ? "Pubblicato" : "Non pubblicato"}
                  </span>
                </div>

                <div>Dal: {formatDateTime(item.startDate)}</div>
                <div>Al: {formatDateTime(item.endDate)}</div>
              </div>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
}
