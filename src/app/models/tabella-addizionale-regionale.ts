import { ScaglioneAliquota } from "./scaglione-aliquota";

export interface TabellaAddizionaleRegionale {
    [regionName: string]: ScaglioneAliquota[];
}
