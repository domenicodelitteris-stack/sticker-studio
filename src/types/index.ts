export interface Figurina {
  id: string;
  nome: string;
  numero: number;
  albumId: string;
  createdAt: Date;
}

export interface Album {
  id: string;
  nome: string;
  anno: number;
  createdAt: Date;
}
