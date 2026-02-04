import { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Search,
  Check,
} from "lucide-react";
import { AppHeader } from "@/components/layout/AppHeader";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useToast } from "@/hooks/use-toast";
import {
  Pacchetto,
  Album,
  Pagina,
  Figurina,
  DEFAULT_SYNDICATION,
  SyndicationPlatform,
  PacchettoFigurina,
} from "@/types";
import { SyndicationSection } from "@/components/SyndicationSection";

export default function PacchettoConfigPage() {
  const { pacchettoId } = useParams<{ pacchettoId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [pacchetti, setPacchetti] = useLocalStorage<Pacchetto[]>(
    "pacchetti",
    [],
  );
  const [albums] = useLocalStorage<Album[]>("album", []);
  const [pagine] = useLocalStorage<Pagina[]>("pagine", []);
  const [figurine] = useLocalStorage<Figurina[]>("figurine", []);

  const [pickOpen, setPickOpen] = useState(false);
  const [pickQuery, setPickQuery] = useState("");

  const isNew = pacchettoId === "new";
  const tipoFromUrl = searchParams.get("tipo") as "statico" | "dinamico" | null;
  const pacchetto = isNew ? null : pacchetti.find((p) => p.id === pacchettoId);

  const [formData, setFormData] = useState({
    nome: pacchetto?.nome || "",
    numFigurine: pacchetto?.numFigurine || 1,
    tipo:
      pacchetto?.tipo || tipoFromUrl || ("statico" as "statico" | "dinamico"),
    syndication:
      pacchetto?.syndication ||
      ([...DEFAULT_SYNDICATION] as SyndicationPlatform[]),
    albumId: pacchetto?.albumId || "",
    figurineSelezionate: (pacchetto?.figurine || []).map((f) => ({
      ...f,
      frequenza: f.frequenza ?? 0,
    })) as (PacchettoFigurina & { frequenza: number })[],
  });
  const [numFigurineText, setNumFigurineText] = useState(
    String(pacchetto?.numFigurine ?? 1),
  );
  // Get pages for the selected album
  const pagineAlbum = useMemo(() => {
    if (!formData.albumId) return [];
    return pagine.filter((p) => p.albumId === formData.albumId);
  }, [formData.albumId, pagine]);

  // Helper to get album ID for a figurina (direct or through page)
  const getFigurinaAlbumId = (f: Figurina) => {
    const directAlbumId = (f as any).albumId as string | undefined;
    if (directAlbumId) return directAlbumId;
    if (!f.paginaId) return "";
    const p = pagine.find((pg) => pg.id === f.paginaId);
    return p?.albumId || "";
  };

  // Get figurines for the selected album (direct albumId or through pages)
  const figurineAlbum = useMemo(() => {
    if (!formData.albumId) return [];
    return figurine.filter((f) => getFigurinaAlbumId(f) === formData.albumId);
  }, [formData.albumId, figurine, pagine]);

  useEffect(() => {
    setNumFigurineText(String(formData.numFigurine ?? ""));
  }, [formData.numFigurine]);

  const figurineCandidate = useMemo(() => {
    // Scegli l'ordine automatico: qui per nome
    return [...figurineAlbum].sort((a, b) => a.nome.localeCompare(b.nome));
  }, [figurineAlbum]);

  // Get figurines filtered by search query for picker
  const figurineDisponibiliPicker = useMemo(() => {
    const q = pickQuery.trim().toLowerCase();
    const selectedIds = formData.figurineSelezionate.map((f) => f.figurinaId);
    const available = figurineAlbum.filter((f) => !selectedIds.includes(f.id));
    if (!q) return available;
    return available.filter((f) => f.nome.toLowerCase().includes(q));
  }, [figurineAlbum, formData.figurineSelezionate, pickQuery]);

  const handleToggleFigurina = (figurinaId: string) => {
    const isSelected = formData.figurineSelezionate.some(
      (f) => f.figurinaId === figurinaId,
    );

    if (isSelected) {
      const updated = formData.figurineSelezionate.filter(
        (f) => f.figurinaId !== figurinaId,
      );
      setFormData({
        ...formData,
        figurineSelezionate: updated,
        numFigurine:
          formData.tipo === "statico" ? updated.length : formData.numFigurine,
      });
      toast({
        title: "Figurina rimossa",
        description: "La figurina è stata rimossa dal pacchetto",
      });
    } else {
      const maxOrdine = formData.figurineSelezionate.reduce(
        (max, f) => Math.max(max, f.ordine),
        0,
      );
      const newFigurina = { figurinaId, ordine: maxOrdine + 1, frequenza: 0 };
      setFormData({
        ...formData,
        figurineSelezionate: [...formData.figurineSelezionate, newFigurina],
        numFigurine:
          formData.tipo === "statico"
            ? formData.figurineSelezionate.length + 1
            : formData.numFigurine,
      });
      toast({
        title: "Figurina aggiunta",
        description: "La figurina è stata aggiunta al pacchetto",
      });
    }
  };

  // Calculate total frequency for dynamic packets
  const totalFrequenza = useMemo(() => {
    if (formData.tipo !== "dinamico") return 100;
    return formData.figurineSelezionate.reduce(
      (sum, f) => sum + (f.frequenza || 0),
      0,
    );
  }, [formData.figurineSelezionate, formData.tipo]);

  const handleFrequenzaChange = (figurinaId: string, newFrequenza: number) => {
    setFormData((prev) => ({
      ...prev,
      figurineSelezionate: prev.figurineSelezionate.map((f) =>
        f.figurinaId === figurinaId ? { ...f, frequenza: newFrequenza } : f,
      ),
    }));
  };
  useEffect(() => {
    if (formData.tipo !== "statico") return;
    if (!formData.albumId) return;

    const max = figurineAlbum.length;

    if (max === 0) {
      if (formData.numFigurine !== 0 || formData.figurineSelezionate.length) {
        setFormData((prev) => ({
          ...prev,
          numFigurine: 0,
          figurineSelezionate: [],
        }));
      }
      return;
    }

    const target = Math.min(Math.max(1, formData.numFigurine), max);

    if (target !== formData.numFigurine) {
      setFormData((prev) => ({ ...prev, numFigurine: target }));
      return;
    }

    const selectedSorted = [...formData.figurineSelezionate].sort(
      (a, b) => a.ordine - b.ordine,
    );
    if (selectedSorted.length > target) {
      const trimmed = selectedSorted.slice(0, target).map((x, i) => ({
        ...x,
        ordine: i + 1,
      }));

      setFormData((prev) => ({
        ...prev,
        figurineSelezionate: trimmed,
      }));
      return;
    }
    if (selectedSorted.length < target) {
      const selectedIds = new Set(selectedSorted.map((x) => x.figurinaId));

      const missing = figurineCandidate
        .filter((f) => !selectedIds.has(f.id))
        .slice(0, target - selectedSorted.length)
        .map((f, idx) => ({
          figurinaId: f.id,
          ordine: selectedSorted.length + idx + 1,
          frequenza: 0,
        }));

      const next = [...selectedSorted, ...missing].map((x, i) => ({
        ...x,
        ordine: i + 1,
        frequenza: x.frequenza ?? 0,
      }));

      setFormData((prev) => ({
        ...prev,
        figurineSelezionate: next,
      }));
    }
  }, [
    formData.tipo,
    formData.albumId,
    formData.numFigurine,
    formData.figurineSelezionate,
    figurineAlbum.length,
    figurineCandidate,
  ]);

  const setFigurinaPosition = (figurinaId: string, newIndex: number) => {
    const ordered = [...formData.figurineSelezionate].sort(
      (a, b) => a.ordine - b.ordine,
    );

    const oldIndex = ordered.findIndex((f) => f.figurinaId === figurinaId);
    if (oldIndex === -1) return;
    if (oldIndex === newIndex) return;

    const [moved] = ordered.splice(oldIndex, 1);
    ordered.splice(newIndex, 0, moved);

    const reindexed = ordered.map((item, i) => ({
      ...item,
      ordine: i + 1,
    }));

    setFormData((prev) => ({
      ...prev,
      figurineSelezionate: reindexed,
    }));
  };

  const figurineNelPacchetto = useMemo(() => {
    return [...formData.figurineSelezionate]
      .sort((a, b) => a.ordine - b.ordine)
      .map((pf) => ({
        ...pf,
        figurina: figurine.find((f) => f.id === pf.figurinaId),
      }));
  }, [formData.figurineSelezionate, figurine]);

  const handleAddFigurina = (figurinaId: string) => {
    const maxOrdine = formData.figurineSelezionate.reduce(
      (max, f) => Math.max(max, f.ordine),
      0,
    );
    const newFigurina = { figurinaId, ordine: maxOrdine + 1, frequenza: 0 };
    setFormData({
      ...formData,
      figurineSelezionate: [...formData.figurineSelezionate, newFigurina],
      numFigurine:
        formData.tipo === "statico"
          ? formData.figurineSelezionate.length + 1
          : formData.numFigurine,
    });
  };

  const handleRemoveFigurina = (figurinaId: string) => {
    setFormData((prev) => {
      const updated = prev.figurineSelezionate
        .filter((f) => f.figurinaId !== figurinaId)
        .sort((a, b) => a.ordine - b.ordine)
        .map((x, i) => ({ ...x, ordine: i + 1 }));

      const nextNum =
        prev.tipo === "statico"
          ? Math.max(1, updated.length)
          : prev.numFigurine;

      return {
        ...prev,
        figurineSelezionate: updated,
        numFigurine: nextNum,
      };
    });
  };

  const handleMoveFigurina = (figurinaId: string, direction: "up" | "down") => {
    const sorted = [...formData.figurineSelezionate].sort(
      (a, b) => a.ordine - b.ordine,
    );
    const index = sorted.findIndex((f) => f.figurinaId === figurinaId);
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === sorted.length - 1)
    ) {
      return;
    }
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    const tempOrdine = sorted[index].ordine;
    sorted[index].ordine = sorted[swapIndex].ordine;
    sorted[swapIndex].ordine = tempOrdine;
    setFormData({ ...formData, figurineSelezionate: sorted });
  };

  const handleAlbumChange = (albumId: string) => {
    setFormData({
      ...formData,
      albumId,
      figurineSelezionate: [],
      numFigurine: 0,
    });
  };

  const handleSave = () => {
    if (!formData.nome.trim()) {
      toast({
        title: "Errore",
        description: "Inserisci un nome per il pacchetto",
        variant: "destructive",
      });
      return;
    }

    // Validation for dynamic packets: sum of frequencies must be 100
    if (
      formData.tipo === "dinamico" &&
      formData.figurineSelezionate.length > 0
    ) {
      if (totalFrequenza !== 100) {
        toast({
          title: "Errore",
          description: `La somma delle frequenze deve essere 100% (attuale: ${totalFrequenza}%)`,
          variant: "destructive",
        });
        return;
      }
    }

    if (isNew) {
      const newPacchetto: Pacchetto = {
        id: crypto.randomUUID(),
        nome: formData.nome,
        numFigurine: formData.numFigurine,
        tipo: formData.tipo,
        syndication: formData.syndication,
        createdAt: new Date(),
        albumId: formData.albumId || undefined,
        figurine:
          formData.figurineSelezionate.length > 0
            ? formData.figurineSelezionate
            : undefined,
      };
      setPacchetti([...pacchetti, newPacchetto]);
      toast({
        title: "Pacchetto creato",
        description: `Il pacchetto "${formData.nome}" è stato creato`,
      });
    } else {
      setPacchetti(
        pacchetti.map((p) =>
          p.id === pacchettoId
            ? {
                ...p,
                nome: formData.nome,
                numFigurine: formData.numFigurine,
                syndication: formData.syndication,
                albumId: formData.albumId || undefined,
                figurine:
                  formData.figurineSelezionate.length > 0
                    ? formData.figurineSelezionate
                    : undefined,
              }
            : p,
        ),
      );
      toast({
        title: "Pacchetto salvato",
        description: `Il pacchetto "${formData.nome}" è stato aggiornato`,
      });
    }
    setTimeout(() => {
      navigate("/pacchetti");
    }, 1000);
  };

  if (!isNew && !pacchetto) {
    return (
      <>
        <AppHeader
          title="Configurazione Pacchetto"
          breadcrumb="Pacchetti > Configurazione"
        />
        <PageHeader title="Pacchetto non trovato" />
        <div className="flex-1 p-6">
          <Button onClick={() => navigate("/pacchetti")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Torna ai Pacchetti
          </Button>
        </div>
      </>
    );
  }

  const pageTitle = isNew
    ? `Nuovo Pacchetto ${formData.tipo === "statico" ? "Statico" : "Dinamico"}`
    : `Configurazione: ${pacchetto?.nome}`;

  return (
    <>
      <AppHeader
        title="Configurazione Pacchetto"
        breadcrumb={`Pacchetti > ${isNew ? "Nuovo" : pacchetto?.nome}`}
      />
      <PageHeader title={pageTitle} />

      <div className="flex-1 p-6 space-y-6 overflow-auto">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate("/pacchetti")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Torna ai Pacchetti
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Dettagli Pacchetto</CardTitle>
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
                    placeholder="Inserisci nome pacchetto"
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
                <div className="space-y-2">
                  <Label htmlFor="numFigurine">Numero figurine</Label>
                  <Input
                    id="numFigurine"
                    type="number"
                    min={1}
                    max={Math.max(1, figurineAlbum.length)}
                    value={numFigurineText}
                    onChange={(e) => setNumFigurineText(e.target.value)}
                    onBlur={() => {
                      const max = Math.max(1, figurineAlbum.length);

                      const raw = numFigurineText.trim();
                      const parsed = raw === "" ? 1 : parseInt(raw, 10);

                      const clamped = Math.min(
                        Math.max(1, isNaN(parsed) ? 1 : parsed),
                        max,
                      );

                      setNumFigurineText(String(clamped));
                      setFormData((prev) => ({
                        ...prev,
                        numFigurine: clamped,
                      }));
                    }}
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
                  {formData.albumId ? (
                    <p className="text-xs text-muted-foreground">
                      Puoi inserire da 1 a {Math.max(1, figurineAlbum.length)}{" "}
                      figurine (massimo disponibile nell’album).
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      Seleziona un album per vedere il numero massimo di
                      figurine.
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="album">Album</Label>
                  <Select
                    value={formData.albumId}
                    onValueChange={handleAlbumChange}
                  >
                    <SelectTrigger
                      className="
                      text-sm
                      rounded-none
                      border-0
                      border-b-2
                      bg-transparent
                      px-0
                      py-0
                      shadow-none
                      focus:ring-0
                      focus:ring-offset-0
                      border-muted-foreground/30
                      focus:border-b-4
                      focus:border-pink-500
                      transition-all duration-200
                    "
                    >
                      <SelectValue placeholder="Seleziona un album" />
                    </SelectTrigger>
                    <SelectContent>
                      {albums.map((album) => (
                        <SelectItem key={album.id} value={album.id}>
                          {album.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <div className="text-sm text-muted-foreground capitalize pt-2">
                    {formData.tipo}
                  </div>
                </div>
              </div>

              {formData.albumId && (
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">
                        Figurine nel pacchetto
                      </CardTitle>
                      <Button onClick={() => setPickOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Inserisci figurina
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {figurineNelPacchetto.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        Nessuna figurina aggiunta. Seleziona le figurine
                        dall&apos;album.
                      </p>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-16">Ordine</TableHead>
                            <TableHead className="w-20">Preview</TableHead>
                            <TableHead>Nome</TableHead>
                            {formData.tipo === "dinamico" && (
                              <TableHead className="w-32">
                                Frequenza %
                              </TableHead>
                            )}
                            <TableHead className="text-right">Azioni</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {figurineNelPacchetto.map((pf, index) => (
                            <TableRow key={pf.figurinaId}>
                              <TableCell>
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
                                  cursor-pointer
                                "
                                  value={index}
                                  onChange={(e) =>
                                    setFigurinaPosition(
                                      pf.figurinaId,
                                      Number(e.target.value),
                                    )
                                  }
                                >
                                  {figurineNelPacchetto.map((_, i) => (
                                    <option key={i} value={i}>
                                      {i + 1}
                                    </option>
                                  ))}
                                </select>
                              </TableCell>

                              <TableCell>
                                {pf.figurina?.link && (
                                  <img
                                    src={pf.figurina.link}
                                    alt={pf.figurina?.nome}
                                    className="w-12 h-12 object-cover rounded"
                                  />
                                )}
                              </TableCell>

                              <TableCell>{pf.figurina?.nome}</TableCell>

                              {formData.tipo === "dinamico" && (
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <Input
                                      type="number"
                                      min={0}
                                      max={100}
                                      value={pf.frequenza ?? 0}
                                      onChange={(e) =>
                                        handleFrequenzaChange(
                                          pf.figurinaId,
                                          Math.min(
                                            100,
                                            Math.max(
                                              0,
                                              parseInt(e.target.value) || 0,
                                            ),
                                          ),
                                        )
                                      }
                                      className="w-20 h-8 text-center"
                                    />
                                    <span className="text-sm text-muted-foreground">
                                      %
                                    </span>
                                  </div>
                                </TableCell>
                              )}

                              <TableCell className="text-right">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() =>
                                    handleRemoveFigurina(pf.figurinaId)
                                  }
                                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}

                    {formData.tipo === "dinamico" &&
                      figurineNelPacchetto.length > 0 && (
                        <div
                          className={`mt-4 p-3 rounded-lg border ${
                            totalFrequenza === 100
                              ? "bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800"
                              : "bg-destructive/10 border-destructive/30"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">
                              Somma frequenze:
                            </span>
                            <span
                              className={`text-lg font-bold ${
                                totalFrequenza === 100
                                  ? "text-green-600 dark:text-green-400"
                                  : "text-destructive"
                              }`}
                            >
                              {totalFrequenza}%
                            </span>
                          </div>
                          {totalFrequenza !== 100 && (
                            <p className="text-xs text-destructive mt-1">
                              La somma deve essere esattamente 100%
                            </p>
                          )}
                        </div>
                      )}
                  </CardContent>
                </Card>
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Syndication Album</CardTitle>
          </CardHeader>
          <CardContent>
            <SyndicationSection
              syndication={formData.syndication}
              onChange={(syndication) =>
                setFormData((prev) => ({ ...prev, syndication }))
              }
            />
          </CardContent>
        </Card>
        <div className="flex justify-end gap-4 pt-2">
          <Button variant="outline" onClick={() => navigate("/pacchetti")}>
            Annulla
          </Button>
          <Button onClick={handleSave}>
            {isNew ? "Crea Pacchetto" : "Salva Modifiche"}
          </Button>
        </div>
      </div>

      {/* Dialog picker per figurine */}
      <Dialog open={pickOpen} onOpenChange={setPickOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Seleziona figurine</DialogTitle>
            <DialogDescription>
              Clicca su una figurina per aggiungerla o rimuoverla dal pacchetto
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center gap-2 py-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cerca figurina..."
              value={pickQuery}
              onChange={(e) => setPickQuery(e.target.value)}
              className="flex-1"
            />
          </div>

          <div className="flex-1 overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"></TableHead>
                  <TableHead className="w-16">Preview</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Tipo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {figurineAlbum.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center text-muted-foreground py-8"
                    >
                      Nessuna figurina disponibile in questo album
                    </TableCell>
                  </TableRow>
                ) : figurineDisponibiliPicker.length === 0 && pickQuery ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center text-muted-foreground py-8"
                    >
                      Nessun risultato per "{pickQuery}"
                    </TableCell>
                  </TableRow>
                ) : (
                  figurineAlbum.map((fig) => {
                    const isSelected = formData.figurineSelezionate.some(
                      (f) => f.figurinaId === fig.id,
                    );
                    const matchesQuery =
                      !pickQuery ||
                      fig.nome.toLowerCase().includes(pickQuery.toLowerCase());

                    if (!matchesQuery) return null;

                    return (
                      <TableRow
                        key={fig.id}
                        className="cursor-pointer hover:bg-accent"
                        onClick={() => handleToggleFigurina(fig.id)}
                      >
                        <TableCell>
                          {isSelected && (
                            <Check className="h-4 w-4 text-primary" />
                          )}
                        </TableCell>
                        <TableCell>
                          {fig.link ? (
                            <img
                              src={fig.link}
                              alt={fig.nome}
                              className="w-10 h-10 object-cover rounded"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-muted rounded flex items-center justify-center">
                              <span className="text-xs text-muted-foreground">
                                —
                              </span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell className={isSelected ? "font-medium" : ""}>
                          {fig.nome}
                        </TableCell>
                        <TableCell>{fig.tipo}</TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
