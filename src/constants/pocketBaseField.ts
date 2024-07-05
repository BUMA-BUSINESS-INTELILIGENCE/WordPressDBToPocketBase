export interface PocketBaseField {
  name: string;
  type: string; // Type de données (text, number, bool, date, select, etc.)
  required: boolean; // Indique si le champ est requis
  defaultValue?: any; // Valeur par défaut du champ (optionnelle)
  maxLength?: number; // Longueur maximale pour les champs textuels (optionnelle)
  options?: string[]; // Options pour les champs de type 'select' (optionnelle)
  // Autres propriétés peuvent être ajoutées selon les besoins
}
