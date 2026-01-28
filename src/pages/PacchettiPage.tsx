import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Pencil, Trash2, QrCode, Search } from "lucide-react";
import { AppHeader } from "@/components/layout/AppHeader";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useToast } from "@/hooks/use-toast";
import { Pacchetto, DEFAULT_SYNDICATION } from "@/types";
import { SyndicationStatusIcons } from "@/components/SyndicationStatusIcons";

export default function PacchettiPage() {
  const navigate = useNavigate();
  const [pacchetti, setPacchetti] = useLocalStorage<Pacchetto[]>("pacchetti", []);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const filteredPacchetti = pacchetti.filter((p) =>
    p.nome.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = () => {
    if (deleteId) {
      const pacchetto = pacchetti.find(p => p.id === deleteId);
      setPacchetti(pacchetti.filter(p => p.id !== deleteId));
      toast({
        title: "Pacchetto eliminato",
        description: `Il pacchetto "${pacchetto?.nome}" è stato eliminato`,
      });
      setDeleteId(null);
    }
  };

  const handleGenerateQR = (pacchetto: Pacchetto) => {
    toast({
      title: "QR Code",
      description: `Generazione QR per "${pacchetto.nome}" (funzionalità da implementare)`,
    });
  };

  return (
    <>
      <AppHeader title="Gestione Pacchetti" breadcrumb="Pacchetti" />
      <PageHeader title="Pacchetti" />
      
      <div className="flex-1 p-6 space-y-6 overflow-auto">
        <Card>
          <CardHeader>
            <CardTitle>Creazione Pacchetti</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Button 
                variant="outline" 
                onClick={() => navigate("/pacchetti/new?tipo=statico")}
                className="border-2"
              >
                Crea pacchetto statico
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate("/pacchetti/new?tipo=dinamico")}
                className="border-2"
              >
                Crea pacchetto dinamico
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Archivio Pacchetti</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Cerca pacchetti..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button variant="default" size="icon">
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contenuti ({filteredPacchetti.length} elementi)</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>N° figurine</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Syndication</TableHead>
                  <TableHead className="text-right">Azioni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPacchetti.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      Nessun pacchetto trovato. Crea il tuo primo pacchetto!
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPacchetti.map((pacchetto) => (
                    <TableRow key={pacchetto.id}>
                      <TableCell className="font-medium">{pacchetto.nome}</TableCell>
                      <TableCell>{pacchetto.numFigurine}</TableCell>
                      <TableCell className="capitalize">{pacchetto.tipo}</TableCell>
                      <TableCell>
                        <SyndicationStatusIcons syndication={pacchetto.syndication || DEFAULT_SYNDICATION} />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate(`/pacchetti/${pacchetto.id}`)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteId(pacchetto.id)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleGenerateQR(pacchetto)}
                          >
                            <QrCode className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Conferma eliminazione</AlertDialogTitle>
            <AlertDialogDescription>
              Sei sicuro di voler eliminare questo pacchetto? Questa azione non può essere annullata.
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
