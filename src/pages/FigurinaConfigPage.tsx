import { useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
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
import { Figurina, Album, DEFAULT_SYNDICATION, SyndicationPlatform } from "@/types";
import { SyndicationSection } from "@/components/SyndicationSection";

export default function FigurinaConfigPage() {
  const { figurinaId } = useParams<{ figurinaId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [figurine, setFigurine] = useLocalStorage<Figurina[]>("figurine", []);
  const [album] = useLocalStorage<Album[]>("album", []);

  const isNew = figurinaId === "new";
  const figurina = isNew ? null : figurine.find((f) => f.id === figurinaId);
  const preselectedAlbumId = searchParams.get("albumId");

  const [formData, setFormData] = useState({
    nome: figurina?.nome || "",
    tipo: (figurina?.tipo || "Standard") as "Standard" | "Speciale",
    frequenza: figurina?.frequenza || 5,
    albumId: figurina?.albumId || preselectedAlbumId || "",
    syndication: figurina?.syndication || [...DEFAULT_SYNDICATION] as SyndicationPlatform[],
  });

  const getNextNumero = (albumId: string) => {
    const albumFigurine = figurine.filter((f) => f.albumId === albumId);
    const numeri = albumFigurine.map((f) => f.numero);
    if (numeri.length === 0) return 1;
    return Math.max(...numeri) + 1;
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

    if (!formData.albumId) {
      toast({
        title: "Errore",
        description: "Seleziona un album",
        variant: "destructive",
      });
      return;
    }

    // Determine where to navigate back
    const returnUrl = preselectedAlbumId ? `/album/${preselectedAlbumId}` : "/figurine";

    if (isNew) {
      console.log("ISNEW")
      const newFigurina: Figurina = {
        id: crypto.randomUUID(),
        nome: formData.nome.trim(),
        numero: getNextNumero(formData.albumId),
        tipo: formData.tipo,
        frequenza: formData.frequenza,
        albumId: formData.albumId,
        syndication: formData.syndication,
        createdAt: new Date(),
      };

      setFigurine([...figurine, newFigurina]);
      toast({
        title: "Figurina creata",
        description: `La figurina "${formData.nome}" è stata creata`,
      });
    } else {
      setFigurine(figurine.map(f =>
        f.id === figurinaId
          ? {
            ...f,
            nome: formData.nome.trim(),
            tipo: formData.tipo,
            frequenza: formData.frequenza,
            albumId: formData.albumId,
            syndication: formData.syndication
          }
          : f
      ));
      toast({
        title: "Figurina salvata",
        description: `La figurina "${formData.nome}" è stata aggiornata`,
      });
    }
    setTimeout(() => {
      navigate(returnUrl);
    }, 1000);

  };

  const handleCancel = () => {
    const returnUrl = preselectedAlbumId ? `/album/${preselectedAlbumId}` : "/figurine";
    navigate(returnUrl);
  };

  if (!isNew && !figurina) {
    return (
      <>
        <AppHeader title="Configurazione Figurina" breadcrumb="Figurine > Configurazione" />
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
      <PageHeader title={isNew ? "Nuova Figurina" : `Configurazione: ${figurina?.nome}`} />

      <div className="flex-1 p-6 space-y-6 overflow-auto">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={handleCancel}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {preselectedAlbumId ? "Torna all'Album" : "Torna alle Figurine"}
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
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    placeholder="Nome figurina"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="album">Album</Label>
                  <Select
                    value={formData.albumId}
                    onValueChange={(value) => setFormData({ ...formData, albumId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona album" />
                    </SelectTrigger>
                    <SelectContent>
                      {album.length === 0 ? (
                        <SelectItem value="none" disabled>
                          Nessun album disponibile
                        </SelectItem>
                      ) : (
                        album.map((a) => (
                          <SelectItem key={a.id} value={a.id}>
                            {a.nome}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
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
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Standard">Standard</SelectItem>
                      <SelectItem value="Speciale">Speciale</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="frequenza">Frequenza (X/10)</Label>
                  <Input
                    id="frequenza"
                    type="number"
                    min={1}
                    max={10}
                    value={formData.frequenza}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        frequenza: Math.min(10, Math.max(1, parseInt(e.target.value) || 1)),
                      })
                    }
                    placeholder="Frequenza"
                  />
                  <p className="text-xs text-muted-foreground">
                    Indica quante volte su 10 questa figurina può uscire
                  </p>
                </div>
              </div>

              <SyndicationSection
                syndication={formData.syndication}
                onChange={(syndication) => setFormData({ ...formData, syndication })}
              />

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
