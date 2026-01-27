import { format } from "date-fns";
import { it } from "date-fns/locale";
import { CalendarIcon, Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import { SyndicationPlatform } from "@/types";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Label } from "@/components/ui/label";

interface SyndicationSectionProps {
  syndication: SyndicationPlatform[];
  onChange: (syndication: SyndicationPlatform[]) => void;
}

export function SyndicationSection({ syndication, onChange }: SyndicationSectionProps) {
  const allPublished = syndication.every((s) => s.isPublished);

  const handleToggleAll = (checked: boolean) => {
    onChange(
      syndication.map((s) => ({
        ...s,
        isPublished: checked,
      }))
    );
  };

  const handleTogglePlatform = (platform: string, checked: boolean) => {
    onChange(
      syndication.map((s) =>
        s.platform === platform ? { ...s, isPublished: checked } : s
      )
    );
  };

  const handleDateChange = (
    platform: string,
    field: "startDate" | "endDate",
    date: Date | undefined
  ) => {
    onChange(
      syndication.map((s) =>
        s.platform === platform
          ? { ...s, [field]: date ? date.toISOString() : null }
          : s
      )
    );
  };

  const copyStartDate = (platform: string) => {
    const item = syndication.find((s) => s.platform === platform);
    if (item?.startDate) {
      onChange(
        syndication.map((s) =>
          s.platform === platform ? { ...s, endDate: s.startDate } : s
        )
      );
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Syndications</h3>
      
      <div className="flex items-center space-x-2">
        <Checkbox
          id="publish-all"
          checked={allPublished}
          onCheckedChange={handleToggleAll}
        />
        <Label htmlFor="publish-all" className="text-sm text-muted-foreground">
          Pubblica in tutte le syndication
        </Label>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>È Pubblicato</TableHead>
            <TableHead>Data di inizio pubblicazione</TableHead>
            <TableHead>Data di fine pubblicazione</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {syndication.map((item) => (
            <TableRow key={item.platform}>
              <TableCell className="font-medium">{item.platform}</TableCell>
              <TableCell>
                <Checkbox
                  checked={item.isPublished}
                  onCheckedChange={(checked) =>
                    handleTogglePlatform(item.platform, !!checked)
                  }
                />
                {item.isPublished && (
                  <Check className="inline-block ml-2 h-4 w-4 text-primary" />
                )}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-[180px] justify-start text-left font-normal",
                          !item.startDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {item.startDate
                          ? format(new Date(item.startDate), "dd/MM/yyyy HH:mm", { locale: it })
                          : "Seleziona data"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={item.startDate ? new Date(item.startDate) : undefined}
                        onSelect={(date) => handleDateChange(item.platform, "startDate", date)}
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                  <Button
                    variant="default"
                    size="icon"
                    className="bg-primary hover:bg-primary/90"
                    onClick={() => copyStartDate(item.platform)}
                    title="Copia data"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-[180px] justify-start text-left font-normal",
                          !item.endDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {item.endDate
                          ? format(new Date(item.endDate), "dd/MM/yyyy HH:mm", { locale: it })
                          : "Seleziona data"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={item.endDate ? new Date(item.endDate) : undefined}
                        onSelect={(date) => handleDateChange(item.platform, "endDate", date)}
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                  <Button
                    variant="default"
                    size="icon"
                    className="bg-primary hover:bg-primary/90"
                    onClick={() => {
                      // Clear end date
                      handleDateChange(item.platform, "endDate", undefined);
                    }}
                    title="Cancella data"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
