import { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Plus,
  Trash2,
  Pencil,
  ArrowLeft,
  Save,
  Loader2,
  ImageIcon,
} from "lucide-react";

import { AppHeader } from "@/components/layout/AppHeader";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
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
import {
  Pagina,
  Album,
  DEFAULT_SYNDICATION,
  SyndicationPlatform,
} from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SyndicationSection } from "@/components/SyndicationSection";

export default function AlbumConfigPage() {
  const { albumId } = useParams<{ albumId: string }>();
  const navigate = useNavigate();

  const [albums, setAlbums] = useLocalStorage<Album[]>("album", []);
  const [pagine, setPagine] = useLocalStorage<Pagina[]>("pagine", []);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // ✅ Nuovo: quante righe mostrare
  const [pageSize, setPageSize] = useState<number>(10);

  const album = useMemo(
    () => albums.find((a) => a.id === albumId),
    [albums, albumId],
  );

  const albumPagine = useMemo(
    () =>
      pagine
        .filter((p) => p.albumId === albumId)
        .sort((a, b) => (a.ordine || 0) - (b.ordine || 0)),
    [pagine, albumId],
  );

  // ✅ Nuovo: lista pagine "visibili" (10/50/100)
  const visiblePagine = useMemo(
    () => albumPagine.slice(0, pageSize),
    [albumPagine, pageSize],
  );

  const [albumDraftSyndication, setAlbumDraftSyndication] =
    useState<SyndicationPlatform[]>(DEFAULT_SYNDICATION);

  const [isSaving, setIsSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  useEffect(() => {
    if (!album) return;
    setAlbumDraftSyndication(
      album.syndication?.length ? album.syndication : DEFAULT_SYNDICATION,
    );
    setIsSaving(false);
    setJustSaved(false);
  }, [album?.id]);

  const handleDelete = () => {
    if (!deleteId) return;
    setPagine(pagine.filter((p) => p.id !== deleteId));
    setDeleteId(null);
  };

  const setPaginaPosition = (paginaId: string, newIndex: number) => {
    const oldIndex = albumPagine.findIndex((p) => p.id === paginaId);
    if (oldIndex === -1) return;
    if (newIndex === oldIndex) return;

    const reordered = [...albumPagine];
    const [moved] = reordered.splice(oldIndex, 1);
    reordered.splice(newIndex, 0, moved);

    const updatedOrder = reordered.map((p, i) => ({
      ...p,
      ordine: i + 1,
    }));

    setPagine(
      pagine.map((p) => {
        const found = updatedOrder.find((u) => u.id === p.id);
        return found ? { ...p, ordine: found.ordine } : p;
      }),
    );
  };

  const saveAlbumSyndication = async () => {
    if (!albumId) return;

    setIsSaving(true);
    setJustSaved(false);

    setAlbums(
      albums.map((a) =>
        a.id === albumId ? { ...a, syndication: albumDraftSyndication } : a,
      ),
    );
    await new Promise((r) => setTimeout(r, 450));

    setIsSaving(false);
    setJustSaved(true);
    window.setTimeout(() => setJustSaved(false), 1200);
  };

  if (!album) {
    return (
      <>
        <AppHeader
          title="Configurazione Album"
          breadcrumb="Album > Configurazione"
        />
        <PageHeader title="Album non trovato" />
        <div className="flex-1 p-6">
          <Button onClick={() => navigate("/album")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Torna agli Album
          </Button>
        </div>
      </>
    );
  }

  return (
    <>
      <AppHeader
        title="Configurazione Album"
        breadcrumb={`Album > ${album.nome}`}
      />
      <PageHeader title={`Configurazione: ${album.nome}`} />

      <div className="flex-1 p-6 space-y-6 overflow-auto">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate("/album")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Torna agli Album
          </Button>
        </div>

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <div className="space-y-2">
              <CardTitle>Pagine</CardTitle>

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

                {albumPagine.length > pageSize ? (
                  <span className="ml-2 text-xs">
                    (Mostrati {visiblePagine.length} di {albumPagine.length})
                  </span>
                ) : null}
              </div>
            </div>

            <Button onClick={() => navigate(`/pagine/new?albumId=${albumId}`)}>
              <Plus className="h-4 w-4 mr-2" />
              Aggiungi pagina
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[140px]">Ordinamento</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Background</TableHead>
                  <TableHead className="text-right">Azioni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {albumPagine.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center text-muted-foreground py-8"
                    >
                      Nessuna pagina trovata. Clicca "Aggiungi pagina" per
                      iniziare.
                    </TableCell>
                  </TableRow>
                ) : (
                  visiblePagine.map((pagina, idx) => (
                    <TableRow key={pagina.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <select
                            className="
                              h-8
                              bg-transparent
                              border-0
                              border-b
                              border-muted-foreground/40
                              rounded-none
                              px-2
                              text-sm
                              focus:outline-none
                              focus:ring-0
                              focus:border-primary
                              cursor-pointer
                            "
                            value={idx}
                            onChange={(e) =>
                              setPaginaPosition(
                                pagina.id,
                                Number(e.target.value),
                              )
                            }
                          >
                            {visiblePagine.map((_, i) => (
                              <option key={i} value={i}>
                                {i + 1}
                              </option>
                            ))}
                          </select>
                        </div>
                      </TableCell>

                      <TableCell className="font-medium">
                        {pagina.nome}
                      </TableCell>

                      <TableCell>
                        {pagina.backgroundLink ? (
                          <img
                            src={pagina.backgroundLink}
                            alt={pagina.nome}
                            className="w-18 h-10 object-contain rounded border"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display =
                                "none";
                            }}
                          />
                        ) : (
                          <div className="w-16 h-10 bg-muted rounded border flex items-center justify-center">
                            <ImageIcon className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-right space-x-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => navigate(`/pagine/${pagina.id}`)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteId(pagina.id)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between gap-4">
            <div className="space-y-1">
              <CardTitle>Syndication Album</CardTitle>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <SyndicationSection
              syndication={albumDraftSyndication}
              onChange={setAlbumDraftSyndication}
            />
            <div className="flex justify-end pt-2">
              <Button onClick={saveAlbumSyndication} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Salvataggio...
                  </>
                ) : justSaved ? (
                  <>Salvato ✓</>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Salva
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Conferma eliminazione</AlertDialogTitle>
            <AlertDialogDescription>
              Sei sicuro di voler eliminare questa pagina? Questa azione non può
              essere annullata.
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
