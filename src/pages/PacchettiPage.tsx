import { useState } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useToast } from "@/hooks/use-toast";

interface Pacchetto {
  id: string;
  nome: string;
  numFigurine: number;
  tipo: "Statico" | "Dinamico";
}

export default function PacchettiPage() {
  const [pacchetti, setPacchetti] = useLocalStorage<Pacchetto[]>("pacchetti", []);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<"Statico" | "Dinamico">("Statico");
  const [editingPacchetto, setEditingPacchetto] = useState<Pacchetto | null>(null);
  const [formData, setFormData] = useState({ nome: "", numFigurine: 1 });
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const filteredPacchetti = pacchetti.filter((p) =>
    p.nome.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openCreateDialog = (tipo: "Statico" | "Dinamico") => {
    setDialogType(tipo);
    setEditingPacchetto(null);
    setFormData({ nome: "", numFigurine: 1 });
    setIsDialogOpen(true);
  };

  const openEditDialog = (pacchetto: Pacchetto) => {
    setEditingPacchetto(pacchetto);
    setDialogType(pacchetto.tipo);
    setFormData({ nome: pacchetto.nome, numFigurine: pacchetto.numFigurine });
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.nome.trim()) {
      toast({
        title: "Errore",
        description: "Inserisci un nome per il pacchetto",
        variant: "destructive",
      });
      return;
    }

    if (editingPacchetto) {
      setPacchetti(pacchetti.map(p => 
        p.id === editingPacchetto.id 
          ? { ...p, nome: formData.nome, numFigurine: formData.numFigurine }
          : p
      ));
      toast({
        title: "Pacchetto modificato",
        description: `Il pacchetto "${formData.nome}" è stato aggiornato`,
      });
    } else {
      const newPacchetto: Pacchetto = {
        id: crypto.randomUUID(),
        nome: formData.nome,
        numFigurine: formData.numFigurine,
        tipo: dialogType,
      };
      setPacchetti([...pacchetti, newPacchetto]);
      toast({
        title: "Pacchetto creato",
        description: `Il pacchetto "${formData.nome}" è stato creato`,
      });
    }

    setIsDialogOpen(false);
    setFormData({ nome: "", numFigurine: 1 });
  };

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
      
      <div className="flex-1 p-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Creazione Pacchetti</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Button 
                variant="outline" 
                onClick={() => openCreateDialog("Statico")}
                className="border-2"
              >
                Crea pacchetto statico
              </Button>
              <Button 
                variant="outline" 
                onClick={() => openCreateDialog("Dinamico")}
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
                  <TableHead className="text-right">Azioni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPacchetti.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                      Nessun pacchetto trovato. Crea il tuo primo pacchetto!
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPacchetti.map((pacchetto) => (
                    <TableRow key={pacchetto.id}>
                      <TableCell className="font-medium">{pacchetto.nome}</TableCell>
                      <TableCell>{pacchetto.numFigurine}</TableCell>
                      <TableCell>{pacchetto.tipo}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDialog(pacchetto)}
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

      {/* Dialog per creare/modificare pacchetto */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingPacchetto ? "Modifica Pacchetto" : `Crea Pacchetto ${dialogType}`}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
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
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Annulla
            </Button>
            <Button onClick={handleSubmit}>
              {editingPacchetto ? "Salva" : "Crea"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog di conferma eliminazione */}
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
