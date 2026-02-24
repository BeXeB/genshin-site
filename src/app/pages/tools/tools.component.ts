import { Component } from '@angular/core';
import { PageTitleComponent } from "../../_components/page-title/page-title.component";
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-tools',
  standalone: true,
  imports: [PageTitleComponent, RouterLink],
  templateUrl: './tools.component.html',
  styleUrl: './tools.component.css'
})
export class ToolsComponent {

}
