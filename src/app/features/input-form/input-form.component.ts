import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CalculatorService } from '../../services/calculator.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-input-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './input-form.component.html',
  styleUrl: './input-form.component.css'
})
export class InputFormComponent {

  form!: FormGroup;
  netSalary: number | null = null;

  constructor(private salaryService: CalculatorService) { }

  ngOnInit() {
    this.form = new FormGroup({
      ral: new FormControl('', [Validators.required, Validators.min(0)]),
      contractType: new FormControl('full-time'),
      dependents: new FormControl(0),
      region: new FormControl('Lombardia')
    });
  }

  onSubmit() {
    const ral = this.form.value.ral;
    const dependents = this.form.value.dependents;
    this.netSalary = this.salaryService.calculateNetSalary(ral, dependents);
  }

}
