import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-select-dropdown',
  standalone: true,
  templateUrl: './select-dropdown.component.html',
  styleUrl: './select-dropdown.component.css',
})
export class SelectDropdownComponent {
  @Input() options: readonly (number | string)[] = [];
  @Input() value: number | string = '';
  @Input() label: string = '';
  @Output() valueChange = new EventEmitter<string>();

  showDropdown = false;

  toggle(): void {
    this.showDropdown = !this.showDropdown;
  }

  select(option: number | string): void {
    this.valueChange.emit(String(option));
    this.showDropdown = false;
  }

  isSelected(option: number | string): boolean {
    return String(option) === String(this.value);
  }

  hideDropdown(): void {
    // Delay so a click on an option registers before the dropdown closes
    setTimeout(() => {
      this.showDropdown = false;
    }, 150);
  }
}
