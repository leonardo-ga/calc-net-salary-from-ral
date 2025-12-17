import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-autocomplete',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './autocomplete.component.html',
  styleUrl: './autocomplete.component.css'
})
export class AutocompleteComponent {
  @Input() options: any[] = [];
  @Input() displayFields: string[] = ['comune', 'provincia']; // For complex display
  @Input() placeholder: string = '';

  @Output() selection = new EventEmitter<any>();

  inputValue = '';
  filteredOptions: any[] = [];
  showDropdown = false;

  onInputChange() {
    const val = this.inputValue.toLowerCase();
    this.filteredOptions = this.options.filter(o =>
      this.displayFields.some(f => o[f]?.toLowerCase().includes(val))
    );
  }

  selectOption(option: any) {
    this.inputValue = this.displayFields.map(f => option[f]).join(' (') + ')';
    this.showDropdown = false;
    this.selection.emit(option);
  }

  displayOption(option: any) {
    return this.displayFields.map(f => option[f]).join(' (') + ')';
  }

  hideDropdown() {
    setTimeout(() => this.showDropdown = false, 150);
  }
}
