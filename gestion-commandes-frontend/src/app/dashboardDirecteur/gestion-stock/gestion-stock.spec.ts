import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionStock } from './gestion-stock';

describe('GestionStock', () => {
  let component: GestionStock;
  let fixture: ComponentFixture<GestionStock>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GestionStock]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GestionStock);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
