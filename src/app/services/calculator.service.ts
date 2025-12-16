import { Injectable } from '@angular/core';
import { CalcInput } from '../models/calc-input';
import { CalcOutput } from '../models/calc-output';
import { HttpClient } from '@angular/common/http';
import { ScaglioneAliquota } from '../models/scaglione-aliquota';
import { TabellaAddizionaleRegionale } from '../models/tabella-addizionale-regionale';
import { AddizionaleComunale } from '../models/addizionale-comunale';

@Injectable({
  providedIn: 'root'
})
export class CalculatorService {

  private tabellaAddizionaleRegionale!: TabellaAddizionaleRegionale;
  private scaglioniIRPEF = [
    { limite: 28000, aliquota: 0.23 },
    { limite: 50000, aliquota: 0.35 },
    { limite: Infinity, aliquota: 0.43 }
  ];

  constructor(private http: HttpClient) {
    this.http.get<TabellaAddizionaleRegionale>(
      'assets/tasse/addizionale-regionale.json'
    ).subscribe((res) => {
      this.tabellaAddizionaleRegionale = res;
    });
  }

  calcolaNetto(input: CalcInput): CalcOutput {
    const ral = input.ral;
    const mensilita = input.mensilita ?? 13;
    const aliquotaINPS = input.aliquotaINPS ?? 0.0919;
    const regione = input.regione ?? 'Lombardia';
    const comune: AddizionaleComunale = input.comune ?? {
      codice_catastale: "F205",
      comune: "MILANO",
      provincia: "MI",
      aliquota_unica: "0.8",
      esenzione: "23000.00"
    };
    const bonus = input.bonusVari ?? 0;

    // 1. Contributi INPS
    const contributiINPS = ral * aliquotaINPS;
    const redditoImponibile = ral - contributiINPS;

    // 2. IRPEF lorda
    let irpefLorda = 0;
    let precedenteLimite = 0;
    for (const scaglione of this.scaglioniIRPEF) {
      if (redditoImponibile > precedenteLimite) {
        const redditoScaglione = Math.min(redditoImponibile, scaglione.limite) - precedenteLimite;
        irpefLorda += redditoScaglione * scaglione.aliquota;
        precedenteLimite = scaglione.limite;
      } else break;
    }

    // 3. Detrazioni
    // 3.1. Detrazione lavoro dipendente (precisa)
    const detrazioneBase = this.calcolaDetrazioneLavoroDipendente(redditoImponibile);

    // 3.2. Cuneo Fiscale 2025
    const isCuneoFiscale2025UnaDetrazione: boolean = (redditoImponibile > 20000);
    const cuneoFiscale2025 = this.calcolaCuneoFiscale2025(redditoImponibile);

    // 3.3. Detrazione familiari a carico
    let detrazioneFamiliari = 0;
    if (input.coniugeACarico) detrazioneFamiliari += 800;
    if (input.figliACarico) detrazioneFamiliari += input.figliACarico * 950;
    if (input.figliDisabili) detrazioneFamiliari += input.figliDisabili * 400;
    if (input.altriFamiliariACarico) detrazioneFamiliari += input.altriFamiliariACarico * 750;

    const detrazioni: number = detrazioneBase + detrazioneFamiliari
      + (isCuneoFiscale2025UnaDetrazione ? cuneoFiscale2025 : 0);

    // 4. Addizionali regionali e comunali
    const addizionaleRegionale = this.getAddizionaleRegionale(regione, redditoImponibile);
    const addizionaleComunale = this.getAddizionaleComunale(comune, redditoImponibile);
    const addizionali = addizionaleRegionale + addizionaleComunale;

    // 5. IRPEF netta
    const irpefNetta = Math.max(irpefLorda + addizionali - detrazioni, 0);

    // 6. Bonus IRPEF 100 Euro
    const bonusIRPEF100: number = this.bonusIRPEF100(redditoImponibile);

    // 7. Netto annuo
    const nettoAnnuo = ral - contributiINPS - irpefNetta + bonusIRPEF100 + bonus
      + (!isCuneoFiscale2025UnaDetrazione ? cuneoFiscale2025 : 0);

    // 8. Netto mensile
    const nettoMensile = nettoAnnuo / mensilita;

    return {
      contributiINPS,
      redditoImponibile,
      irpefLorda,
      detrazioni,
      irpefNetta,
      addizionali,
      nettoAnnuo,
      nettoMensile
    };
  }

  private calcolaDetrazioneLavoroDipendente(reddito: number): number {
    let tot = 0;
    if (reddito <= 15000) tot += 1955;
    else if (reddito <= 28000) tot += (1910 + 1190 * ((28000 - reddito) / 13000));
    else if (reddito <= 50000) tot += (1910 * ((50000 - reddito) / 22000));
    // bonus di 65 euro
    if (reddito >= 25000 && reddito <= 35000) tot += 65;
    // if (reddito > 50k) return 0;
    return tot;
  }

  calcolaCuneoFiscale2025(reddito: number): number {
    if (reddito <= 20000) {
      let perc: number;
      if (reddito <= 8500) perc = 0.071;
      else if (reddito <= 15000) perc = 0.053;
      else perc = 0.048;
      return perc * reddito;
    }
    else if (reddito <= 32000) return 1000;
    else if (reddito <= 40000) return -0.125 * reddito + 5000;
    return 0;
  }

  bonusIRPEF100(reddito: number): number {
    if (reddito <= 15000) return 1200;
    else if (reddito <= 28000) return 0;//TODO: it is in a range between 0 and 1200
    return 0;
  }

  getAddizionaleRegionale(
    regione: string,
    imponibile: number
  ): number {
    const scaglioni = this.tabellaAddizionaleRegionale[regione];
    if (!scaglioni) return 0;

    let addizionaleRegionale = 0;
    let precedenteLimite = 0;
    for (const scaglione of scaglioni) {
      if (imponibile > precedenteLimite) {
        const redditoScaglione = Math.min(imponibile, scaglione.limite) - precedenteLimite;
        addizionaleRegionale += redditoScaglione * scaglione.aliquota;
        precedenteLimite = scaglione.limite;
      } else break;
    }

    return addizionaleRegionale;
  }

  getAddizionaleComunale(comune: AddizionaleComunale, imponibile: number): number {
    const scaglioni: ScaglioneAliquota[] = [];
    let numScaglioni: number = 0;
    let isEsenzione: boolean = false;
    let esenzioneLimit: number = 0;
    if (comune.esenzione) {
      isEsenzione = true;
      esenzioneLimit = parseFloat(comune.esenzione);
      scaglioni[0] = { limite: esenzioneLimit, aliquota: 0 };
      numScaglioni++;
    }
    if (comune.aliquota_unica) {
      scaglioni[1] = { limite: Infinity, aliquota: this.stringToPercToNum(comune.aliquota_unica) };
      numScaglioni++;
    } else {
      if (comune.aliquota1 && (!isEsenzione || (isEsenzione && 15000 > esenzioneLimit))) {
        scaglioni[numScaglioni] = { limite: 15000, aliquota: this.stringToPercToNum(comune.aliquota1) };
        numScaglioni++;
      }
      if (comune.aliquota2 && (!isEsenzione || (isEsenzione && 28000 > esenzioneLimit))) {
        scaglioni[numScaglioni] = { limite: 28000, aliquota: this.stringToPercToNum(comune.aliquota2) };
        numScaglioni++;
      }
      if (comune.aliquota3 && (!isEsenzione || (isEsenzione && 50000 > esenzioneLimit))) {
        scaglioni[numScaglioni] = { limite: 50000, aliquota: this.stringToPercToNum(comune.aliquota3) };
        numScaglioni++;
      }
      if (comune.aliquota4) {
        scaglioni[numScaglioni] = { limite: Infinity, aliquota: this.stringToPercToNum(comune.aliquota4) };
        numScaglioni++;
      }
    }

    let addizionaleComunale = 0;
    let precedenteLimite = 0;
    for (const scaglione of scaglioni) {
      if (imponibile > precedenteLimite) {
        const redditoScaglione = Math.min(imponibile, scaglione.limite) - precedenteLimite;
        addizionaleComunale += redditoScaglione * scaglione.aliquota;
        precedenteLimite = scaglione.limite;
      } else break;
    }

    return addizionaleComunale;
  }

  /**
   * 
   * @param str 
   * @returns example: "0.8" --> 0.8 --> 0.008
   */
  stringToPercToNum(str: string): number {
    return parseFloat(str) / 100;
  }

}
