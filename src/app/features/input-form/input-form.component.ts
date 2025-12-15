import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CalculatorService } from '../../services/calculator.service';
import { CommonModule } from '@angular/common';
import { CalcOutput } from '../../models/calc-output';

@Component({
  selector: 'app-input-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './input-form.component.html',
  styleUrl: './input-form.component.css'
})
export class InputFormComponent {

  @ViewChild('resultSection') resultSection!: ElementRef;

  salaryForm: FormGroup;
  result?: CalcOutput;

  constructor(private fb: FormBuilder, private netSalaryService: CalculatorService) {
    this.salaryForm = this.fb.group({
      ral: [40000, [Validators.required, Validators.min(0)]],
      mensilita: [13, [Validators.required]],
      aliquotaINPS: [0.0919],
      addizionaleRegionale: [0.015],
      addizionaleComunale: [0.008],
      coniugeACarico: [false],
      figliACarico: [0],
      figliDisabili: [0],
      altriFamiliariACarico: [0],
      bonusVari: [0]
    });
  }

  calculate() {
    if (this.salaryForm.valid) {
      this.result = this.netSalaryService.calcolaNetto(this.salaryForm.value);

      // wait for DOM update, then scroll
      setTimeout(() => {
        this.scrollToResult();
      });
    }
  }

  private scrollToResult() {
    if (this.resultSection) {
      this.resultSection.nativeElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  }

}
