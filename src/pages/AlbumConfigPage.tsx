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
  Upload,
  X,
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useRef } from "react";

export default function AlbumConfigPage() {
  const { albumId } = useParams<{ albumId: string }>();
  const navigate = useNavigate();

  const [albums, setAlbums] = useLocalStorage<Album[]>("album", []);
  const [pagine, setPagine] = useLocalStorage<Pagina[]>("pagine", []);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { toast } = useToast();

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

  // Stato per modifica dettagli album
  const [draftNome, setDraftNome] = useState("");
  const [draftLogo, setDraftLogo] = useState("");
  const [draftLogoFileName, setDraftLogoFileName] = useState("");
  const [draftImmagineDefault, setDraftImmagineDefault] = useState("");
  const [draftImmagineDefaultFileName, setDraftImmagineDefaultFileName] = useState("");
  const [draftCtaHome, setDraftCtaHome] = useState("");
  const [draftCtaHomeFileName, setDraftCtaHomeFileName] = useState("");
  
  const logoInputRef = useRef<HTMLInputElement | null>(null);
  const immagineDefaultInputRef = useRef<HTMLInputElement | null>(null);
  const ctaHomeInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!album) return;
    
    // Filtra solo le piattaforme valide (iOS e Android), escludendo Web/SmartTV legacy
    const validPlatforms: Array<"iOS" | "Android"> = ["iOS", "Android"];
    const existingSyndication = album.syndication?.filter(s => 
      validPlatforms.includes(s.platform as "iOS" | "Android")
    ) || [];
    
    // Assicura che entrambe le piattaforme siano presenti
    const normalizedSyndication = validPlatforms.map(platform => {
      const existing = existingSyndication.find(s => s.platform === platform);
      return existing || { platform, isPublished: false, startDate: null, endDate: null };
    });
    
    setAlbumDraftSyndication(normalizedSyndication);
    setDraftNome(album.nome);
    setDraftLogo((album as any).logo || "");
    setDraftLogoFileName((album as any).logoFileName || "");
    setDraftImmagineDefault(album.immagineDefault || "");
    setDraftImmagineDefaultFileName("");
    setDraftCtaHome((album as any).ctaHome || "");
    setDraftCtaHomeFileName((album as any).ctaHomeFileName || "");
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

  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "logo" | "immagineDefault" | "ctaHome"
  ) => {
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

    const MAX_MB = 2;
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
      if (type === "logo") {
        setDraftLogo(result);
        setDraftLogoFileName(file.name);
      } else if (type === "ctaHome") {
        setDraftCtaHome(result);
        setDraftCtaHomeFileName(file.name);
      } else {
        setDraftImmagineDefault(result);
        setDraftImmagineDefaultFileName(file.name);
      }
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

  const saveAlbumDetails = async () => {
    if (!albumId || !draftNome.trim()) return;

    setIsSaving(true);
    setJustSaved(false);

    setAlbums(
      albums.map((a) =>
        a.id === albumId
          ? {
              ...a,
              nome: draftNome.trim(),
              immagineDefault: draftImmagineDefault || undefined,
              ctaHome: draftCtaHome || undefined,
              ctaHomeFileName: draftCtaHomeFileName || undefined,
              logo: draftLogo || undefined,
              logoFileName: draftLogoFileName || undefined,
              syndication: albumDraftSyndication,
            } as any
          : a
      )
    );
    await new Promise((r) => setTimeout(r, 450));

    setIsSaving(false);
    setJustSaved(true);
    window.setTimeout(() => setJustSaved(false), 1200);

    toast({
      title: "Salvato",
      description: "I dettagli dell'album sono stati aggiornati",
    });
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

        {/* Dettagli Album */}
        <Card>
          <CardHeader>
            <CardTitle>Dettagli Album</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-6 items-start">
              {/* Nome */}
              <div className="space-y-2">
                <Label htmlFor="nome">Nome</Label>
                <Input
                  id="nome"
                  value={draftNome}
                  onChange={(e) => setDraftNome(e.target.value)}
                  placeholder="Nome album"
                  className="
                    rounded-none border-0 border-b-2 bg-transparent px-0 shadow-none
                    focus-visible:ring-0 focus-visible:ring-offset-0
                    border-muted-foreground/30 focus:border-b-4 focus:border-pink-500
                    transition-all duration-200
                  "
                />
              </div>

              {/* Immagine Default */}
              <div className="space-y-2">
                <Label>Immagine Default</Label>
                <input
                  ref={immagineDefaultInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleImageUpload(e, "immagineDefault")}
                />
                <div className="flex items-center gap-3">
                  <Button type="button" onClick={() => immagineDefaultInputRef.current?.click()}>
                    <Upload className="h-4 w-4 mr-2" />
                    Carica
                  </Button>
                  <span className="text-sm text-muted-foreground truncate max-w-[150px]">
                    {draftImmagineDefaultFileName || (draftImmagineDefault ? "Immagine salvata" : "Nessun file")}
                  </span>
                  {draftImmagineDefault && (
                    <Button type="button" variant="outline" size="sm" onClick={() => { setDraftImmagineDefault(""); setDraftImmagineDefaultFileName(""); }}>
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <div className="mt-2 border rounded-lg overflow-hidden w-20">
                  {draftImmagineDefault ? (
                    <img src={draftImmagineDefault} alt="Immagine default" className="w-full aspect-square object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                  ) : (
                    <div className="w-full aspect-square bg-muted flex items-center justify-center">
                      <ImageIcon className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 items-start">
              {/* Logo Album */}
              <div className="space-y-2">
                <Label>Logo Album</Label>
                <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, "logo")} />
                <div className="flex items-center gap-3">
                  <Button type="button" onClick={() => logoInputRef.current?.click()}>
                    <Upload className="h-4 w-4 mr-2" />
                    Carica
                  </Button>
                  <span className="text-sm text-muted-foreground truncate max-w-[150px]">
                    {draftLogoFileName || (draftLogo ? "Logo salvato" : "Nessun file")}
                  </span>
                  {draftLogo && (
                    <Button type="button" variant="outline" size="sm" onClick={() => { setDraftLogo(""); setDraftLogoFileName(""); }}>
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <div className="mt-2 border rounded-lg overflow-hidden w-20">
                  {draftLogo ? (
                    <img src={draftLogo} alt="Logo album" className="w-full aspect-square object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                  ) : (
                    <div className="w-full aspect-square bg-muted flex items-center justify-center">
                      <ImageIcon className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                </div>
              </div>

              {/* CTAHome */}
              <div className="space-y-2">
                <Label>CTAHome</Label>
                <input ref={ctaHomeInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, "ctaHome")} />
                <div className="flex items-center gap-3">
                  <Button type="button" onClick={() => ctaHomeInputRef.current?.click()}>
                    <Upload className="h-4 w-4 mr-2" />
                    Carica
                  </Button>
                  <span className="text-sm text-muted-foreground truncate max-w-[150px]">
                    {draftCtaHomeFileName || (draftCtaHome ? "Immagine salvata" : "Nessun file")}
                  </span>
                  {draftCtaHome && (
                    <Button type="button" variant="outline" size="sm" onClick={() => { setDraftCtaHome(""); setDraftCtaHomeFileName(""); }}>
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <div className="mt-2 border rounded-lg overflow-hidden w-20">
                  {draftCtaHome ? (
                    <img src={draftCtaHome} alt="CTAHome" className="w-full aspect-square object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                  ) : (
                    <div className="w-full aspect-square bg-muted flex items-center justify-center">
                      <ImageIcon className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button onClick={saveAlbumDetails} disabled={isSaving || !draftNome.trim()}>
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
                    Salva Dettagli
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

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
