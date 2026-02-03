export interface SyndicationPlatform {
  platform: "iOS" | "Android";
  isPublished: boolean;
  startDate: string | null;
  endDate: string | null;
}

export const DEFAULT_SYNDICATION: SyndicationPlatform[] = [
  { platform: "iOS", isPublished: false, startDate: null, endDate: null },
  { platform: "Android", isPublished: false, startDate: null, endDate: null },
];

export interface Pagina {
  id: string;
  nome: string;
  backgroundLink: string;
  albumId: string;
  ordine: number;
  createdAt: Date;
}

export interface Figurina {
  id: string;
  nome: string;
  numero: number;
  tipo: "Standard" | "Speciale";
  link: string;
  paginaId: string;
  ordine: number;
  createdAt: Date;
}

export interface Album {
  id: string;
  nome: string;
  anno: number;
  coloreDefault?: string;
  syndication: SyndicationPlatform[];
  createdAt: Date;
}

export interface PacchettoFigurina {
  figurinaId: string;
  ordine: number;
  frequenza?: number; // 0-100, used for dynamic packets
}

export interface Pacchetto {
  id: string;
  nome: string;
  numFigurine: number;
  tipo: "statico" | "dinamico";
  syndication: SyndicationPlatform[];
  createdAt: Date;
  albumId?: string;
  figurine?: PacchettoFigurina[];
}
