export interface Figurina {
  id: string;
  nome: string;
  numero: number;
  tipo: "Standard" | "Speciale";
  frequenza: number; // es: 3 significa 3/10
  albumId: string;
  createdAt: Date;
}

export interface Album {
  id: string;
  nome: string;
  anno: number;
  createdAt: Date;
}

export interface Pacchetto {
  id: string;
  nome: string;
  numFigurine: number;
  tipo: "statico" | "dinamico";
  createdAt: Date;
}
