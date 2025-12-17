import { AddizionaleComunale } from "./addizionale-comunale";

export interface CalcInput {
    ral: number;
    mensilita?: number;
    aliquotaINPS?: number;
    regione?: string;
    comune?: AddizionaleComunale;
    bonusVari?: number;
    coniugeACarico?: boolean;
    figliACarico?: number;
    altriFamiliariACarico?: number;
}
