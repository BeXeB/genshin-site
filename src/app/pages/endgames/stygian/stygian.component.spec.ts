import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StygianComponent } from './stygian.component';

describe('StygianComponent', () => {
  let component: StygianComponent;
  let fixture: ComponentFixture<StygianComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StygianComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(StygianComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
