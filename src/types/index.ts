export interface SyndicationPlatform {
  platform: "Web" | "iOS" | "Android" | "Smart TV";
  isPublished: boolean;
  startDate: string | null;
  endDate: string | null;
}

export const DEFAULT_SYNDICATION: SyndicationPlatform[] = [
  { platform: "Web", isPublished: false, startDate: null, endDate: null },
  { platform: "iOS", isPublished: false, startDate: null, endDate: null },
  { platform: "Android", isPublished: false, startDate: null, endDate: null },
  { platform: "Smart TV", isPublished: false, startDate: null, endDate: null },
];

export interface Figurina {
  id: string;
  nome: string;
  numero: number;
  tipo: "Standard" | "Speciale";
  frequenza: number; // es: 3 significa 3/10
  albumId: string;
  syndication: SyndicationPlatform[];
  createdAt: Date;
}

export interface Album {
  id: string;
  nome: string;
  anno: number;
  syndication: SyndicationPlatform[];
  createdAt: Date;
}

export interface Pacchetto {
  id: string;
  nome: string;
  numFigurine: number;
  tipo: "statico" | "dinamico";
  syndication: SyndicationPlatform[];
  createdAt: Date;
}
