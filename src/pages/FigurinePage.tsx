import { useState } from "react";
import { Plus, Trash2, Search, Pencil } from "lucide-react";
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
import { Figurina, Album } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function FigurinePage() {
  const [figurine, setFigurine] = useLocalStorage<Figurina[]>("figurine", []);
  const [album] = useLocalStorage<Album[]>("album", []);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingFigurina, setEditingFigurina] = useState<Figurina | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [newFigurina, setNewFigurina] = useState({
    nome: "",
    tipo: "Standard" as "Standard" | "Speciale",
    frequenza: 5,
    albumId: "",
  });

  const filteredFigurine = figurine.filter((f) =>
    f.nome.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getNextNumero = (albumId: string) => {
    const albumFigurine = figurine.filter((f) => f.albumId === albumId);
    const numeri = albumFigurine.map((f) => f.numero);
    if (numeri.length === 0) return 1;
    return Math.max(...numeri) + 1;
  };

  const handleAdd = () => {
    if (!newFigurina.nome.trim() || !newFigurina.albumId) return;

    const figurina: Figurina = {
      id: crypto.randomUUID(),
      nome: newFigurina.nome.trim(),
      numero: getNextNumero(newFigurina.albumId),
      tipo: newFigurina.tipo,
      frequenza: newFigurina.frequenza,
      albumId: newFigurina.albumId,
      createdAt: new Date(),
    };

    setFigurine([...figurine, figurina]);
    setNewFigurina({ nome: "", tipo: "Standard", frequenza: 5, albumId: "" });
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
              albumId: newFigurina.albumId,
            }
          : f
      )
    );
    setEditingFigurina(null);
    setNewFigurina({ nome: "", tipo: "Standard", frequenza: 5, albumId: "" });
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
      albumId: figurina.albumId,
    });
    setIsDialogOpen(true);
  };

  const openAddDialog = () => {
    setEditingFigurina(null);
    setNewFigurina({ nome: "", tipo: "Standard", frequenza: 5, albumId: "" });
    setIsDialogOpen(true);
  };

  const getAlbumName = (albumId: string) => {
    const a = album.find((a) => a.id === albumId);
    return a?.nome || "N/A";
  };

  return (
    <>
      <AppHeader title="Gestione Figurine" breadcrumb="Figurine" />
      <PageHeader title="Figurine" />
      
      <div className="flex-1 p-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Archivio Figurine</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Cerca figurina..."
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
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Contenuti ({filteredFigurine.length} elementi)</CardTitle>
            <Button onClick={openAddDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Aggiungi Figurina
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Frequenza</TableHead>
                  <TableHead className="text-right">Azioni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFigurine.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      Nessuna figurina trovata
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredFigurine.map((figurina) => (
                    <TableRow key={figurina.id}>
                      <TableCell className="font-medium">{figurina.numero}</TableCell>
                      <TableCell>{figurina.nome}</TableCell>
                      <TableCell>{figurina.tipo}</TableCell>
                      <TableCell>{figurina.frequenza}/10</TableCell>
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
              {editingFigurina ? "Modifica Figurina" : "Aggiungi Figurina"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
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
            </div>
            <div className="space-y-2">
              <Label htmlFor="album">Album</Label>
              <Select
                value={newFigurina.albumId}
                onValueChange={(value) => setNewFigurina({ ...newFigurina, albumId: value })}
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
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Annulla
            </Button>
            <Button
              onClick={editingFigurina ? handleEdit : handleAdd}
              disabled={!newFigurina.nome.trim() || !newFigurina.albumId}
            >
              {editingFigurina ? "Salva" : "Aggiungi"}
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
