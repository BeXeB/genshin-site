import { Component, HostListener } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ModalService } from '../../_services/modal.service';
import { ImageService } from '../../_services/image.service';

@Component({
  selector: 'app-nav-bar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './nav-bar.component.html',
  styleUrl: './nav-bar.component.css',
})
export class NavBarComponent {
  mobileMenuOpen = false;

  constructor(
    private modalService: ModalService,
    protected imageService: ImageService
  ) {}

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen = false;
  }

  openSettings() {
    this.modalService.open('settings');
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const nav = document.querySelector('.nav-container');

    if (this.mobileMenuOpen && nav && !nav.contains(target)) {
      this.closeMobileMenu();
    }
  }
}
