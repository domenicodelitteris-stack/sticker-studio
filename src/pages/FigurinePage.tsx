import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Trash2, Search, Pencil } from "lucide-react";
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
import { Figurina, Album } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function FigurinePage() {
  const navigate = useNavigate();
  const [figurine, setFigurine] = useLocalStorage<Figurina[]>("figurine", []);
  const [album] = useLocalStorage<Album[]>("album", []);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredFigurine = figurine.filter((f) =>
    f.nome.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleDelete = () => {
    if (!deleteId) return;
    setFigurine(figurine.filter((f) => f.id !== deleteId));
    setDeleteId(null);
  };

  const getAlbumName = (albumId: string) => {
    const a = album.find((a) => a.id === albumId);
    return a?.nome || "N/A";
  };

  return (
    <>
      <AppHeader title="Gestione Figurine" breadcrumb="Figurine" />
      <PageHeader title="Figurine" />

      <div className="flex-1 p-6 space-y-6 overflow-auto">
        <Card>
          <CardHeader className="space-y-3">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <CardTitle>Figurine</CardTitle>

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
            <div className="mb-3 text-sm text-muted-foreground">
              Contenuti ({filteredFigurine.length} elementi)
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Link</TableHead>
                  <TableHead className="text-right">Azioni</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredFigurine.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center text-muted-foreground py-8"
                    >
                      Nessuna figurina trovata
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredFigurine.map((figurina) => (
                    <TableRow key={figurina.id}>
                      <TableCell className="font-medium">
                        {figurina.numero}
                      </TableCell>
                      <TableCell>{figurina.nome}</TableCell>
                      <TableCell>{figurina.tipo}</TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {figurina.link || "—"}
                      </TableCell>
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
