import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TierlistViewerComponent } from './tierlist-viewer.component';

describe('TierlistViewerComponent', () => {
  let component: TierlistViewerComponent;
  let fixture: ComponentFixture<TierlistViewerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TierlistViewerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TierlistViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
