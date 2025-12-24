import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Demandas } from './demandas';

describe('Demandas', () => {
  let component: Demandas;
  let fixture: ComponentFixture<Demandas>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Demandas]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Demandas);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
