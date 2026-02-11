import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ImageIcon, Upload, X } from "lucide-react";
import { AppHeader } from "@/components/layout/AppHeader";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Album, DEFAULT_SYNDICATION, SyndicationPlatform } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { SyndicationSection } from "@/components/SyndicationSection";

export default function AlbumCreatePage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [album, setAlbum] = useLocalStorage<Album[]>("album", []);
  const logoInputRef = useRef<HTMLInputElement | null>(null);
  const ctaHomeInputRef = useRef<HTMLInputElement | null>(null);

  const [formData, setFormData] = useState({
    nome: "",
    anno: new Date().getFullYear(),
    immagineDefault: "",
    immagineDefaultFileName: "",
    syndication: [...DEFAULT_SYNDICATION] as SyndicationPlatform[],
    logo: "",
    logoFileName: "",
    ctaHome: "",
    ctaHomeFileName: "",
  });

  const immagineDefaultInputRef = useRef<HTMLInputElement | null>(null);
  const openImmagineDefaultPicker = () =>
    immagineDefaultInputRef.current?.click();

  const handleImmagineDefaultChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
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
        immagineDefault: result,
        immagineDefaultFileName: file.name,
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

  const handleRemoveImmagineDefault = () => {
    setFormData((prev) => ({
      ...prev,
      immagineDefault: "",
      immagineDefaultFileName: "",
    }));
  };

  const openLogoPicker = () => logoInputRef.current?.click();

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
        logo: result,
        logoFileName: file.name,
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

  const handleRemoveLogo = () => {
    setFormData((prev) => ({ ...prev, logo: "", logoFileName: "" }));
  };

  const handleSave = () => {
    if (!formData.nome.trim()) {
      toast({
        title: "Errore",
        description: "Inserisci un nome per l'album",
        variant: "destructive",
      });
      return;
    }

    const albumItem: Album = {
      id: crypto.randomUUID(),
      nome: formData.nome.trim(),
      anno: formData.anno,
      immagineDefault: formData.immagineDefault || undefined,
      syndication: formData.syndication,
      ...(formData.logo ? { logo: formData.logo } : {}),
      ...(formData.logo
        ? ({ logoFileName: formData.logoFileName } as any)
        : {}),
      ...(formData.ctaHome ? { ctaHome: formData.ctaHome } : {}),
      ...(formData.ctaHome
        ? ({ ctaHomeFileName: formData.ctaHomeFileName } as any)
        : {}),
      createdAt: new Date(),
    } as any;

    setAlbum((prev) => [...prev, albumItem]);

    toast({
      title: "Album creato",
      description: `L'album "${albumItem.nome}" è stato creato`,
    });

    setTimeout(() => {
      navigate("/album");
    }, 1000);
  };

  const logoFileLabel =
    formData.logoFileName ||
    (formData.logo ? "Logo salvato" : "Nessun file selezionato");

  return (
    <>
      <AppHeader title="Nuovo Album" breadcrumb="Album > Nuovo" />
      <PageHeader title="Nuovo Album" />

      <div className="flex-1 p-6 space-y-6 overflow-auto">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate("/album")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Torna agli Album
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Dettagli Album</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6 items-start">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) =>
                      setFormData({ ...formData, nome: e.target.value })
                    }
                    placeholder="Nome album"
                    className="
                      rounded-none border-0 border-b-2 bg-transparent px-0 shadow-none
                      focus-visible:ring-0 focus-visible:ring-offset-0
                      border-muted-foreground/30 focus:border-b-4 focus:border-pink-500
                      transition-all duration-200
                    "
                  />
                </div>

                <div className="space-y-2">
                  <Label>Immagine Default</Label>

                  <input
                    ref={immagineDefaultInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImmagineDefaultChange}
                  />

                  <div className="flex items-center gap-3">
                    <Button type="button" onClick={openImmagineDefaultPicker}>
                      <Upload className="h-4 w-4 mr-2" />
                      Carica immagine
                    </Button>

                    <span className="text-sm text-muted-foreground truncate max-w-[200px]">
                      {formData.immagineDefaultFileName ||
                        "Nessun file selezionato"}
                    </span>

                    {formData.immagineDefault && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleRemoveImmagineDefault}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Rimuovi
                      </Button>
                    )}
                  </div>

                  <div className="mt-2 border rounded-lg overflow-hidden w-32">
                    {formData.immagineDefault ? (
                      <img
                        src={formData.immagineDefault}
                        alt="Immagine default"
                        className="w-full aspect-square object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="w-full aspect-square bg-muted flex items-center justify-center">
                        <ImageIcon className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>LogoAlbum</Label>

                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleLogoChange}
                  />

                  <div className="flex items-center gap-3">
                    <Button type="button" onClick={openLogoPicker}>
                      <Upload className="h-4 w-4 mr-2" />
                      Carica logo
                    </Button>

                    <span className="text-sm text-muted-foreground truncate max-w-[260px]">
                      {logoFileLabel}
                    </span>

                    {formData.logo && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleRemoveLogo}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Rimuovi
                      </Button>
                    )}
                  </div>

                  <div className="mt-2 border rounded-lg overflow-hidden w-32">
                    {formData.logo ? (
                      <img
                        src={formData.logo}
                        alt="Logo album"
                        className="w-full aspect-square object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="w-full aspect-square bg-muted flex items-center justify-center">
                        <ImageIcon className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 items-start">
                <div className="space-y-2">
                  <Label>CTAHome</Label>
                  <input
                    ref={ctaHomeInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      if (!file.type.startsWith("image/")) {
                        toast({ title: "File non valido", description: "Seleziona un file immagine", variant: "destructive" });
                        e.target.value = ""; return;
                      }
                      if (file.size / (1024 * 1024) > 2) {
                        toast({ title: "Immagine troppo grande", description: "Scegli un'immagine più piccola di 2MB", variant: "destructive" });
                        e.target.value = ""; return;
                      }
                      const reader = new FileReader();
                      reader.onload = () => {
                        setFormData((prev) => ({ ...prev, ctaHome: reader.result as string, ctaHomeFileName: file.name }));
                      };
                      reader.readAsDataURL(file);
                      e.target.value = "";
                    }}
                  />
                  <div className="flex items-center gap-3">
                    <Button type="button" onClick={() => ctaHomeInputRef.current?.click()}>
                      <Upload className="h-4 w-4 mr-2" />
                      Carica immagine
                    </Button>
                    <span className="text-sm text-muted-foreground truncate max-w-[200px]">
                      {formData.ctaHomeFileName || "Nessun file selezionato"}
                    </span>
                    {formData.ctaHome && (
                      <Button type="button" variant="outline" onClick={() => setFormData((prev) => ({ ...prev, ctaHome: "", ctaHomeFileName: "" }))}>
                        <X className="h-4 w-4 mr-2" />
                        Rimuovi
                      </Button>
                    )}
                  </div>
                  <div className="mt-2 border rounded-lg overflow-hidden w-32">
                    {formData.ctaHome ? (
                      <img src={formData.ctaHome} alt="CTAHome" className="w-full aspect-square object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                    ) : (
                      <div className="w-full aspect-square bg-muted flex items-center justify-center">
                        <ImageIcon className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-2">
                <Button variant="outline" onClick={() => navigate("/album")}>
                  Annulla
                </Button>
                <Button onClick={handleSave} disabled={!formData.nome.trim()}>
                  Crea Album
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex-row items-center justify-between gap-4">
            <div className="space-y-1">
              <CardTitle>Syndication Album</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <SyndicationSection
              syndication={formData.syndication}
              onChange={(syndication) =>
                setFormData({ ...formData, syndication })
              }
            />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
