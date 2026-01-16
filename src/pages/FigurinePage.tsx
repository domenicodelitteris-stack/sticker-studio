import { useState } from "react";
import { Plus, Trash2, Search } from "lucide-react";
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
  const [searchQuery, setSearchQuery] = useState("");
  const [newFigurina, setNewFigurina] = useState({
    nome: "",
    numero: 0,
    albumId: "",
  });

  const filteredFigurine = figurine.filter((f) =>
    f.nome.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAdd = () => {
    if (!newFigurina.nome.trim() || !newFigurina.albumId) return;
    
    const figurina: Figurina = {
      id: crypto.randomUUID(),
      nome: newFigurina.nome.trim(),
      numero: newFigurina.numero,
      albumId: newFigurina.albumId,
      createdAt: new Date(),
    };
    
    setFigurine([...figurine, figurina]);
    setNewFigurina({ nome: "", numero: 0, albumId: "" });
    setIsDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    setFigurine(figurine.filter((f) => f.id !== id));
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
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Aggiungi Figurina
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Numero</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Album</TableHead>
                  <TableHead className="text-right">Azioni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFigurine.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                      Nessuna figurina trovata
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredFigurine.map((figurina) => (
                    <TableRow key={figurina.id}>
                      <TableCell className="font-medium">{figurina.numero}</TableCell>
                      <TableCell>{figurina.nome}</TableCell>
                      <TableCell>{getAlbumName(figurina.albumId)}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(figurina.id)}
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
            <DialogTitle>Aggiungi Figurina</DialogTitle>
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
              <Label htmlFor="numero">Numero</Label>
              <Input
                id="numero"
                type="number"
                value={newFigurina.numero}
                onChange={(e) => setNewFigurina({ ...newFigurina, numero: parseInt(e.target.value) || 0 })}
                placeholder="Numero figurina"
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
            <Button onClick={handleAdd} disabled={!newFigurina.nome.trim() || !newFigurina.albumId}>
              Aggiungi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
