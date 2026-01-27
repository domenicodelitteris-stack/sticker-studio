import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Plus, Trash2, Pencil, ArrowLeft } from "lucide-react";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Figurina, Album, DEFAULT_SYNDICATION, SyndicationPlatform } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SyndicationSection } from "@/components/SyndicationSection";
import { SyndicationStatusIcons } from "@/components/SyndicationStatusIcons";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function AlbumConfigPage() {
  const { albumId } = useParams<{ albumId: string }>();
  const navigate = useNavigate();
  const [albums] = useLocalStorage<Album[]>("album", []);
  const [figurine, setFigurine] = useLocalStorage<Figurina[]>("figurine", []);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingFigurina, setEditingFigurina] = useState<Figurina | null>(null);
  const [newFigurina, setNewFigurina] = useState({
    nome: "",
    tipo: "Standard" as "Standard" | "Speciale",
    frequenza: 5,
    syndication: [...DEFAULT_SYNDICATION] as SyndicationPlatform[],
  });

  const album = albums.find((a) => a.id === albumId);
  const albumFigurine = figurine.filter((f) => f.albumId === albumId);

  // Calcola il prossimo numero disponibile
  const getNextNumero = () => {
    const numeri = albumFigurine.map((f) => f.numero);
    if (numeri.length === 0) return 1;
    return Math.max(...numeri) + 1;
  };

  const handleAdd = () => {
    if (!newFigurina.nome.trim() || !albumId) return;

    const figurina: Figurina = {
      id: crypto.randomUUID(),
      nome: newFigurina.nome.trim(),
      numero: getNextNumero(),
      tipo: newFigurina.tipo,
      frequenza: newFigurina.frequenza,
      albumId: albumId,
      syndication: newFigurina.syndication,
      createdAt: new Date(),
    };

    setFigurine([...figurine, figurina]);
    setNewFigurina({ nome: "", tipo: "Standard", frequenza: 5, syndication: [...DEFAULT_SYNDICATION] });
    setIsDialogOpen(false);
  };

  const handleEdit = () => {
    if (!editingFigurina || !newFigurina.nome.trim()) return;

    setFigurine(
      figurine.map((f) =>
        f.id === editingFigurina.id
          ? {
              ...f,
              nome: newFigurina.nome.trim(),
              tipo: newFigurina.tipo,
              frequenza: newFigurina.frequenza,
              syndication: newFigurina.syndication,
            }
          : f
      )
    );
    setEditingFigurina(null);
    setNewFigurina({ nome: "", tipo: "Standard", frequenza: 5, syndication: [...DEFAULT_SYNDICATION] });
    setIsDialogOpen(false);
  };

  const handleDelete = () => {
    if (!deleteId) return;
    setFigurine(figurine.filter((f) => f.id !== deleteId));
    setDeleteId(null);
  };

  const openEditDialog = (figurina: Figurina) => {
    setEditingFigurina(figurina);
    setNewFigurina({
      nome: figurina.nome,
      tipo: figurina.tipo,
      frequenza: figurina.frequenza,
      syndication: figurina.syndication || [...DEFAULT_SYNDICATION],
    });
    setIsDialogOpen(true);
  };

  const openAddDialog = () => {
    setEditingFigurina(null);
    setNewFigurina({ nome: "", tipo: "Standard", frequenza: 5, syndication: [...DEFAULT_SYNDICATION] });
    setIsDialogOpen(true);
  };

  if (!album) {
    return (
      <>
        <AppHeader title="Configurazione Album" breadcrumb="Album > Configurazione" />
        <PageHeader title="Album non trovato" />
        <div className="flex-1 p-6">
          <Button onClick={() => navigate("/album")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Torna agli Album
          </Button>
        </div>
      </>
    );
  }

  return (
    <>
      <AppHeader title="Configurazione Album" breadcrumb={`Album > ${album.nome}`} />
      <PageHeader title={`Configurazione: ${album.nome}`} />

      <div className="flex-1 p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate("/album")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Torna agli Album
          </Button>
        </div>

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Figurine ({albumFigurine.length} elementi)</CardTitle>
            <Button onClick={openAddDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Inserisci figurina
            </Button>
          </CardHeader>
          <CardContent>
            {/* Griglia visiva delle figurine */}
            <div className="grid grid-cols-5 gap-4 mb-6">
              {albumFigurine.map((figurina) => (
                <div
                  key={figurina.id}
                  className="aspect-[3/4] border-2 border-yellow-500 rounded-lg flex items-center justify-center bg-card hover:bg-accent/50 transition-colors cursor-pointer"
                  onClick={() => openEditDialog(figurina)}
                >
                  <div className="text-center p-2">
                    <div className="font-bold text-lg">{figurina.numero}</div>
                    <div className="text-xs text-muted-foreground truncate">{figurina.nome}</div>
                  </div>
                </div>
              ))}
              {albumFigurine.length === 0 && (
                <div className="col-span-5 text-center text-muted-foreground py-8">
                  Nessuna figurina inserita. Clicca "Inserisci figurina" per iniziare.
                </div>
              )}
            </div>

            {/* Tabella dettagliata */}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Frequenza</TableHead>
                  <TableHead>Syndication</TableHead>
                  <TableHead className="text-right">Azioni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {albumFigurine.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      Nessuna figurina trovata
                    </TableCell>
                  </TableRow>
                ) : (
                  albumFigurine.map((figurina) => (
                    <TableRow key={figurina.id}>
                      <TableCell className="font-medium">{figurina.numero}</TableCell>
                      <TableCell>{figurina.nome}</TableCell>
                      <TableCell>{figurina.tipo}</TableCell>
                      <TableCell>{figurina.frequenza}/10</TableCell>
                      <TableCell>
                        <SyndicationStatusIcons syndication={figurina.syndication || DEFAULT_SYNDICATION} />
                      </TableCell>
                      <TableCell className="text-right space-x-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(figurina)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteId(figurina.id)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingFigurina ? "Modifica Figurina" : "Inserisci Figurina"}
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <div className="space-y-4 py-4 pr-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome</Label>
                <Input
                  id="nome"
                  value={newFigurina.nome}
                  onChange={(e) => setNewFigurina({ ...newFigurina, nome: e.target.value })}
                  placeholder="Nome figurina"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo</Label>
                <Select
                  value={newFigurina.tipo}
                  onValueChange={(value: "Standard" | "Speciale") =>
                    setNewFigurina({ ...newFigurina, tipo: value })
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
                  value={newFigurina.frequenza}
                  onChange={(e) =>
                    setNewFigurina({
                      ...newFigurina,
                      frequenza: Math.min(10, Math.max(1, parseInt(e.target.value) || 1)),
                    })
                  }
                  placeholder="Frequenza"
                />
                <p className="text-xs text-muted-foreground">
                  Indica quante volte su 10 questa figurina può uscire
                </p>
              </div>

              <SyndicationSection
                syndication={newFigurina.syndication}
                onChange={(syndication) => setNewFigurina({ ...newFigurina, syndication })}
              />
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Annulla
            </Button>
            <Button
              onClick={editingFigurina ? handleEdit : handleAdd}
              disabled={!newFigurina.nome.trim()}
            >
              {editingFigurina ? "Salva" : "Inserisci"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Conferma eliminazione</AlertDialogTitle>
            <AlertDialogDescription>
              Sei sicuro di voler eliminare questa figurina? Questa azione non può essere annullata.
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
