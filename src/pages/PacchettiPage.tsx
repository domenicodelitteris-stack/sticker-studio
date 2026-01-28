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
  const [pacchetti, setPacchetti] = useLocalStorage<Pacchetto[]>(
    "pacchetti",
    [],
  );
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const filteredPacchetti = pacchetti.filter((p) =>
    p.nome.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleDelete = () => {
    if (deleteId) {
      const pacchetto = pacchetti.find((p) => p.id === deleteId);
      setPacchetti(pacchetti.filter((p) => p.id !== deleteId));
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
          <CardHeader className="space-y-3">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <CardTitle>Pacchetti</CardTitle>

              <div className="flex gap-2 flex-wrap">
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
            </div>

            <div className="flex gap-3 flex-wrap">
              <div className="flex-1 min-w-[220px]">
                <Input
                  placeholder="Cerca pacchetti..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button variant="default" size="icon" aria-label="Cerca">
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent>
            <div className="mb-3 text-sm text-muted-foreground">
              Contenuti ({filteredPacchetti.length} elementi)
            </div>

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
                    <TableCell
                      colSpan={5}
                      className="text-center text-muted-foreground py-8"
                    >
                      Nessun pacchetto trovato. Crea il tuo primo pacchetto!
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPacchetti.map((pacchetto) => (
                    <TableRow key={pacchetto.id}>
                      <TableCell className="font-medium">
                        {pacchetto.nome}
                      </TableCell>
                      <TableCell>{pacchetto.numFigurine}</TableCell>
                      <TableCell className="capitalize">
                        {pacchetto.tipo}
                      </TableCell>
                      <TableCell>
                        <SyndicationStatusIcons
                          syndication={
                            pacchetto.syndication || DEFAULT_SYNDICATION
                          }
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              navigate(`/pacchetti/${pacchetto.id}`)
                            }
                            aria-label="Modifica"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteId(pacchetto.id)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            aria-label="Elimina"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleGenerateQR(pacchetto)}
                            aria-label="Genera QR"
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
              Sei sicuro di voler eliminare questo pacchetto? Questa azione non
              può essere annullata.
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
