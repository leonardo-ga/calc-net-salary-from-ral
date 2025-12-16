import { AddizionaleComunale } from "./addizionale-comunale";

export interface CalcInput {
    ral: number;
    mensilita?: number;
    aliquotaINPS?: number;
    regione?: string;
    comune?: AddizionaleComunale;
    coniugeACarico?: boolean;
    figliACarico?: number;
    figliDisabili?: number;
    altriFamiliariACarico?: number;
    bonusVari?: number;
}
