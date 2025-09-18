import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionCategories } from './gestion-categories';

describe('GestionCategories', () => {
  let component: GestionCategories;
  let fixture: ComponentFixture<GestionCategories>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GestionCategories]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GestionCategories);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
