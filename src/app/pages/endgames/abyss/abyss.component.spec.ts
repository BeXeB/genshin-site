import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AbyssComponent } from './abyss.component';

describe('AbyssComponent', () => {
  let component: AbyssComponent;
  let fixture: ComponentFixture<AbyssComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AbyssComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AbyssComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
