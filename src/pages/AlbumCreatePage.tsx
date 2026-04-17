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

type ImageFieldType =
  | "logo"
  | "immagineDefault"
  | "ctaHome"
  | "personaggioLanding"
  | "personaggioCodice"
  | "personaggioScan"
  | "placeholderFigurina"
  | "bannerBottomBar";

export default function AlbumCreatePage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [album, setAlbum] = useLocalStorage<Album[]>("album", []);

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
    personaggioLanding: "",
    personaggioLandingFileName: "",
    personaggioCodice: "",
    personaggioCodiceFileName: "",
    personaggioScan: "",
    personaggioScanFileName: "",
    placeholderFigurina: "",
    placeholderFigurinaFileName: "",
    bannerBottomBar: "",
    bannerBottomBarFileName: "",
  });

  const logoInputRef = useRef<HTMLInputElement | null>(null);
  const immagineDefaultInputRef = useRef<HTMLInputElement | null>(null);
  const ctaHomeInputRef = useRef<HTMLInputElement | null>(null);
  const personaggioLandingInputRef = useRef<HTMLInputElement | null>(null);
  const personaggioCodiceInputRef = useRef<HTMLInputElement | null>(null);
  const personaggioScanInputRef = useRef<HTMLInputElement | null>(null);
  const placeholderFigurinaInputRef = useRef<HTMLInputElement | null>(null);
  const bannerBottomBarInputRef = useRef<HTMLInputElement | null>(null);

  const fieldNameMap: Record<ImageFieldType, { data: keyof typeof formData; name: keyof typeof formData }> = {
    logo: { data: "logo", name: "logoFileName" },
    immagineDefault: { data: "immagineDefault", name: "immagineDefaultFileName" },
    ctaHome: { data: "ctaHome", name: "ctaHomeFileName" },
    personaggioLanding: { data: "personaggioLanding", name: "personaggioLandingFileName" },
    personaggioCodice: { data: "personaggioCodice", name: "personaggioCodiceFileName" },
    personaggioScan: { data: "personaggioScan", name: "personaggioScanFileName" },
    placeholderFigurina: { data: "placeholderFigurina", name: "placeholderFigurinaFileName" },
    bannerBottomBar: { data: "bannerBottomBar", name: "bannerBottomBarFileName" },
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: ImageFieldType) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({ title: "File non valido", description: "Seleziona un file immagine (PNG, JPG, WEBP...)", variant: "destructive" });
      e.target.value = "";
      return;
    }

    const MAX_MB = 2;
    if (file.size / (1024 * 1024) > MAX_MB) {
      toast({ title: "Immagine troppo grande", description: `Scegli un'immagine più piccola di ${MAX_MB}MB`, variant: "destructive" });
      e.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const keys = fieldNameMap[type];
      setFormData((prev) => ({ ...prev, [keys.data]: result, [keys.name]: file.name }));
    };
    reader.onerror = () => {
      toast({ title: "Errore", description: "Non sono riuscito a leggere il file", variant: "destructive" });
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleRemoveImage = (type: ImageFieldType) => {
    const keys = fieldNameMap[type];
    setFormData((prev) => ({ ...prev, [keys.data]: "", [keys.name]: "" }));
  };

  const handleSave = () => {
    if (!formData.nome.trim()) {
      toast({ title: "Errore", description: "Inserisci un nome per l'album", variant: "destructive" });
      return;
    }

    const albumItem: Album = {
      id: crypto.randomUUID(),
      nome: formData.nome.trim(),
      anno: formData.anno,
      immagineDefault: formData.immagineDefault || undefined,
      syndication: formData.syndication,
      ...(formData.logo ? { logo: formData.logo, logoFileName: formData.logoFileName } : {}),
      ...(formData.ctaHome ? { ctaHome: formData.ctaHome, ctaHomeFileName: formData.ctaHomeFileName } : {}),
      ...(formData.personaggioLanding ? { personaggioLanding: formData.personaggioLanding, personaggioLandingFileName: formData.personaggioLandingFileName } : {}),
      ...(formData.personaggioCodice ? { personaggioCodice: formData.personaggioCodice, personaggioCodiceFileName: formData.personaggioCodiceFileName } : {}),
      ...(formData.personaggioScan ? { personaggioScan: formData.personaggioScan, personaggioScanFileName: formData.personaggioScanFileName } : {}),
      ...(formData.placeholderFigurina ? { placeholderFigurina: formData.placeholderFigurina, placeholderFigurinaFileName: formData.placeholderFigurinaFileName } : {}),
      ...(formData.bannerBottomBar ? { bannerBottomBar: formData.bannerBottomBar, bannerBottomBarFileName: formData.bannerBottomBarFileName } : {}),
      createdAt: new Date(),
    };

    setAlbum((prev) => [...prev, albumItem]);
    toast({ title: "Album creato", description: `L'album "${albumItem.nome}" è stato creato` });
    setTimeout(() => navigate("/album"), 1000);
  };

  const renderImageField = (
    label: string,
    type: ImageFieldType,
    ref: React.RefObject<HTMLInputElement>,
  ) => {
    const keys = fieldNameMap[type];
    const dataValue = formData[keys.data] as string;
    const nameValue = formData[keys.name] as string;
    return (
      <div className="space-y-2">
        <Label>{label}</Label>
        <input ref={ref} type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, type)} />
        <div className="flex items-center gap-3">
          <Button type="button" onClick={() => ref.current?.click()}>
            <Upload className="h-4 w-4 mr-2" />
            Carica
          </Button>
          <span className="text-sm text-muted-foreground truncate max-w-[150px]">
            {nameValue || (dataValue ? "Immagine salvata" : "Nessun file")}
          </span>
          {dataValue && (
            <Button type="button" variant="outline" size="sm" onClick={() => handleRemoveImage(type)}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <div className="mt-2 border rounded-lg overflow-hidden w-20">
          {dataValue ? (
            <img src={dataValue} alt={label} className="w-full aspect-square object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
          ) : (
            <div className="w-full aspect-square bg-muted flex items-center justify-center">
              <ImageIcon className="h-6 w-6 text-muted-foreground" />
            </div>
          )}
        </div>
      </div>
    );
  };

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
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    placeholder="Nome album"
                    className="
                      rounded-none border-0 border-b-2 bg-transparent px-0 shadow-none
                      focus-visible:ring-0 focus-visible:ring-offset-0
                      border-muted-foreground/30 focus:border-b-4 focus:border-pink-500
                      transition-all duration-200
                    "
                  />
                </div>
                {renderImageField("Immagine Default", "immagineDefault", immagineDefaultInputRef)}
              </div>

              <div className="grid grid-cols-2 gap-6 items-start">
                {renderImageField("Logo Album", "logo", logoInputRef)}
                {renderImageField("CTAHome", "ctaHome", ctaHomeInputRef)}
              </div>

              <div className="grid grid-cols-2 gap-6 items-start">
                {renderImageField("Personaggio Landing", "personaggioLanding", personaggioLandingInputRef)}
                {renderImageField("Personaggio Codice", "personaggioCodice", personaggioCodiceInputRef)}
              </div>

              <div className="grid grid-cols-2 gap-6 items-start">
                {renderImageField("Personaggio Scan", "personaggioScan", personaggioScanInputRef)}
                {renderImageField("Placeholder Figurina", "placeholderFigurina", placeholderFigurinaInputRef)}
              </div>

              <div className="grid grid-cols-2 gap-6 items-start">
                {renderImageField("Banner Bottom Bar", "bannerBottomBar", bannerBottomBarInputRef)}
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
              onChange={(syndication) => setFormData({ ...formData, syndication })}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4 pt-2">
          <Button variant="outline" onClick={() => navigate("/album")}>
            Annulla
          </Button>
          <Button onClick={handleSave} disabled={!formData.nome.trim()}>
            Crea Album
          </Button>
        </div>
      </div>
    </>
  );
}
