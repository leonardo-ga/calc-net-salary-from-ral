import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CalculatorService {

  constructor() { }

  calculateNetSalary(ral: number, dependents: number = 0): number {
    const inpsRate = 0.0939; // ~9.39%
    const inps = ral * inpsRate;

    let taxableIncome = ral - inps;

    // IRPEF progressive
    let irpef = 0;
    if (taxableIncome <= 15000) irpef = taxableIncome * 0.23;
    else if (taxableIncome <= 28000) irpef = 15000 * 0.23 + (taxableIncome - 15000) * 0.25;
    else if (taxableIncome <= 50000) irpef = 15000 * 0.23 + 13000 * 0.25 + (taxableIncome - 28000) * 0.35;
    else irpef = 15000 * 0.23 + 13000 * 0.25 + 22000 * 0.35 + (taxableIncome - 50000) * 0.43;

    // Tax deductions simplified (dependents)
    const deduction = dependents * 800; // example
    irpef -= deduction;

    // Regional + Municipal tax (simplified 2%)
    const regional = taxableIncome * 0.02;

    const netSalary = ral - inps - irpef - regional;
    return netSalary;
  }
}
