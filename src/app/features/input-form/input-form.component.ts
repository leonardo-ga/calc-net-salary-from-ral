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

  regioni: string[] = [
    'Abruzzo',
    'Basilicata',
    'Calabria',
    'Campania',
    'Emilia-Romagna',
    'Friuli-Venezia Giulia',
    'Lazio',
    'Liguria',
    'Lombardia',
    'Marche',
    'Molise',
    'Piemonte',
    'Puglia',
    'Sardegna',
    'Sicilia',
    'Toscana',
    'Trentino-Alto Adige',
    'Umbria',
    'Valle d\'Aosta',
    'Veneto'
  ];
  comuni!: AddizionaleComunale[];
  //Needed for mat-autocomplete
  /*comuneCtrl = new FormControl<AddizionaleComunale | string | null>(null);
  filteredComuni!: Observable<AddizionaleComunale[]>;
  comune: AddizionaleComunale | undefined;*/

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
      coniugeACarico: [false],
      figliACarico: [0],
      figliDisabili: [0],
      altriFamiliariACarico: [0],
      bonusVari: [0]
    });

    this.http.get<any[]>('assets/tasse/addizionale-comunale.json').subscribe(data => {
      this.comuni = data;
      //Needed for mat-autocomplete
      /*this.filteredComuni = this.comuneCtrl.valueChanges.pipe(
        startWith(''),
        map(value => {
          if (!value) return '';
          return typeof value === 'string' ? value : value.comune;
        }),
        map(name => name ? this.filterComuni(name) : this.comuni.slice())
      );*/
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

  onComuneSelected(comune: any) {
    //Needed for mat-autocomplete
    //this.comune = comune;
    this.salaryForm.patchValue({ comune: comune });
  }

  //Needed for mat-autocomplete
  /*displayComune(comune: any): string {
    return comune ? (comune.comune + " (" + comune.provincia + ")") : '';
  }

  private filterComuni(value: string): any[] {
    const filterValue = value.toLowerCase();
    return this.comuni.filter(c => c.comune.toLowerCase().includes(filterValue));
  }*/

  private scrollToResult() {
    if (this.resultSection) {
      this.resultSection.nativeElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  }

}
