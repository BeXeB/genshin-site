import { Component, ElementRef, EventEmitter, Input, Output } from '@angular/core';

// Matches the .dropdown max-height in the stylesheet
const DROPDOWN_MAX_HEIGHT = 350;

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
  openUp = false;

  constructor(private host: ElementRef<HTMLElement>) {}

  toggle(): void {
    if (!this.showDropdown) {
      this.openUp = this.shouldOpenUp();
    }
    this.showDropdown = !this.showDropdown;
  }

  private shouldOpenUp(): boolean {
    const rect = this.host.nativeElement.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    return spaceBelow < DROPDOWN_MAX_HEIGHT && spaceAbove > spaceBelow;
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
