import { Injectable } from '@angular/core';
import { CalcInput } from '../models/calc-input';
import { CalcOutput } from '../models/calc-output';

@Injectable({
  providedIn: 'root'
})
export class CalculatorService {

  constructor() { }

  calcolaNetto(input: CalcInput): CalcOutput {
    const ral = input.ral;
    const mensilita = input.mensilita ?? 13;
    const aliquotaINPS = input.aliquotaINPS ?? 0.0919;
    const addReg = input.addizionaleRegionale ?? 0;
    const addCom = input.addizionaleComunale ?? 0;

    // 1. Contributi INPS
    const contributiINPS = ral * aliquotaINPS;
    const redditoImponibile = ral - contributiINPS;

    // 2. IRPEF lorda
    const scaglioni = [
      { limite: 28000, aliquota: 0.23 },
      { limite: 50000, aliquota: 0.35 },
      { limite: Infinity, aliquota: 0.43 }
    ];

    let irpefLorda = 0;
    let precedenteLimite = 0;
    for (const scaglione of scaglioni) {
      if (redditoImponibile > precedenteLimite) {
        const redditoScaglione = Math.min(redditoImponibile, scaglione.limite) - precedenteLimite;
        irpefLorda += redditoScaglione * scaglione.aliquota;
        precedenteLimite = scaglione.limite;
      } else break;
    }

    // 3. Detrazione lavoro dipendente (precisa)
    const detrazioneBase = this.calcolaDetrazioneLavoroDipendente(redditoImponibile);

    // 3.1 Cuneo Fiscale 2025
    const cuneoFiscale2025 = this.calcolaCuneoFiscale2025(redditoImponibile);

    // 4. Detrazione familiari a carico
    let detrazioneFamiliari = 0;
    if (input.coniugeACarico) detrazioneFamiliari += 800;
    if (input.figliACarico) detrazioneFamiliari += input.figliACarico * 950;
    if (input.figliDisabili) detrazioneFamiliari += input.figliDisabili * 400;
    if (input.altriFamiliariACarico) detrazioneFamiliari += input.altriFamiliariACarico * 750;

    // 5. Addizionali regionali e comunali
    const addizionali = redditoImponibile * (addReg + addCom);

    // 6. IRPEF netta
    const irpefNetta = Math.max(irpefLorda + addizionali - detrazioneBase - detrazioneFamiliari - cuneoFiscale2025, 0);

    // 7. Netto annuo
    const bonus = input.bonusVari ?? 0;
    const nettoAnnuo = ral - contributiINPS - irpefNetta + bonus;

    // 8. Netto mensile
    const nettoMensile = nettoAnnuo / mensilita;

    return {
      contributiINPS,
      redditoImponibile,
      irpefLorda,
      detrazioneFamiliari: detrazioneBase + detrazioneFamiliari,
      irpefNetta,
      addizionali,
      nettoAnnuo,
      nettoMensile
    };
  }

  private calcolaDetrazioneLavoroDipendente(reddito: number): number {
    let tot = 0;
    if (reddito <= 15000) tot += 1955;
    if (reddito <= 28000) tot += (1910 + 1190 * ((28000 - reddito) / 13000));
    if (reddito <= 50000) tot += (1910 * ((50000 - reddito) / 22000));
    // bonus di 65 euro
    if (reddito >= 25000 && reddito <= 35000) tot += 65;
    // if (reddito > 50k) return 0;
    return tot;
  }

  calcolaCuneoFiscale2025(reddito: number): number {
    if (reddito <= 20000) {
      let perc: number;
      if(reddito <= 8500) perc = 0.071;
      else if(reddito <= 15000) perc = 0.053;
      else perc = 0.048;
      return perc * reddito;
    }
    if (reddito <= 32000) return 1000;
    if (reddito <= 40000) return -0.125 * reddito + 5000;
    return 0;
  }

}
