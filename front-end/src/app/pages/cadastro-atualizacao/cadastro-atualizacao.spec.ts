import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CadastroAtualizacao } from './cadastro-atualizacao';

describe('CadastroAtualizacao', () => {
  let component: CadastroAtualizacao;
  let fixture: ComponentFixture<CadastroAtualizacao>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CadastroAtualizacao]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CadastroAtualizacao);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
