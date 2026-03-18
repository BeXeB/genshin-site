import { Component, ElementRef, Input, OnDestroy, OnInit } from '@angular/core';
import { ModalService } from '../../_services/modal.service';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [],
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.css'],
})
export class ModalComponent implements OnInit, OnDestroy {
  @Input({ required: true }) id?: string;
  @Input() closeOnClickOutside = true;
  isOpen = false;
  private element: any;

  constructor(
    private modalService: ModalService,
    private el: ElementRef,
  ) {
    this.element = el.nativeElement;
  }

  ngOnInit() {
    this.modalService.add(this);

    document.body.appendChild(this.element);

    if (!this.closeOnClickOutside) return;

    this.element.addEventListener('click', (el: any) => {
      if (el.target.className === 'app-modal') {
        this.close();
      }
    });
  }

  ngOnDestroy() {
    this.modalService.remove(this);

    this.element.remove();
  }

  onBackgroundClick(event: MouseEvent) {
    if (!this.closeOnClickOutside) return;

    const target = event.target as HTMLElement;
    const modalBody = this.element.querySelector('.app-modal-body');

    if (modalBody && !modalBody.contains(target)) {
      this.close();
    }
  }

  open() {
    this.element.querySelector('.app-modal')?.classList.add('open');
    document.body.classList.add('app-modal-open');
    this.isOpen = true;
  }

  close() {
    this.element.querySelector('.app-modal')?.classList.remove('open');
    document.body.classList.remove('app-modal-open');
    this.isOpen = false;
  }
}
