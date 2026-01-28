import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Plus, Trash2, Pencil, ArrowLeft } from "lucide-react";
import { AppHeader } from "@/components/layout/AppHeader";
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
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Figurina, Album, DEFAULT_SYNDICATION } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SyndicationStatusIcons } from "@/components/SyndicationStatusIcons";

export default function AlbumConfigPage() {
  const { albumId } = useParams<{ albumId: string }>();
  const navigate = useNavigate();
  const [albums] = useLocalStorage<Album[]>("album", []);
  const [figurine, setFigurine] = useLocalStorage<Figurina[]>("figurine", []);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const album = albums.find((a) => a.id === albumId);
  const albumFigurine = figurine.filter((f) => f.albumId === albumId);

  const handleDelete = () => {
    if (!deleteId) return;
    setFigurine(figurine.filter((f) => f.id !== deleteId));
    setDeleteId(null);
  };

  if (!album) {
    return (
      <>
        <AppHeader
          title="Configurazione Album"
          breadcrumb="Album > Configurazione"
        />
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
      <AppHeader
        title="Configurazione Album"
        breadcrumb={`Album > ${album.nome}`}
      />
      <PageHeader title={`Configurazione: ${album.nome}`} />

      <div className="flex-1 p-6 space-y-6 overflow-auto">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate("/album")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Torna agli Album
          </Button>
        </div>

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Figurine ({albumFigurine.length} elementi)</CardTitle>
            <Button
              onClick={() => navigate(`/figurine/new?albumId=${albumId}`)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Inserisci figurina
            </Button>
          </CardHeader>
          <CardContent>
            {/* Griglia visiva delle figurine */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(70px, 1fr))",
                gap: "80px",
              }}
            >
              {albumFigurine.map((figurina) => (
                <div
                  key={figurina.id}
                  onClick={() => navigate(`/figurine/${figurina.id}`)}
                  style={{
                    width: "150px",
                    aspectRatio: "3 / 4",
                    border: "2px solid #eab308",
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "white",
                    cursor: "pointer",
                    transition: "background-color 0.2s",
                  }}
                >
                  <div style={{ textAlign: "center", padding: "4px" }}>
                    <div style={{ fontWeight: "bold", fontSize: "14px" }}>
                      {figurina.numero}
                    </div>
                    <div
                      style={{
                        fontSize: "10px",
                        color: "#666",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {figurina.nome}
                    </div>
                  </div>
                </div>
              ))}
              {albumFigurine.length === 0 && (
                <div className="col-span-5 text-center text-muted-foreground py-8">
                  Nessuna figurina inserita. Clicca "Inserisci figurina" per
                  iniziare.
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
                    <TableCell
                      colSpan={6}
                      className="text-center text-muted-foreground py-8"
                    >
                      Nessuna figurina trovata
                    </TableCell>
                  </TableRow>
                ) : (
                  albumFigurine.map((figurina) => (
                    <TableRow key={figurina.id}>
                      <TableCell className="font-medium">
                        {figurina.numero}
                      </TableCell>
                      <TableCell>{figurina.nome}</TableCell>
                      <TableCell>{figurina.tipo}</TableCell>
                      <TableCell>{figurina.frequenza}/10</TableCell>
                      <TableCell>
                        <SyndicationStatusIcons
                          syndication={
                            figurina.syndication || DEFAULT_SYNDICATION
                          }
                        />
                      </TableCell>
                      <TableCell className="text-right space-x-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => navigate(`/figurine/${figurina.id}`)}
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

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Conferma eliminazione</AlertDialogTitle>
            <AlertDialogDescription>
              Sei sicuro di voler eliminare questa figurina? Questa azione non
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
