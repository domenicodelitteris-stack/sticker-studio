import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Trash2, Search, Pencil, ImageIcon } from "lucide-react";
import { AppHeader } from "@/components/layout/AppHeader";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Figurina, Pagina, Album } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function FigurinePage() {
  const navigate = useNavigate();
  const [figurine, setFigurine] = useLocalStorage<Figurina[]>("figurine", []);
  const [pagine] = useLocalStorage<Pagina[]>("pagine", []);
  const [albums] = useLocalStorage<Album[]>("album", []);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // ✅ Nuovo: quante righe mostrare
  const [pageSize, setPageSize] = useState<number>(10);

  const filteredFigurine = useMemo(() => {
    return figurine.filter((f) =>
      f.nome.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [figurine, searchQuery]);

  // ✅ Nuovo: applica il limite (10/50/100)
  const visibleFigurine = useMemo(() => {
    return filteredFigurine.slice(0, pageSize);
  }, [filteredFigurine, pageSize]);

  const handleDelete = () => {
    if (!deleteId) return;
    setFigurine(figurine.filter((f) => f.id !== deleteId));
    setDeleteId(null);
  };

  const getPaginaName = (paginaId: string) => {
    const p = pagine.find((p) => p.id === paginaId);
    if (!p) return "N/A";
    const a = albums.find((a) => a.id === p.albumId);
    return `${a?.nome || "?"} - ${p.nome}`;
  };

  return (
    <>
      <AppHeader title="Gestione Figurine" breadcrumb="Figurine" />
      <PageHeader title="Figurine" />

      <div className="flex-1 p-6 space-y-6 overflow-auto">
        <Card>
          <CardHeader className="space-y-3">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="space-y-2">
                <CardTitle>Figurine</CardTitle>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>Visualizza</span>
                  <select
                    className="
                      h-8
                      bg-transparent
                      border-0
                      border-b
                      border-muted-foreground/40
                      rounded-none
                      px-1
                      text-sm
                      focus:outline-none
                      focus:ring-0
                      cursor-pointer
                    "
                    value={pageSize}
                    onChange={(e) => setPageSize(Number(e.target.value))}
                  >
                    <option value={10}>10</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                  <span>elementi</span>

                  {filteredFigurine.length > pageSize ? (
                    <span className="ml-2 text-xs">
                      (Mostrati {visibleFigurine.length} di{" "}
                      {filteredFigurine.length})
                    </span>
                  ) : null}
                </div>
              </div>

              <Button onClick={() => navigate("/figurine/new")}>
                <Plus className="h-4 w-4 mr-2" />
                Aggiungi Figurina
              </Button>
            </div>

            <div className="flex gap-3 flex-wrap">
              <div className="flex-1 min-w-[220px]">
                <Input
                  placeholder="Cerca figurina..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="
                    rounded-none
                    border-0
                    border-b-2
                    bg-transparent
                    px-0
                    shadow-none
                    focus-visible:ring-0
                    focus-visible:ring-offset-0
                    border-muted-foreground/30
                    focus:border-b-4
                    focus:border-pink-500
                    transition-all duration-200
                  "
                />
              </div>
              <Button variant="default" size="icon" aria-label="Cerca">
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[90px]">Miniatura</TableHead>
                  <TableHead>Titolo</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="text-right">Azioni</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredFigurine.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center text-muted-foreground py-8"
                    >
                      Nessuna figurina trovata
                    </TableCell>
                  </TableRow>
                ) : (
                  visibleFigurine.map((figurina) => (
                    <TableRow key={figurina.id}>
                      <TableCell>
                        {figurina.link ? (
                          <img
                            src={figurina.link}
                            alt={figurina.nome}
                            className="w-12 h-16 object-cover rounded border"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display =
                                "none";
                            }}
                          />
                        ) : (
                          <div className="w-12 h-16 bg-muted rounded border flex items-center justify-center">
                            <ImageIcon className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell>{figurina.nome}</TableCell>
                      <TableCell>{figurina.tipo}</TableCell>

                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate(`/figurine/${figurina.id}`)}
                            aria-label="Modifica"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteId(figurina.id)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            aria-label="Elimina"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Conferma eliminazione</AlertDialogTitle>
            <AlertDialogDescription>
              Sei sicuro di voler eliminare questa figurina? Questa azione non
              può essere annullata.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Elimina
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
