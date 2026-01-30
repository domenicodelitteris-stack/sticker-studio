import { useState, useMemo } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Plus, Trash2, Pencil, ArrowUp, ArrowDown, ImageIcon } from "lucide-react";
import { AppHeader } from "@/components/layout/AppHeader";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { useToast } from "@/hooks/use-toast";
import { Figurina, Pagina, Album } from "@/types";

export default function PaginaConfigPage() {
  const { paginaId } = useParams<{ paginaId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [pagine, setPagine] = useLocalStorage<Pagina[]>("pagine", []);
  const [figurine, setFigurine] = useLocalStorage<Figurina[]>("figurine", []);
  const [albums] = useLocalStorage<Album[]>("album", []);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const isNew = paginaId === "new";
  const preselectedAlbumId = searchParams.get("albumId");
  const pagina = isNew ? null : pagine.find((p) => p.id === paginaId);
  const album = albums.find((a) => a.id === (pagina?.albumId || preselectedAlbumId));

  const [formData, setFormData] = useState({
    nome: pagina?.nome || "",
    backgroundLink: pagina?.backgroundLink || "",
    albumId: pagina?.albumId || preselectedAlbumId || "",
  });

  const paginaFigurine = useMemo(() => {
    if (!paginaId || isNew) return [];
    return figurine
      .filter((f) => f.paginaId === paginaId)
      .sort((a, b) => (a.ordine || 0) - (b.ordine || 0));
  }, [figurine, paginaId, isNew]);

  const getNextOrdine = () => {
    const albumPagine = pagine.filter((p) => p.albumId === formData.albumId);
    if (albumPagine.length === 0) return 1;
    return Math.max(...albumPagine.map((p) => p.ordine)) + 1;
  };

  const handleSave = () => {
    if (!formData.nome.trim()) {
      toast({
        title: "Errore",
        description: "Inserisci un nome per la pagina",
        variant: "destructive",
      });
      return;
    }

    if (!formData.albumId) {
      toast({
        title: "Errore",
        description: "Album non specificato",
        variant: "destructive",
      });
      return;
    }

    const returnUrl = `/album/${formData.albumId}`;

    if (isNew) {
      const newPagina: Pagina = {
        id: crypto.randomUUID(),
        nome: formData.nome.trim(),
        backgroundLink: formData.backgroundLink.trim(),
        albumId: formData.albumId,
        ordine: getNextOrdine(),
        createdAt: new Date(),
      };

      setPagine([...pagine, newPagina]);
      toast({
        title: "Pagina creata",
        description: `La pagina "${formData.nome}" è stata creata`,
      });
    } else {
      setPagine(
        pagine.map((p) =>
          p.id === paginaId
            ? {
                ...p,
                nome: formData.nome.trim(),
                backgroundLink: formData.backgroundLink.trim(),
              }
            : p
        )
      );
      toast({
        title: "Pagina salvata",
        description: `La pagina "${formData.nome}" è stata aggiornata`,
      });
    }

    setTimeout(() => navigate(returnUrl), 500);
  };

  const handleCancel = () => {
    const returnUrl = formData.albumId ? `/album/${formData.albumId}` : "/album";
    navigate(returnUrl);
  };

  const handleDeleteFigurina = () => {
    if (!deleteId) return;
    setFigurine(figurine.filter((f) => f.id !== deleteId));
    setDeleteId(null);
  };

  const moveFigurina = (figurinaId: string, direction: "up" | "down") => {
    const idx = paginaFigurine.findIndex((f) => f.id === figurinaId);
    if (idx === -1) return;
    if (direction === "up" && idx === 0) return;
    if (direction === "down" && idx === paginaFigurine.length - 1) return;

    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    const currentOrdine = paginaFigurine[idx].ordine;
    const swapOrdine = paginaFigurine[swapIdx].ordine;

    setFigurine(
      figurine.map((f) => {
        if (f.id === paginaFigurine[idx].id) return { ...f, ordine: swapOrdine };
        if (f.id === paginaFigurine[swapIdx].id) return { ...f, ordine: currentOrdine };
        return f;
      })
    );
  };

  if (!isNew && !pagina) {
    return (
      <>
        <AppHeader title="Configurazione Pagina" breadcrumb="Pagina > Configurazione" />
        <PageHeader title="Pagina non trovata" />
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
        title="Configurazione Pagina"
        breadcrumb={`Album > ${album?.nome || "..."} > ${isNew ? "Nuova Pagina" : pagina?.nome}`}
      />
      <PageHeader title={isNew ? "Nuova Pagina" : `Configurazione: ${pagina?.nome}`} />

      <div className="flex-1 p-6 space-y-6 overflow-auto">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={handleCancel}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Torna all'Album
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Dettagli Pagina</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    placeholder="Nome pagina"
                    className="rounded-none border-0 border-b-2 bg-transparent px-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 border-muted-foreground/30 focus:border-b-4 focus:border-pink-500 transition-all duration-200"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="backgroundLink">Link Immagine Background</Label>
                  <Input
                    id="backgroundLink"
                    value={formData.backgroundLink}
                    onChange={(e) => setFormData({ ...formData, backgroundLink: e.target.value })}
                    placeholder="https://esempio.com/background.jpg"
                    className="rounded-none border-0 border-b-2 bg-transparent px-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 border-muted-foreground/30 focus:border-b-4 focus:border-pink-500 transition-all duration-200"
                  />
                </div>
              </div>

              {formData.backgroundLink && (
                <div className="space-y-2">
                  <Label>Preview Background</Label>
                  <div className="border rounded-lg overflow-hidden max-w-md">
                    <img
                      src={formData.backgroundLink}
                      alt="Preview background"
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-4 pt-4">
                <Button variant="outline" onClick={handleCancel}>
                  Annulla
                </Button>
                <Button onClick={handleSave}>
                  {isNew ? "Crea Pagina" : "Salva Modifiche"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {!isNew && (
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle>Figurine ({paginaFigurine.length} elementi)</CardTitle>
              <Button onClick={() => navigate(`/figurine/new?paginaId=${paginaId}`)}>
                <Plus className="h-4 w-4 mr-2" />
                Inserisci figurina
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">Ordine</TableHead>
                    <TableHead>ID</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Preview</TableHead>
                    <TableHead className="text-right">Azioni</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginaFigurine.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        Nessuna figurina inserita
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginaFigurine.map((figurina, idx) => (
                      <TableRow key={figurina.id}>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => moveFigurina(figurina.id, "up")}
                              disabled={idx === 0}
                            >
                              <ArrowUp className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => moveFigurina(figurina.id, "down")}
                              disabled={idx === paginaFigurine.length - 1}
                            >
                              <ArrowDown className="h-3 w-3" />
                            </Button>
                            <span className="text-xs text-muted-foreground ml-1">{figurina.ordine}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{figurina.numero}</TableCell>
                        <TableCell>{figurina.nome}</TableCell>
                        <TableCell>{figurina.tipo}</TableCell>
                        <TableCell>
                          {figurina.link ? (
                            <img
                              src={figurina.link}
                              alt={figurina.nome}
                              className="w-12 h-16 object-cover rounded border"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = "none";
                              }}
                            />
                          ) : (
                            <div className="w-12 h-16 bg-muted rounded border flex items-center justify-center">
                              <ImageIcon className="h-4 w-4 text-muted-foreground" />
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-right space-x-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate(`/figurine/${figurina.id}?paginaId=${paginaId}`)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteId(figurina.id)}
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
        )}
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Conferma eliminazione</AlertDialogTitle>
            <AlertDialogDescription>
              Sei sicuro di voler eliminare questa figurina? Questa azione non può essere annullata.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteFigurina}>Elimina</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
