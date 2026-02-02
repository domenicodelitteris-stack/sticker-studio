import { format } from "date-fns";
import { it } from "date-fns/locale";
import { CalendarIcon, Check, Copy, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { SyndicationPlatform } from "@/types";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
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

function toTimeValue(dateIso: string | null) {
  const d = dateIso ? new Date(dateIso) : new Date();
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

function setTimeOnDate(base: Date, timeHHmm: string) {
  const [hh, mm] = timeHHmm.split(":").map((x) => parseInt(x, 10));
  const d = new Date(base);
  d.setHours(Number.isFinite(hh) ? hh : 0, Number.isFinite(mm) ? mm : 0, 0, 0);
  return d;
}

export function SyndicationSection({
  syndication,
  onChange,
}: SyndicationSectionProps) {
  const allPublished = syndication.every((s) => s.isPublished);

  const handleToggleAll = (checked: boolean) => {
    onChange(syndication.map((s) => ({ ...s, isPublished: checked })));
  };

  const handleTogglePlatform = (platform: string, checked: boolean) => {
    onChange(
      syndication.map((s) =>
        s.platform === platform ? { ...s, isPublished: checked } : s,
      ),
    );
  };

  const handleDateOnlyChange = (
    platform: string,
    field: "startDate" | "endDate",
    date: Date | undefined,
  ) => {
    onChange(
      syndication.map((s) => {
        if (s.platform !== platform) return s;

        if (!date) return { ...s, [field]: null };

        const existingIso = s[field] ?? null;
        const time = toTimeValue(existingIso);
        const withTime = setTimeOnDate(date, time);

        return { ...s, [field]: withTime.toISOString() };
      }),
    );
  };

  const handleTimeOnlyChange = (
    platform: string,
    field: "startDate" | "endDate",
    timeHHmm: string,
  ) => {
    onChange(
      syndication.map((s) => {
        if (s.platform !== platform) return s;

        const base = s[field] ? new Date(s[field] as string) : new Date();
        const withTime = setTimeOnDate(base, timeHHmm);

        return { ...s, [field]: withTime.toISOString() };
      }),
    );
  };

  const copyToAll = (field: "startDate" | "endDate", value: string | null) => {
    onChange(syndication.map((s) => ({ ...s, [field]: value })));
  };

  const clearField = (platform: string, field: "startDate" | "endDate") => {
    onChange(
      syndication.map((s) =>
        s.platform === platform ? { ...s, [field]: null } : s,
      ),
    );
  };

  return (
    <div className="space-y-4">
      {/* <h3 className="text-lg font-semibold">Syndications</h3> */}

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
            <TableHead>Data/ora inizio pubblicazione</TableHead>
            <TableHead>Data/ora fine pubblicazione</TableHead>
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
                          "w-[220px] justify-start text-left font-normal",
                          !item.startDate && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {item.startDate
                          ? format(
                              new Date(item.startDate),
                              "dd/MM/yyyy HH:mm",
                              { locale: it },
                            )
                          : "Seleziona data/ora"}
                      </Button>
                    </PopoverTrigger>

                    <PopoverContent
                      className="w-auto p-3 space-y-3"
                      align="start"
                    >
                      <Calendar
                        mode="single"
                        selected={
                          item.startDate ? new Date(item.startDate) : undefined
                        }
                        onSelect={(date) =>
                          handleDateOnlyChange(item.platform, "startDate", date)
                        }
                        initialFocus
                        className={cn("pointer-events-auto")}
                      />

                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">
                          Orario
                        </Label>
                        <Input
                          type="time"
                          value={toTimeValue(item.startDate)}
                          onChange={(e) =>
                            handleTimeOnlyChange(
                              item.platform,
                              "startDate",
                              e.target.value,
                            )
                          }
                        />
                      </div>
                    </PopoverContent>
                  </Popover>
                  <Button
                    variant="default"
                    size="icon"
                    className="bg-primary hover:bg-primary/90"
                    onClick={() => copyToAll("startDate", item.startDate)}
                    title="Copia su tutte le piattaforme"
                    disabled={!item.startDate}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => clearField(item.platform, "startDate")}
                    title="Cancella"
                    disabled={!item.startDate}
                  >
                    <Trash2 className="h-4 w-4" />
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
                          "w-[220px] justify-start text-left font-normal",
                          !item.endDate && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {item.endDate
                          ? format(new Date(item.endDate), "dd/MM/yyyy HH:mm", {
                              locale: it,
                            })
                          : "Seleziona data/ora"}
                      </Button>
                    </PopoverTrigger>

                    <PopoverContent
                      className="w-auto p-3 space-y-3"
                      align="start"
                    >
                      <Calendar
                        mode="single"
                        selected={
                          item.endDate ? new Date(item.endDate) : undefined
                        }
                        onSelect={(date) =>
                          handleDateOnlyChange(item.platform, "endDate", date)
                        }
                        initialFocus
                        className={cn("pointer-events-auto")}
                      />

                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">
                          Orario
                        </Label>
                        <Input
                          type="time"
                          value={toTimeValue(item.endDate)}
                          onChange={(e) =>
                            handleTimeOnlyChange(
                              item.platform,
                              "endDate",
                              e.target.value,
                            )
                          }
                        />
                      </div>
                    </PopoverContent>
                  </Popover>
                  <Button
                    variant="default"
                    size="icon"
                    className="bg-primary hover:bg-primary/90"
                    onClick={() => copyToAll("endDate", item.endDate)}
                    title="Copia su tutte le piattaforme"
                    disabled={!item.endDate}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>

                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => clearField(item.platform, "endDate")}
                    title="Cancella"
                    disabled={!item.endDate}
                  >
                    <Trash2 className="h-4 w-4" />
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
