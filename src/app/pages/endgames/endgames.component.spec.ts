import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EndgamesComponent } from './endgames.component';

describe('EndgamesComponent', () => {
  let component: EndgamesComponent;
  let fixture: ComponentFixture<EndgamesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EndgamesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EndgamesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
