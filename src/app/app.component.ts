import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavBarComponent } from './_components/nav-bar/nav-bar.component';
import { ResolverService } from './_services/resolver.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavBarComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'genshin-site';

  constructor(private resolverService: ResolverService) {}

  ngOnInit() {
    this.resolverService.initialize().subscribe();
  }
}
