import { useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, ImageIcon } from "lucide-react";
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
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useToast } from "@/hooks/use-toast";
import { Figurina, Pagina, Album } from "@/types";

export default function FigurinaConfigPage() {
  const { figurinaId } = useParams<{ figurinaId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [figurine, setFigurine] = useLocalStorage<Figurina[]>("figurine", []);
  const [pagine] = useLocalStorage<Pagina[]>("pagine", []);
  const [albums] = useLocalStorage<Album[]>("album", []);

  const isNew = figurinaId === "new";
  const figurina = isNew ? null : figurine.find((f) => f.id === figurinaId);
  const preselectedPaginaId = searchParams.get("paginaId");

  const [formData, setFormData] = useState({
    nome: figurina?.nome || "",
    tipo: (figurina?.tipo || "Standard") as "Standard" | "Speciale",
    link: figurina?.link || "",
    paginaId: figurina?.paginaId || preselectedPaginaId || "",
  });

  const selectedPagina = pagine.find((p) => p.id === formData.paginaId);
  const selectedAlbum = albums.find((a) => a.id === selectedPagina?.albumId);

  const getNextNumero = (paginaId: string) => {
    const paginaFigurine = figurine.filter((f) => f.paginaId === paginaId);
    const numeri = paginaFigurine.map((f) => f.numero);
    if (numeri.length === 0) return 1;
    return Math.max(...numeri) + 1;
  };

  const getNextOrdine = (paginaId: string) => {
    const paginaFigurine = figurine.filter((f) => f.paginaId === paginaId);
    if (paginaFigurine.length === 0) return 1;
    return Math.max(...paginaFigurine.map((f) => f.ordine || 0)) + 1;
  };

  const handleSave = () => {
    if (!formData.nome.trim()) {
      toast({
        title: "Errore",
        description: "Inserisci un nome per la figurina",
        variant: "destructive",
      });
      return;
    }

    if (!formData.paginaId) {
      toast({
        title: "Errore",
        description: "Seleziona una pagina",
        variant: "destructive",
      });
      return;
    }

    const returnUrl = preselectedPaginaId
      ? `/pagine/${preselectedPaginaId}`
      : "/figurine";

    if (isNew) {
      const newFigurina: Figurina = {
        id: crypto.randomUUID(),
        nome: formData.nome.trim(),
        numero: getNextNumero(formData.paginaId),
        tipo: formData.tipo,
        link: formData.link.trim(),
        paginaId: formData.paginaId,
        ordine: getNextOrdine(formData.paginaId),
        createdAt: new Date(),
      };

      setFigurine([...figurine, newFigurina]);
      toast({
        title: "Figurina creata",
        description: `La figurina "${formData.nome}" è stata creata`,
      });
    } else {
      setFigurine(
        figurine.map((f) =>
          f.id === figurinaId
            ? {
                ...f,
                nome: formData.nome.trim(),
                tipo: formData.tipo,
                link: formData.link.trim(),
                paginaId: formData.paginaId,
              }
            : f
        )
      );
      toast({
        title: "Figurina salvata",
        description: `La figurina "${formData.nome}" è stata aggiornata`,
      });
    }
    setTimeout(() => {
      navigate(returnUrl);
    }, 500);
  };

  const handleCancel = () => {
    const returnUrl = preselectedPaginaId
      ? `/pagine/${preselectedPaginaId}`
      : "/figurine";
    navigate(returnUrl);
  };

  if (!isNew && !figurina) {
    return (
      <>
        <AppHeader
          title="Configurazione Figurina"
          breadcrumb="Figurine > Configurazione"
        />
        <PageHeader title="Figurina non trovata" />
        <div className="flex-1 p-6">
          <Button onClick={() => navigate("/figurine")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Torna alle Figurine
          </Button>
        </div>
      </>
    );
  }

  return (
    <>
      <AppHeader
        title="Configurazione Figurina"
        breadcrumb={`Figurine > ${isNew ? "Nuova" : figurina?.nome}`}
      />
      <PageHeader
        title={isNew ? "Nuova Figurina" : `Configurazione: ${figurina?.nome}`}
      />

      <div className="flex-1 p-6 space-y-6 overflow-auto">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={handleCancel}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {preselectedPaginaId ? "Torna alla Pagina" : "Torna alle Figurine"}
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Dettagli Figurina</CardTitle>
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
                    placeholder="Nome figurina"
                    className="rounded-none border-0 border-b-2 bg-transparent px-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 border-muted-foreground/30 focus:border-b-4 focus:border-pink-500 transition-all duration-200"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pagina">Pagina</Label>
                  <Select
                    value={formData.paginaId}
                    onValueChange={(value) =>
                      setFormData({ ...formData, paginaId: value })
                    }
                  >
                    <SelectTrigger className="rounded-none border-0 border-b-2 border-muted-foreground/30 bg-transparent px-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 focus:ring-0 focus:ring-offset-0 focus:outline-none focus:border-b-4 focus:border-b-pink-500 transition-all duration-200">
                      <SelectValue placeholder="Seleziona pagina" />
                    </SelectTrigger>
                    <SelectContent>
                      {pagine.length === 0 ? (
                        <SelectItem value="none" disabled>
                          Nessuna pagina disponibile
                        </SelectItem>
                      ) : (
                        pagine.map((p) => {
                          const pAlbum = albums.find((a) => a.id === p.albumId);
                          return (
                            <SelectItem key={p.id} value={p.id}>
                              {pAlbum?.nome} - {p.nome}
                            </SelectItem>
                          );
                        })
                      )}
                    </SelectContent>
                  </Select>
                  {selectedPagina && selectedAlbum && (
                    <p className="text-xs text-muted-foreground">
                      Album: {selectedAlbum.nome}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tipo">Tipo</Label>
                  <Select
                    value={formData.tipo}
                    onValueChange={(value: "Standard" | "Speciale") =>
                      setFormData({ ...formData, tipo: value })
                    }
                  >
                    <SelectTrigger className="rounded-none border-0 border-b-2 border-muted-foreground/30 bg-transparent px-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 focus:ring-0 focus:ring-offset-0 focus:outline-none focus:border-b-4 focus:border-b-pink-500 transition-all duration-200">
                      <SelectValue placeholder="Seleziona tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Standard">Standard</SelectItem>
                      <SelectItem value="Speciale">Speciale</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="link">Link Immagine</Label>
                  <Input
                    id="link"
                    type="text"
                    value={formData.link}
                    onChange={(e) =>
                      setFormData({ ...formData, link: e.target.value })
                    }
                    className="rounded-none border-0 border-b-2 border-muted-foreground/30 bg-transparent px-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 focus:ring-0 focus:ring-offset-0 focus:outline-none focus:border-b-4 focus:border-b-pink-500 transition-all duration-200"
                    placeholder="https://esempio.com/immagine.jpg"
                  />
                </div>
              </div>

              {formData.link && (
                <div className="space-y-2">
                  <Label>Preview Immagine</Label>
                  <div className="border rounded-lg overflow-hidden w-32">
                    <img
                      src={formData.link}
                      alt="Preview figurina"
                      className="w-full aspect-[3/4] object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = "none";
                        target.nextElementSibling?.classList.remove("hidden");
                      }}
                    />
                    <div className="hidden w-full aspect-[3/4] bg-muted flex items-center justify-center">
                      <ImageIcon className="h-8 w-8 text-muted-foreground" />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-4 pt-4">
                <Button variant="outline" onClick={handleCancel}>
                  Annulla
                </Button>
                <Button onClick={handleSave}>
                  {isNew ? "Crea Figurina" : "Salva Modifiche"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
