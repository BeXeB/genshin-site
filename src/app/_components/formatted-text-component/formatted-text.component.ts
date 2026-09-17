import {
  Component,
  forwardRef,
  Input,
  OnInit,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { AstNode } from '../../_models/ast-nodes';
import { FormatterService } from '../../_services/formatter.service';
import { AstRendererComponent } from '../ast-renderer/ast-renderer.component';

@Component({
  selector: 'app-formatted-text',
  imports: [AstRendererComponent],
  templateUrl: './formatted-text.component.html',
  styleUrl: './formatted-text.component.css',
})
export class FormattedTextComponent implements OnInit, OnChanges {
  @Input() text?: string;
  @Input() nodes?: AstNode[];
  @Input() elementColor: string = 'var(--light-gray)';

  constructor(private formatter: FormatterService) {}

  ngOnInit(): void {
    if (this.text !== undefined && !this.nodes) {
      this.nodes = this.formatter.parse(this.text);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['text'] && this.text !== undefined) {
      this.nodes = this.formatter.parse(this.text);
    }
  }
}
