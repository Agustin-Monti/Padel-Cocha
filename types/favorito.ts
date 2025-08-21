// types/favorito.ts (opcional para compartir entre archivos)
export interface FavoritoItem {
  id: string;
  producto: {
    nombre: string;
    precio: number;
    imagen: string;
  } | null;
}
