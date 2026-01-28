import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { AppHeader } from "@/components/layout/AppHeader";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Album, DEFAULT_SYNDICATION, SyndicationPlatform } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { SyndicationSection } from "@/components/SyndicationSection";

export default function AlbumCreatePage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [album, setAlbum] = useLocalStorage<Album[]>("album", []);

  const [formData, setFormData] = useState({
    nome: "",
    anno: new Date().getFullYear(),
    syndication: [...DEFAULT_SYNDICATION] as SyndicationPlatform[],
  });

  const handleSave = () => {
    if (!formData.nome.trim()) {
      toast({
        title: "Errore",
        description: "Inserisci un nome per l'album",
        variant: "destructive",
      });
      return;
    }

    const albumItem: Album = {
      id: crypto.randomUUID(),
      nome: formData.nome.trim(),
      anno: formData.anno,
      syndication: formData.syndication,
      createdAt: new Date(),
    };

    setAlbum((prev) => [...prev, albumItem]);

    toast({
      title: "Album creato",
      description: `L'album "${albumItem.nome}" è stato creato`,
    });

    setTimeout(() => {
      navigate("/album");
    }, 1000);
  };

  return (
    <>
      <AppHeader title="Nuovo Album" breadcrumb="Album > Nuovo" />
      <PageHeader title="Nuovo Album" />

      <div className="flex-1 p-6 space-y-6 overflow-auto">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate("/album")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Torna agli Album
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Dettagli Album</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) =>
                    setFormData({ ...formData, nome: e.target.value })
                  }
                  placeholder="Nome album"
                />
              </div>

              {/* <div className="space-y-2">
                <Label htmlFor="anno">Anno</Label>
                <Input
                  id="anno"
                  type="number"
                  value={formData.anno}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      anno:
                        parseInt(e.target.value) || new Date().getFullYear(),
                    })
                  }
                  placeholder="Anno"
                />
              </div> */}

              <SyndicationSection
                syndication={formData.syndication}
                onChange={(syndication) =>
                  setFormData({ ...formData, syndication })
                }
              />
              <div className="flex justify-end gap-4 pt-2">
                <Button variant="outline" onClick={() => navigate("/album")}>
                  Annulla
                </Button>
                <Button onClick={handleSave} disabled={!formData.nome.trim()}>
                  Crea Album
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
