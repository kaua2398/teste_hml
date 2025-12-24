import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerMais } from './ver-mais';

describe('VerMais', () => {
  let component: VerMais;
  let fixture: ComponentFixture<VerMais>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VerMais]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VerMais);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
