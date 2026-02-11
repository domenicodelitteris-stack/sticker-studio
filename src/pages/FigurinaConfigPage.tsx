import { useRef, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, ImageIcon, Upload, X } from "lucide-react";
import { AppHeader } from "@/components/layout/AppHeader";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useToast } from "@/hooks/use-toast";
import { Figurina, Album } from "@/types";

export default function FigurinaConfigPage() {
  const { figurinaId } = useParams<{ figurinaId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [figurine, setFigurine] = useLocalStorage<Figurina[]>("figurine", []);
  const [albums] = useLocalStorage<Album[]>("album", []);

  const isNew = figurinaId === "new";
  const figurina = isNew ? null : figurine.find((f) => f.id === figurinaId);
  const preselectedAlbumId = searchParams.get("albumId");

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [formData, setFormData] = useState({
    nome: figurina?.nome || "",
    tipo: (figurina?.tipo || "Standard") as "Standard" | "Speciale",
    link: (figurina as any)?.link || "",
    albumId: (figurina as any)?.albumId || preselectedAlbumId || "",
    fileName: (figurina as any)?.fileName || "",
    doppia: (figurina as any)?.doppia || false,
  });

  const getNextNumero = (albumId: string) => {
    const albumFigurine = figurine.filter((f: any) => f.albumId === albumId);
    const numeri = albumFigurine.map((f: any) => f.numero);
    if (numeri.length === 0) return 1;
    return Math.max(...numeri) + 1;
  };

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({
        title: "File non valido",
        description: "Seleziona un file immagine (PNG, JPG, WEBP...)",
        variant: "destructive",
      });
      e.target.value = "";
      return;
    }

    const MAX_MB = 2;
    const sizeMb = file.size / (1024 * 1024);
    if (sizeMb > MAX_MB) {
      toast({
        title: "Immagine troppo grande",
        description: `Scegli un'immagine più piccola di ${MAX_MB}MB`,
        variant: "destructive",
      });
      e.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;

      setFormData((prev) => ({
        ...prev,
        link: result,
        fileName: file.name, // ✅ salva nome file
      }));
    };

    reader.onerror = () => {
      toast({
        title: "Errore",
        description: "Non sono riuscito a leggere il file",
        variant: "destructive",
      });
    };

    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleRemoveImage = () => {
    setFormData((prev) => ({ ...prev, link: "", fileName: "" }));
  };

  const handleSave = () => {
    if (!formData.nome.trim()) {
      toast({
        title: "Errore",
        description: "Inserisci un nome per la figurina",
        variant: "destructive",
      });
      return;
    }

    if (!formData.albumId) {
      toast({
        title: "Errore",
        description: "Seleziona un album",
        variant: "destructive",
      });
      return;
    }

    const returnUrl = preselectedAlbumId
      ? `/album/${preselectedAlbumId}`
      : "/figurine";

    if (isNew) {
      const newFigurina: any = {
        id: crypto.randomUUID(),
        nome: formData.nome.trim(),
        numero: getNextNumero(formData.albumId),
        tipo: formData.tipo,
        link: formData.link,
        albumId: formData.albumId,
        fileName: formData.fileName,
        doppia: formData.doppia,
        createdAt: new Date(),
      };

      setFigurine([...figurine, newFigurina]);
      toast({
        title: "Figurina creata",
        description: `La figurina "${formData.nome}" è stata creata`,
      });
    } else {
      setFigurine(
        figurine.map((f: any) =>
          f.id === figurinaId
            ? {
                ...f,
                nome: formData.nome.trim(),
                tipo: formData.tipo,
                link: formData.link,
                albumId: formData.albumId,
                fileName: formData.fileName,
                doppia: formData.doppia,
              }
            : f,
        ),
      );
      toast({
        title: "Figurina salvata",
        description: `La figurina "${formData.nome}" è stata aggiornata`,
      });
    }
    setTimeout(() => {
      navigate(returnUrl);
    }, 500);
  };

  const handleCancel = () => {
    const returnUrl = preselectedAlbumId
      ? `/album/${preselectedAlbumId}`
      : "/figurine";
    navigate(returnUrl);
  };

  if (!isNew && !figurina) {
    return (
      <>
        <AppHeader
          title="Configurazione Figurina"
          breadcrumb="Figurine > Configurazione"
        />
        <PageHeader title="Figurina non trovata" />
        <div className="flex-1 p-6">
          <Button onClick={() => navigate("/figurine")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Torna alle Figurine
          </Button>
        </div>
      </>
    );
  }

  const fileLabel =
    formData.fileName ||
    (formData.link ? "Immagine salvata" : "Nessun file selezionato");

  return (
    <>
      <AppHeader
        title="Configurazione Figurina"
        breadcrumb={`Figurine > ${isNew ? "Nuova" : figurina?.nome}`}
      />
      <PageHeader
        title={isNew ? "Nuova Figurina" : `Configurazione: ${figurina?.nome}`}
      />

      <div className="flex-1 p-6 space-y-6 overflow-auto">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={handleCancel}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {preselectedAlbumId ? "Torna all'Album" : "Torna alle Figurine"}
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Dettagli Figurina</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) =>
                      setFormData({ ...formData, nome: e.target.value })
                    }
                    placeholder="Nome figurina"
                    className="rounded-none border-0 border-b-2 bg-transparent px-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 border-muted-foreground/30 focus:border-b-4 focus:border-pink-500 transition-all duration-200"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="album">Album</Label>
                  <Select
                    value={formData.albumId}
                    onValueChange={(value) =>
                      setFormData({ ...formData, albumId: value })
                    }
                  >
                    <SelectTrigger className="rounded-none border-0 border-b-2 border-muted-foreground/30 bg-transparent px-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none focus:border-b-4 focus:border-b-pink-500 transition-all duration-200">
                      <SelectValue placeholder="Seleziona album" />
                    </SelectTrigger>
                    <SelectContent>
                      {albums.length === 0 ? (
                        <SelectItem value="none" disabled>
                          Nessun album disponibile
                        </SelectItem>
                      ) : (
                        albums.map((a) => (
                          <SelectItem key={a.id} value={a.id}>
                            {a.nome}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tipo">Tipo</Label>
                  <Select
                    value={formData.tipo}
                    onValueChange={(value: "Standard" | "Speciale") =>
                      setFormData({ ...formData, tipo: value })
                    }
                  >
                    <SelectTrigger className="rounded-none border-0 border-b-2 border-muted-foreground/30 bg-transparent px-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none focus:border-b-4 focus:border-b-pink-500 transition-all duration-200">
                      <SelectValue placeholder="Seleziona tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Standard">Standard</SelectItem>
                      <SelectItem value="Speciale">Speciale</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>File</Label>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <div className="flex items-center gap-3">
                    <Button
                      type="button"
                      variant="default"
                      onClick={openFilePicker}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Carica immagine
                    </Button>

                    <span className="text-sm text-muted-foreground truncate max-w-[260px]">
                      {fileLabel}
                    </span>

                    {formData.link && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleRemoveImage}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Rimuovi
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3 pt-2">
                <Checkbox
                  id="doppia"
                  checked={formData.doppia}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, doppia: !!checked })
                  }
                />
                <Label htmlFor="doppia" className="cursor-pointer">Figurina Doppia</Label>
              </div>

              <div className="space-y-2">
                <Label>Preview Immagine</Label>
                <div className="border rounded-lg overflow-hidden w-32">
                  {formData.link ? (
                    <img
                      src={formData.link}
                      alt="Preview figurina"
                      className="w-full aspect-[3/4] object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = "none";
                        target.nextElementSibling?.classList.remove("hidden");
                      }}
                    />
                  ) : null}

                  <div
                    className={`w-full aspect-[3/4] bg-muted flex items-center justify-center ${
                      formData.link ? "hidden" : ""
                    }`}
                  >
                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <Button variant="outline" onClick={handleCancel}>
                  Annulla
                </Button>
                <Button onClick={handleSave}>
                  {isNew ? "Crea Figurina" : "Salva Modifiche"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
