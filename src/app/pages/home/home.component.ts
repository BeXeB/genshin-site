import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ImageService } from '../../_services/image.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  constructor(private imageService: ImageService) {}

  quickAccesses = [
    {
      title: 'Tier List',
      description: 'Karakterek rangsorolása erősség szerint.',
      link: '/tierlist',
    },
    {
      title: 'Karakterek',
      description: 'Részletes útmutatók és információk a karakterekről.',
      link: '/characters',
    },
    {
      title: 'Egyébb Útmutatók',
      description: 'Hasznos tippek és játékmechanikai magyarázatok.',
      link: '/guides',
    },
    {
      title: 'Eszközök',
      description: 'Praktikus kalkulátorok és segédprogramok a játékhoz.',
      link: '/tools',
    },
  ];

  getGeoIcon(): string {
    return this.imageService.getElementIcon('Geo');
  }
}
