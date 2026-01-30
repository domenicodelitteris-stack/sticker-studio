import { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Plus, Trash2, Pencil, ArrowLeft, Save, Loader2, ArrowUp, ArrowDown, ImageIcon } from "lucide-react";

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
import { SyndicationStatusIcons } from "@/components/SyndicationStatusIcons";
import { SyndicationSection } from "@/components/SyndicationSection";

export default function AlbumConfigPage() {
  const { albumId } = useParams<{ albumId: string }>();
  const navigate = useNavigate();

  const [albums, setAlbums] = useLocalStorage<Album[]>("album", []);
  const [pagine, setPagine] = useLocalStorage<Pagina[]>("pagine", []);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const album = useMemo(
    () => albums.find((a) => a.id === albumId),
    [albums, albumId]
  );

  const albumPagine = useMemo(
    () =>
      pagine
        .filter((p) => p.albumId === albumId)
        .sort((a, b) => (a.ordine || 0) - (b.ordine || 0)),
    [pagine, albumId]
  );

  const [albumDraftSyndication, setAlbumDraftSyndication] =
    useState<SyndicationPlatform[]>(DEFAULT_SYNDICATION);

  const [isSaving, setIsSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  useEffect(() => {
    if (!album) return;
    setAlbumDraftSyndication(
      album.syndication?.length ? album.syndication : DEFAULT_SYNDICATION
    );
    setIsSaving(false);
    setJustSaved(false);
  }, [album?.id]);

  const handleDelete = () => {
    if (!deleteId) return;
    setPagine(pagine.filter((p) => p.id !== deleteId));
    setDeleteId(null);
  };

  const movePagina = (paginaId: string, direction: "up" | "down") => {
    const idx = albumPagine.findIndex((p) => p.id === paginaId);
    if (idx === -1) return;
    if (direction === "up" && idx === 0) return;
    if (direction === "down" && idx === albumPagine.length - 1) return;

    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    const currentOrdine = albumPagine[idx].ordine;
    const swapOrdine = albumPagine[swapIdx].ordine;

    setPagine(
      pagine.map((p) => {
        if (p.id === albumPagine[idx].id) return { ...p, ordine: swapOrdine };
        if (p.id === albumPagine[swapIdx].id) return { ...p, ordine: currentOrdine };
        return p;
      })
    );
  };

  const saveAlbumSyndication = async () => {
    if (!albumId) return;

    setIsSaving(true);
    setJustSaved(false);

    setAlbums(
      albums.map((a) =>
        a.id === albumId ? { ...a, syndication: albumDraftSyndication } : a
      )
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
            <CardTitle>Pagine ({albumPagine.length} elementi)</CardTitle>
            <Button onClick={() => navigate(`/pagine/new?albumId=${albumId}`)}>
              <Plus className="h-4 w-4 mr-2" />
              Aggiungi pagina
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Ordine</TableHead>
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
                      Nessuna pagina trovata. Clicca "Aggiungi pagina" per iniziare.
                    </TableCell>
                  </TableRow>
                ) : (
                  albumPagine.map((pagina, idx) => (
                    <TableRow key={pagina.id}>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => movePagina(pagina.id, "up")}
                            disabled={idx === 0}
                          >
                            <ArrowUp className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => movePagina(pagina.id, "down")}
                            disabled={idx === albumPagine.length - 1}
                          >
                            <ArrowDown className="h-3 w-3" />
                          </Button>
                          <span className="text-xs text-muted-foreground ml-1">
                            {pagina.ordine}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{pagina.nome}</TableCell>
                      <TableCell>
                        {pagina.backgroundLink ? (
                          <img
                            src={pagina.backgroundLink}
                            alt={pagina.nome}
                            className="w-16 h-10 object-cover rounded border"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = "none";
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
            <div className="flex items-center justify-start gap-4">
              <div className="text-sm text-muted-foreground">Stato attuale:</div>
              <SyndicationStatusIcons
                syndication={albumDraftSyndication || DEFAULT_SYNDICATION}
              />
            </div>

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
            <AlertDialogAction onClick={handleDelete}>Elimina</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
