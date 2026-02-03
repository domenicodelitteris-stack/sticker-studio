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
import { Album, Pagina, DEFAULT_SYNDICATION } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SyndicationStatusIcons } from "@/components/SyndicationStatusIcons";

export default function AlbumPage() {
  const navigate = useNavigate();
  const [album, setAlbum] = useLocalStorage<Album[]>("album", []);
  const [pagine] = useLocalStorage<Pagina[]>("pagine", []);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [pageSize, setPageSize] = useState<number>(10);

  const filteredAlbum = useMemo(() => {
    return album.filter((a) =>
      a.nome.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [album, searchQuery]);

  const visibleAlbum = useMemo(() => {
    return filteredAlbum.slice(0, pageSize);
  }, [filteredAlbum, pageSize]);

  const handleDelete = () => {
    if (!deleteId) return;
    setAlbum(album.filter((a) => a.id !== deleteId));
    setDeleteId(null);
  };

  const getPagineCount = (albumId: string) => {
    return pagine.filter((p) => p.albumId === albumId).length;
  };

  const getAlbumLogo = (a: Album) => (a as any).logo as string | undefined;

  return (
    <>
      <AppHeader title="Gestione Album" breadcrumb="Album" />
      <PageHeader title="Album" />

      <div className="flex-1 p-6 space-y-6 overflow-auto">
        <Card>
          <CardHeader className="space-y-3">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="space-y-2">
                <CardTitle>Album</CardTitle>

                {/* ✅ Nuovo: Visualizza + select */}
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
                      focus:border-primary
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

                  {filteredAlbum.length > pageSize ? (
                    <span className="ml-2 text-xs">
                      (Mostrati {visibleAlbum.length} di {filteredAlbum.length})
                    </span>
                  ) : null}
                </div>
              </div>

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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[90px]">Logo</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Pagine</TableHead>
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
                  visibleAlbum.map((albumItem) => {
                    const logo = getAlbumLogo(albumItem);

                    return (
                      <TableRow key={albumItem.id}>
                        <TableCell>
                          {logo ? (
                            <img
                              src={logo}
                              alt={`Logo ${albumItem.nome}`}
                              className="w-12 h-12 object-cover rounded border"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display =
                                  "none";
                              }}
                            />
                          ) : (
                            <div className="w-12 h-12 bg-muted rounded border flex items-center justify-center">
                              <ImageIcon className="h-4 w-4 text-muted-foreground" />
                            </div>
                          )}
                        </TableCell>

                        <TableCell className="font-medium">
                          {albumItem.nome}
                        </TableCell>

                        <TableCell>{getPagineCount(albumItem.id)}</TableCell>

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
                    );
                  })
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
