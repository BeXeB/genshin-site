import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { PageTitleComponent } from '../../_components/page-title/page-title.component';

/** Shared frame for the material calculator tabs; each tab is a child route */
@Component({
  selector: 'app-material-calculator',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, PageTitleComponent],
  templateUrl: './material-calculator.component.html',
  styleUrl: './material-calculator.component.css',
})
export class MaterialCalculatorComponent {}
