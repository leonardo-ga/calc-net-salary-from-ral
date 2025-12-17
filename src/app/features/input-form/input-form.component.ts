import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CalculatorService } from '../../services/calculator.service';
import { CommonModule } from '@angular/common';
import { CalcOutput } from '../../models/calc-output';

import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { HttpClient } from '@angular/common/http';
import { AddizionaleComunale } from '../../models/addizionale-comunale';
import { map, Observable, startWith } from 'rxjs';
import { AutocompleteComponent } from '../autocomplete/autocomplete.component';

@Component({
  selector: 'app-input-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatAutocompleteModule, MatInputModule, MatFormFieldModule, AutocompleteComponent],
  templateUrl: './input-form.component.html',
  styleUrl: './input-form.component.css'
})
export class InputFormComponent {

  @ViewChild('resultSection') resultSection!: ElementRef;

  regioni!: string[];
  comuni!: AddizionaleComunale[];

  salaryForm: FormGroup;
  result?: CalcOutput;

  constructor(private fb: FormBuilder,
    private netSalaryService: CalculatorService,
    private http: HttpClient
  ) {
    this.salaryForm = this.fb.group({
      ral: [40000, [Validators.required, Validators.min(0)]],
      mensilita: [13, [Validators.required]],
      aliquotaINPS: [0.0919],
      regione: ['', Validators.required],
      comune: [undefined, Validators.required],
      bonusVari: [0],
      coniugeACarico: [false],
      figliACarico: [0],
      altriFamiliariACarico: [0]
    });

    this.http.get<string[]>('assets/tasse/regioni.json').subscribe(data => {
      this.regioni = data;
    });
    this.http.get<any[]>('assets/tasse/addizionale-comunale.json').subscribe(data => {
      this.comuni = data;
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

  onRegioneSelected(regione: any) {
    this.salaryForm.patchValue({ regione: regione.regione });
  }

  onComuneSelected(comune: any) {
    this.salaryForm.patchValue({ comune: comune });
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
