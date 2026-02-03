import { useRef, useState, useMemo } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  Trash2,
  ImageIcon,
  Search,
  Check,
  Upload,
  X,
} from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

  const [pickOpen, setPickOpen] = useState(false);
  const [pickQuery, setPickQuery] = useState("");

  const isNew = paginaId === "new";
  const preselectedAlbumId = searchParams.get("albumId");
  const pagina = isNew ? null : pagine.find((p) => p.id === paginaId);

  const album = albums.find(
    (a) => a.id === (pagina?.albumId || preselectedAlbumId),
  );

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [formData, setFormData] = useState({
    nome: pagina?.nome || "",
    backgroundLink: pagina?.backgroundLink || "",
    albumId: pagina?.albumId || preselectedAlbumId || "",
    bgFileName: (pagina as any)?.bgFileName || "",
  });

  const paginaFigurine = useMemo(() => {
    if (!paginaId || isNew) return [];
    return figurine
      .filter((f) => f.paginaId === paginaId)
      .sort((a, b) => (a.ordine || 0) - (b.ordine || 0));
  }, [figurine, paginaId, isNew]);

  const getFigurinaAlbumId = (f: Figurina) => {
    const directAlbumId = (f as any).albumId as string | undefined;
    if (directAlbumId) return directAlbumId;

    if (!f.paginaId) return "";
    const p = pagine.find((pg) => pg.id === f.paginaId);
    return p?.albumId || "";
  };

  const figurineDisponibili = useMemo(() => {
    const q = pickQuery.trim().toLowerCase();
    const sameAlbum = figurine.filter((f) => {
      const fAlbumId = getFigurinaAlbumId(f);
      return fAlbumId === formData.albumId;
    });

    const filtered = q
      ? sameAlbum.filter((f) => f.nome.toLowerCase().includes(q))
      : sameAlbum;

    filtered.sort((a, b) => (a.numero || 0) - (b.numero || 0));
    return filtered;
  }, [figurine, pickQuery, pagine, formData.albumId]);

  const getNextOrdine = () => {
    const albumPagine = pagine.filter((p) => p.albumId === formData.albumId);
    if (albumPagine.length === 0) return 1;
    return Math.max(...albumPagine.map((p) => p.ordine)) + 1;
  };

  const openBgPicker = () => fileInputRef.current?.click();

  const handleBgFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({
        title: "File non valido",
        description: "Seleziona un file immagine (PNG, JPG, WEBP...)",
        variant: "destructive",
      });
      e.target.value = "";
      return;
    }

    const MAX_MB = 3;
    const sizeMb = file.size / (1024 * 1024);
    if (sizeMb > MAX_MB) {
      toast({
        title: "Immagine troppo grande",
        description: `Scegli un'immagine più piccola di ${MAX_MB}MB`,
        variant: "destructive",
      });
      e.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setFormData((prev) => ({
        ...prev,
        backgroundLink: result,
        bgFileName: file.name,
      }));
    };
    reader.onerror = () => {
      toast({
        title: "Errore",
        description: "Non sono riuscito a leggere il file",
        variant: "destructive",
      });
    };

    reader.readAsDataURL(file);

    e.target.value = "";
  };

  const handleRemoveBg = () => {
    setFormData((prev) => ({ ...prev, backgroundLink: "", bgFileName: "" }));
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
      const newPagina: any = {
        id: crypto.randomUUID(),
        nome: formData.nome.trim(),
        backgroundLink: formData.backgroundLink,
        bgFileName: formData.bgFileName,
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
        pagine.map((p: any) =>
          p.id === paginaId
            ? {
                ...p,
                nome: formData.nome.trim(),
                backgroundLink: formData.backgroundLink,
                bgFileName: formData.bgFileName,
              }
            : p,
        ),
      );
      toast({
        title: "Pagina salvata",
        description: `La pagina "${formData.nome}" è stata aggiornata`,
      });
    }

    setTimeout(() => navigate(returnUrl), 500);
  };

  const handleCancel = () => {
    const returnUrl = formData.albumId
      ? `/album/${formData.albumId}`
      : "/album";
    navigate(returnUrl);
  };

  const handleDeleteFigurina = () => {
    if (!deleteId) return;
    setFigurine(figurine.filter((f) => f.id !== deleteId));
    setDeleteId(null);
  };

  const setFigurinaPosition = (figurinaId: string, newIndex: number) => {
    const oldIndex = paginaFigurine.findIndex((f) => f.id === figurinaId);
    if (oldIndex === -1 || newIndex === oldIndex) return;

    const reordered = [...paginaFigurine];
    const [moved] = reordered.splice(oldIndex, 1);
    reordered.splice(newIndex, 0, moved);

    const updatedOrder = reordered.map((f, i) => ({
      ...f,
      ordine: i + 1,
    }));

    setFigurine(
      figurine.map((f) => {
        const found = updatedOrder.find((u) => u.id === f.id);
        return found ? { ...f, ordine: found.ordine } : f;
      }),
    );
  };

  const handleToggleFigurina = (figurinaIdToToggle: string) => {
    if (!paginaId || isNew) return;

    setFigurine((prev) => {
      const target = prev.find((f) => f.id === figurinaIdToToggle);
      if (!target) return prev;

      const isSelected = target.paginaId === paginaId;

      if (isSelected) {
        toast({
          title: "Figurina rimossa",
          description: "La figurina è stata rimossa dalla pagina",
        });

        return prev.map((f) =>
          f.id === figurinaIdToToggle
            ? { ...f, paginaId: "", ordine: undefined }
            : f,
        );
      }

      const existing = prev.filter((f) => f.paginaId === paginaId);
      const nextOrdine =
        existing.length === 0
          ? 1
          : Math.max(...existing.map((f) => f.ordine || 0)) + 1;

      toast({
        title: "Figurina aggiunta",
        description: "La figurina è stata aggiunta alla pagina",
      });

      return prev.map((f) =>
        f.id === figurinaIdToToggle
          ? { ...f, paginaId, ordine: nextOrdine }
          : f,
      );
    });
  };

  if (!isNew && !pagina) {
    return (
      <>
        <AppHeader
          title="Configurazione Pagina"
          breadcrumb="Pagina > Configurazione"
        />
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

  // ✅ testo a destra del bottone
  const bgFileLabel =
    formData.bgFileName ||
    (formData.backgroundLink ? "Immagine salvata" : "Nessun file selezionato");

  return (
    <>
      <AppHeader
        title="Configurazione Pagina"
        breadcrumb={`Album > ${album?.nome || "..."} > ${isNew ? "Nuova Pagina" : pagina?.nome}`}
      />
      <PageHeader
        title={isNew ? "Nuova Pagina" : `Configurazione: ${pagina?.nome}`}
      />

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
                    onChange={(e) =>
                      setFormData({ ...formData, nome: e.target.value })
                    }
                    placeholder="Nome pagina"
                    className="rounded-none border-0 border-b-2 bg-transparent px-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 border-muted-foreground/30 focus:border-b-4 focus:border-pink-500 transition-all duration-200"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Background</Label>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleBgFileChange}
                  />
                  <div className="flex items-center gap-3">
                    <Button type="button" onClick={openBgPicker}>
                      <Upload className="h-4 w-4 mr-2" />
                      Carica immagine
                    </Button>

                    <span className="text-sm text-muted-foreground truncate max-w-[260px]">
                      {bgFileLabel}
                    </span>

                    {formData.backgroundLink && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleRemoveBg}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Rimuovi
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Preview Background</Label>
                <div className="border rounded-lg overflow-hidden max-w-md">
                  {formData.backgroundLink ? (
                    <img
                      src={formData.backgroundLink}
                      alt="Preview background"
                      className="w-full h-48 object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="w-full h-48 bg-muted flex items-center justify-center">
                      <ImageIcon className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                </div>
              </div>

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
              <CardTitle>Figurine</CardTitle>

              <Button onClick={() => setPickOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Inserisci figurina
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[140px]">Ordinamento</TableHead>
                    <TableHead>Titolo</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Miniatura</TableHead>
                    <TableHead className="text-right">Azioni</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginaFigurine.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center text-muted-foreground py-8"
                      >
                        Nessuna figurina inserita
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginaFigurine.map((fig, idx) => (
                      <TableRow key={fig.id}>
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
                                setFigurinaPosition(fig.id, Number(e.target.value))
                              }
                            >
                              {paginaFigurine.map((_, i) => (
                                <option key={i} value={i}>
                                  {i + 1}
                                </option>
                              ))}
                            </select>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          {fig.nome}
                        </TableCell>
                        <TableCell>{fig.tipo}</TableCell>
                        <TableCell>
                          {fig.link ? (
                            <img
                              src={fig.link}
                              alt={fig.nome}
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
                        <TableCell className="text-right space-x-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteId(fig.id)}
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
      <Dialog open={pickOpen} onOpenChange={setPickOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Seleziona figurine</DialogTitle>
            <DialogDescription>
              Mostro solo le figurine dell’album: <b>{album?.nome || "—"}</b>.
              Puoi selezionare/deselezionare più figurine.
            </DialogDescription>
          </DialogHeader>

          <div className="flex gap-3 items-center">
            <div className="flex-1">
              <Input
                placeholder="Cerca figurina..."
                value={pickQuery}
                onChange={(e) => setPickQuery(e.target.value)}
                className="
                  rounded-none border-0 border-b-2 bg-transparent px-0 shadow-none
                  focus-visible:ring-0 focus-visible:ring-offset-0
                  border-muted-foreground/30 focus:border-b-4 
                  transition-all duration-200
                "
              />
            </div>
            <Button variant="default" size="icon" aria-label="Cerca">
              <Search className="h-4 w-4" />
            </Button>
          </div>

          <div className="max-h-[55vh] overflow-auto border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Titolo</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="w-[90px]">Miniatura</TableHead>
                  <TableHead className="text-right w-[160px]">Azione</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {figurineDisponibili.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center text-muted-foreground py-8"
                    >
                      Nessuna figurina trovata per questo album
                    </TableCell>
                  </TableRow>
                ) : (
                  figurineDisponibili.map((f) => {
                    const isSelected = !isNew && f.paginaId === paginaId;

                    return (
                      <TableRow
                        key={f.id}
                        className={isSelected ? "bg-muted/50" : ""}
                      >
                        <TableCell className="font-medium">{f.nome}</TableCell>
                        <TableCell>{f.tipo}</TableCell>
                        <TableCell>
                          {f.link ? (
                            <img
                              src={f.link}
                              alt={f.nome}
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

                        <TableCell className="text-right">
                          <Button
                            variant={isSelected ? "outline" : "default"}
                            onClick={() => handleToggleFigurina(f.id)}
                            disabled={isNew}
                          >
                            {isSelected ? (
                              <>
                                <Trash2 className="h-4 w-4 mr-2" />
                                Rimuovi
                              </>
                            ) : (
                              <>
                                <Check className="h-4 w-4 mr-2" />
                                Seleziona
                              </>
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setPickOpen(false)}>
              Chiudi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
            <AlertDialogAction onClick={handleDeleteFigurina}>
              Elimina
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
