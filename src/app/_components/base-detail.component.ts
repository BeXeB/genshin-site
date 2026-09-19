import { OnInit, OnDestroy, Directive } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { FormatterService } from '../_services/formatter.service';
import { takeUntil } from 'rxjs';
import { AstNode } from '../_models/ast-nodes';

@Directive()
export abstract class BaseDetailComponent<T> implements OnInit, OnDestroy {
  protected data: T | null = null;
  protected destroy$ = new Subject<void>();
  protected detailLoadCancelled$ = new Subject<void>();

  abstract loadDetail(slug: string): void;

  constructor(
    protected route: ActivatedRoute,
    protected formatterService: FormatterService
  ) {}

  ngOnInit(): void {
    this.route.paramMap
      .pipe(takeUntil(this.destroy$))
      .subscribe((params) => {
        const slug = params.get('slug');
        if (!slug) return;

        this.detailLoadCancelled$.next();
        this.loadDetail(slug);
      });
  }

  ngOnDestroy(): void {
    this.detailLoadCancelled$.next();
    this.detailLoadCancelled$.complete();
    this.destroy$.next();
    this.destroy$.complete();
  }

  protected parseText(desc: string | undefined): AstNode[] {
    return this.formatterService.parse(desc);
  }
}
