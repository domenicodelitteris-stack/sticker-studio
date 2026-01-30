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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { Label } from "@/components/ui/label";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Album, Figurina, DEFAULT_SYNDICATION } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SyndicationStatusIcons } from "@/components/SyndicationStatusIcons";

export default function AlbumPage() {
  const navigate = useNavigate();
  const [album, setAlbum] = useLocalStorage<Album[]>("album", []);
  const [figurine, setFigurine] = useLocalStorage<Figurina[]>("figurine", []);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [newAlbum, setNewAlbum] = useState({
    nome: "",
    anno: new Date().getFullYear(),
  });

  const filteredAlbum = album.filter((a) =>
    a.nome.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleAdd = () => {
    if (!newAlbum.nome.trim()) return;

    const albumItem: Album = {
      id: crypto.randomUUID(),
      nome: newAlbum.nome.trim(),
      anno: newAlbum.anno,
      syndication: [...DEFAULT_SYNDICATION],
      createdAt: new Date(),
    };

    setAlbum([...album, albumItem]);
    setNewAlbum({ nome: "", anno: new Date().getFullYear() });
    setIsDialogOpen(false);
  };

  const handleDelete = () => {
    if (!deleteId) return;
    setAlbum(album.filter((a) => a.id !== deleteId));
    setFigurine(figurine.filter((f) => f.albumId !== deleteId));
    setDeleteId(null);
  };

  const getFigurineCount = (albumId: string) => {
    return figurine.filter((f) => f.albumId === albumId).length;
  };

  return (
    <>
      <AppHeader title="Gestione Album" breadcrumb="Album" />
      <PageHeader title="Album" />

      <div className="flex-1 p-6 space-y-6 overflow-auto">
        <Card>
          <CardHeader className="space-y-3">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <CardTitle>Album</CardTitle>

              <Button onClick={() => navigate("/album/new")}>
                <Plus className="h-4 w-4 mr-2" />
                Aggiungi Album
              </Button>
            </div>

            <div className="flex gap-3 flex-wrap">
              <div className="flex-1 min-w-[220px]">
                <Input
                  placeholder="Cerca album..."
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
              Contenuti ({filteredAlbum.length} elementi)
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Anno</TableHead>
                  <TableHead>Figurine</TableHead>
                  <TableHead>Syndication</TableHead>
                  <TableHead className="text-right">Azioni</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredAlbum.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center text-muted-foreground py-8"
                    >
                      Nessun album trovato
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAlbum.map((albumItem) => (
                    <TableRow key={albumItem.id}>
                      <TableCell className="font-medium">
                        {albumItem.nome}
                      </TableCell>
                      <TableCell>{albumItem.anno}</TableCell>
                      <TableCell>{getFigurineCount(albumItem.id)}</TableCell>
                      <TableCell>
                        <SyndicationStatusIcons
                          syndication={
                            albumItem.syndication || DEFAULT_SYNDICATION
                          }
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate(`/album/${albumItem.id}`)}
                            aria-label="Modifica"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteId(albumItem.id)}
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

      {/* <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Aggiungi Album</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome</Label>
              <Input
                id="nome"
                value={newAlbum.nome}
                onChange={(e) =>
                  setNewAlbum({ ...newAlbum, nome: e.target.value })
                }
                placeholder="Nome album"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="anno">Anno</Label>
              <Input
                id="anno"
                type="number"
                value={newAlbum.anno}
                onChange={(e) =>
                  setNewAlbum({
                    ...newAlbum,
                    anno: parseInt(e.target.value) || new Date().getFullYear(),
                  })
                }
                placeholder="Anno"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Annulla
            </Button>
            <Button onClick={handleAdd} disabled={!newAlbum.nome.trim()}>
              Aggiungi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog> */}

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Conferma eliminazione</AlertDialogTitle>
            <AlertDialogDescription>
              Sei sicuro di voler eliminare questo album? Verranno eliminate
              anche tutte le figurine associate. Questa azione non può essere
              annullata.
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
