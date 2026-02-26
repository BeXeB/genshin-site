import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  quickAccesses = [
    {
      title: 'Tier List',
      description: 'Karakterek rangsorolása erősség és szerepkör szerint.',
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
}
