import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { PageTitleComponent } from '../../_components/page-title/page-title.component';

@Component({
  selector: 'app-editors',
  standalone: true,
  imports: [CommonModule, RouterModule, PageTitleComponent],
  templateUrl: './editors.component.html',
  styleUrl: './editors.component.css',
})
export class EditorsComponent implements OnInit {
  activeEditor: 'talent' | 'hyperlink' = 'talent';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    // Navigate to talent editor by default
    this.selectEditor('talent');
  }

  selectEditor(editor: 'talent' | 'hyperlink'): void {
    this.activeEditor = editor;
    if (editor === 'talent') {
      this.router.navigate([{ outlets: { talent: ['talent'] } }], {
        relativeTo: this.route,
      });
    } else {
      this.router.navigate([{ outlets: { hyperlink: ['hyperlink'] } }], {
        relativeTo: this.route,
      });
    }
  }
}
