import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionArticles } from './gestion-articles';

describe('GestionArticles', () => {
  let component: GestionArticles;
  let fixture: ComponentFixture<GestionArticles>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GestionArticles]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GestionArticles);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
