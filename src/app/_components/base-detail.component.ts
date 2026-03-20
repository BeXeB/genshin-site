import { OnInit, OnDestroy, Directive } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { SafeHtml } from '@angular/platform-browser';
import { FormatterService } from '../_services/formatter.service';
import { switchMap, takeUntil } from 'rxjs';

@Directive()
export abstract class BaseDetailComponent<T>
  implements OnInit, OnDestroy
{
  protected data: T | null = null;
  protected destroy$ = new Subject<void>();

  abstract loadDetail(slug: string): void;

  constructor(
    protected route: ActivatedRoute,
    protected formatterService: FormatterService,
  ) {}

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        switchMap((params) => {
          const slug = params.get('slug');
          if (!slug) return [];
          this.loadDetail(slug);
          return [];
        }),
        takeUntil(this.destroy$),
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  protected toHtml(desc: string | undefined): SafeHtml {
    return this.formatterService.simpleHtmlConvert(desc);
  }
}
