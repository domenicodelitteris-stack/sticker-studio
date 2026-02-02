import { useState, useMemo } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Plus, Trash2, ArrowUp, ArrowDown, Search, Check } from "lucide-react";
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
import { Pacchetto, Album, Pagina, Figurina, DEFAULT_SYNDICATION, SyndicationPlatform, PacchettoFigurina } from "@/types";
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
    figurineSelezionate: pacchetto?.figurine || [] as PacchettoFigurina[],
  });

  // Get pages for the selected album
  const pagineAlbum = useMemo(() => {
    if (!formData.albumId) return [];
    return pagine.filter((p) => p.albumId === formData.albumId);
  }, [formData.albumId, pagine]);

  // Get figurines for the selected album (through pages)
  const figurineAlbum = useMemo(() => {
    const paginaIds = pagineAlbum.map((p) => p.id);
    return figurine.filter((f) => paginaIds.includes(f.paginaId));
  }, [pagineAlbum, figurine]);

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
      (f) => f.figurinaId === figurinaId
    );

    if (isSelected) {
      const updated = formData.figurineSelezionate.filter(
        (f) => f.figurinaId !== figurinaId
      );
      setFormData({
        ...formData,
        figurineSelezionate: updated,
        numFigurine: updated.length,
      });
      toast({
        title: "Figurina rimossa",
        description: "La figurina è stata rimossa dal pacchetto",
      });
    } else {
      const maxOrdine = formData.figurineSelezionate.reduce(
        (max, f) => Math.max(max, f.ordine),
        0
      );
      setFormData({
        ...formData,
        figurineSelezionate: [
          ...formData.figurineSelezionate,
          { figurinaId, ordine: maxOrdine + 1 },
        ],
        numFigurine: formData.figurineSelezionate.length + 1,
      });
      toast({
        title: "Figurina aggiunta",
        description: "La figurina è stata aggiunta al pacchetto",
      });
    }
  };

  // Get full figurina data for selected figurines
  const figurineNelPacchetto = useMemo(() => {
    return formData.figurineSelezionate
      .sort((a, b) => a.ordine - b.ordine)
      .map((pf) => ({
        ...pf,
        figurina: figurine.find((f) => f.id === pf.figurinaId),
      }));
  }, [formData.figurineSelezionate, figurine]);

  const handleAddFigurina = (figurinaId: string) => {
    const maxOrdine = formData.figurineSelezionate.reduce(
      (max, f) => Math.max(max, f.ordine),
      0
    );
    setFormData({
      ...formData,
      figurineSelezionate: [
        ...formData.figurineSelezionate,
        { figurinaId, ordine: maxOrdine + 1 },
      ],
      numFigurine: formData.figurineSelezionate.length + 1,
    });
  };

  const handleRemoveFigurina = (figurinaId: string) => {
    const updated = formData.figurineSelezionate.filter(
      (f) => f.figurinaId !== figurinaId
    );
    setFormData({
      ...formData,
      figurineSelezionate: updated,
      numFigurine: updated.length,
    });
  };

  const handleMoveFigurina = (figurinaId: string, direction: "up" | "down") => {
    const sorted = [...formData.figurineSelezionate].sort(
      (a, b) => a.ordine - b.ordine
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

    if (isNew) {
      const newPacchetto: Pacchetto = {
        id: crypto.randomUUID(),
        nome: formData.nome,
        numFigurine: formData.figurineSelezionate.length || formData.numFigurine,
        tipo: formData.tipo,
        syndication: formData.syndication,
        createdAt: new Date(),
        albumId: formData.tipo === "statico" ? formData.albumId : undefined,
        figurine: formData.tipo === "statico" ? formData.figurineSelezionate : undefined,
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
                numFigurine: formData.figurineSelezionate.length || formData.numFigurine,
                syndication: formData.syndication,
                albumId: formData.tipo === "statico" ? formData.albumId : undefined,
                figurine: formData.tipo === "statico" ? formData.figurineSelezionate : undefined,
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
                    value={formData.numFigurine}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        numFigurine: parseInt(e.target.value) || 1,
                      })
                    }
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
              </div>

              <div className="space-y-2">
                <Label>Tipo</Label>
                <div className="text-sm text-muted-foreground capitalize">
                  {formData.tipo}
                </div>
              </div>

              {formData.tipo === "statico" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="album">Album</Label>
                    <Select
                      value={formData.albumId}
                      onValueChange={handleAlbumChange}
                    >
                      <SelectTrigger
                        className="
                          rounded-none
                          border-0
                          border-b-2
                          bg-transparent
                          px-0
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

                  {formData.albumId && (
                    <Card>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">Figurine nel pacchetto</CardTitle>
                          {figurineDisponibili.length > 0 && (
                            <Select onValueChange={handleAddFigurina}>
                              <SelectTrigger className="w-[200px]">
                                <SelectValue placeholder="Aggiungi figurina" />
                              </SelectTrigger>
                              <SelectContent>
                                {figurineDisponibili.map((fig) => (
                                  <SelectItem key={fig.id} value={fig.id}>
                                    {fig.nome}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        {figurineNelPacchetto.length === 0 ? (
                          <p className="text-sm text-muted-foreground text-center py-4">
                            Nessuna figurina aggiunta. Seleziona le figurine dall'album.
                          </p>
                        ) : (
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="w-16">Ordine</TableHead>
                                <TableHead className="w-20">Preview</TableHead>
                                <TableHead>Nome</TableHead>
                                <TableHead className="text-right">Azioni</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {figurineNelPacchetto.map((pf, index) => (
                                <TableRow key={pf.figurinaId}>
                                  <TableCell>
                                    <div className="flex items-center gap-1">
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6"
                                        onClick={() =>
                                          handleMoveFigurina(pf.figurinaId, "up")
                                        }
                                        disabled={index === 0}
                                      >
                                        <ArrowUp className="h-3 w-3" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6"
                                        onClick={() =>
                                          handleMoveFigurina(pf.figurinaId, "down")
                                        }
                                        disabled={
                                          index === figurineNelPacchetto.length - 1
                                        }
                                      >
                                        <ArrowDown className="h-3 w-3" />
                                      </Button>
                                    </div>
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
                      </CardContent>
                    </Card>
                  )}
                </>
              )}

              <SyndicationSection
                syndication={formData.syndication}
                onChange={(syndication) =>
                  setFormData({ ...formData, syndication })
                }
              />

              <div className="flex justify-end gap-4 pt-4">
                <Button
                  variant="outline"
                  onClick={() => navigate("/pacchetti")}
                >
                  Annulla
                </Button>
                <Button onClick={handleSave}>
                  {isNew ? "Crea Pacchetto" : "Salva Modifiche"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
