import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { AppHeader } from "@/components/layout/AppHeader";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useToast } from "@/hooks/use-toast";
import { Pacchetto, DEFAULT_SYNDICATION, SyndicationPlatform } from "@/types";
import { SyndicationSection } from "@/components/SyndicationSection";

export default function PacchettoConfigPage() {
  const { pacchettoId } = useParams<{ pacchettoId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [pacchetti, setPacchetti] = useLocalStorage<Pacchetto[]>("pacchetti", []);
  
  const pacchetto = pacchetti.find((p) => p.id === pacchettoId);
  
  const [formData, setFormData] = useState({
    nome: pacchetto?.nome || "",
    numFigurine: pacchetto?.numFigurine || 1,
    syndication: pacchetto?.syndication || [...DEFAULT_SYNDICATION] as SyndicationPlatform[],
  });

  const handleSave = () => {
    if (!formData.nome.trim()) {
      toast({
        title: "Errore",
        description: "Inserisci un nome per il pacchetto",
        variant: "destructive",
      });
      return;
    }

    setPacchetti(pacchetti.map(p => 
      p.id === pacchettoId 
        ? { ...p, nome: formData.nome, numFigurine: formData.numFigurine, syndication: formData.syndication }
        : p
    ));
    
    toast({
      title: "Pacchetto salvato",
      description: `Il pacchetto "${formData.nome}" è stato aggiornato`,
    });
    
    navigate("/pacchetti");
  };

  if (!pacchetto) {
    return (
      <>
        <AppHeader title="Configurazione Pacchetto" breadcrumb="Pacchetti > Configurazione" />
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

  return (
    <>
      <AppHeader title="Configurazione Pacchetto" breadcrumb={`Pacchetti > ${pacchetto.nome}`} />
      <PageHeader title={`Configurazione: ${pacchetto.nome}`} />

      <div className="flex-1 p-6 space-y-6">
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
            <ScrollArea className="max-h-[60vh]">
              <div className="space-y-6 pr-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nome">Nome</Label>
                    <Input
                      id="nome"
                      value={formData.nome}
                      onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                      placeholder="Inserisci nome pacchetto"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="numFigurine">Numero figurine</Label>
                    <Input
                      id="numFigurine"
                      type="number"
                      min={1}
                      value={formData.numFigurine}
                      onChange={(e) => setFormData({ ...formData, numFigurine: parseInt(e.target.value) || 1 })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <div className="text-sm text-muted-foreground capitalize">{pacchetto.tipo}</div>
                </div>

                <SyndicationSection
                  syndication={formData.syndication}
                  onChange={(syndication) => setFormData({ ...formData, syndication })}
                />

                <div className="flex justify-end gap-4 pt-4">
                  <Button variant="outline" onClick={() => navigate("/pacchetti")}>
                    Annulla
                  </Button>
                  <Button onClick={handleSave}>
                    Salva Modifiche
                  </Button>
                </div>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
