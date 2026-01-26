import { useState } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pencil, Trash2, QrCode } from "lucide-react";
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
  const { toast } = useToast();

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
    <div className="flex-1 flex flex-col">
      <PageHeader title="Gestione Pacchetti" />
      
      <div className="p-6 flex-1">
        <div className="flex gap-4 mb-6">
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

        <div className="bg-card rounded-lg border">
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
              {pacchetti.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                    Nessun pacchetto presente. Crea il tuo primo pacchetto!
                  </TableCell>
                </TableRow>
              ) : (
                pacchetti.map((pacchetto) => (
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
        </div>
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
    </div>
  );
}
