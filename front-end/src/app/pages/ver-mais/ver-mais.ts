import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DatePipe, TitleCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ContainerModule } from '../../components/container/container.module';
import { ActivatedRoute, Router } from '@angular/router';
import { PainelService } from '../../services/painel.service';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../services/auth.service';
import { ReplacePipe } from '../../util/replace.pipe';
import { Demanda } from '../../interfaces/demand';

@Component({
  selector: 'app-ver-mais',
  standalone: true,
  imports: [CommonModule, FormsModule, ContainerModule, DatePipe, TitleCasePipe, ReplacePipe],
  templateUrl: './ver-mais.html',
  styleUrl: './ver-mais.scss',
})
export class VerMais implements OnInit {
  demanda: Demanda | null = null;
  isLoading = true;
  isAdmin = false;
  allUsers: any[] = [];
  selectedOwnerId: number | null = null;

  abrirProblema = false;
  abrirObs = false;
  abrirComentario = false;

  novoProblema = '';
  novaObs = '';
  novoComentario = '';

  itemEmEdicao: { tipo: 'problem' | 'observation' | 'comment'; index: number } | null = null;
  valorEmEdicao = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private painelService: PainelService,
    private authService: AuthService,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.toastr.error('ID da demanda não encontrado.', 'Erro');
      this.router.navigate(['/demandas']);
      return;
    }

    this.authService.isAdmin$.subscribe((isAdmin) => {
      this.isAdmin = isAdmin;
      if (this.isAdmin) {
        this.loadAllUsers();
      }
    });

    this.loadDemanda(Number(id));
  }

  loadAllUsers(): void {
    this.painelService.getAllUsers().subscribe({
      next: (users) => {
        this.allUsers = users.filter((user: { userType: string; }) => user.userType !== 'Administrador');
        this.trySetSelectedOwner();
      },
      error: (err) => {
        this.toastr.error('Erro ao carregar a lista de usuários.', 'Erro');
      }
    });
  }

  loadDemanda(id: number): void {
    this.isLoading = true;
    this.painelService.getDemandById(id).subscribe({
      next: (data) => {
        this.demanda = data;
        this.trySetSelectedOwner();
        
        // Garante que as listas não sejam nulas
        if (this.demanda) {
          this.demanda.problems = this.demanda.problems || [];
          this.demanda.observations = this.demanda.observations || [];
          this.demanda.comments = this.demanda.comments || [];
        }
        
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.toastr.error('Erro ao carregar os detalhes da demanda.', 'Erro');
        this.isLoading = false;
        this.router.navigate(['/demandas']);
        this.cdr.detectChanges();
      },
    });
  }

  private trySetSelectedOwner(): void {
    if (this.isAdmin && this.demanda && this.demanda.owner && this.allUsers && this.allUsers.length > 0) {
      const ownerUser = this.allUsers.find(user => user.email.split('@')[0].toLowerCase() === this.demanda!.owner.toLowerCase());
      if (ownerUser) {
        this.selectedOwnerId = ownerUser.id;
        this.cdr.detectChanges();
      }
    }
  }

  atualizarPrioridade(): void {
    if (!this.demanda) return;
    const payload = { priority: this.demanda.priority };
    this.painelService.updateDemand(this.demanda.id, payload).subscribe({
      next: () => {
        this.toastr.success('Prioridade atualizada com sucesso!', 'Sucesso!');
      },
      error: (err) => {
        this.toastr.error('Erro ao atualizar a prioridade.', 'Erro');
        this.loadDemanda(this.demanda!.id);
      },
    });
  }

  atualizarDono(): void {
    if (!this.selectedOwnerId || !this.demanda) {
      this.toastr.warning('Por favor, selecione um novo responsável.', 'Atenção');
      return;
    }
  
    const payload = { userId: this.selectedOwnerId };
  
    this.painelService.updateDemand(this.demanda.id, payload).subscribe({
      next: () => {
        this.toastr.success('Dono da demanda atualizado com sucesso!', 'Sucesso!');
        const newOwner = this.allUsers.find(user => user.id === this.selectedOwnerId);
        if (newOwner) {
            this.demanda!.owner = newOwner.email.split('@')[0];
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.toastr.error('Erro ao atualizar o dono da demanda.', 'Erro');
      }
    });
  }

  private traduzirTipo(tipo: 'problem' | 'observation' | 'comment'): string {
    const mapaDeTraducao = {
      problem: 'Problema',
      observation: 'Observação',
      comment: 'Comentário',
    };
    return mapaDeTraducao[tipo] || this.capitalize(tipo);
  }

  adicionarItem(
    tipo: 'problem' | 'observation' | 'comment',
    valor: string
  ): void {
    if (!valor.trim() || !this.demanda) return;

    // A API espera um array de strings no payload
    const data = { [tipo + 's']: [valor] };

    this.painelService
      .registerProblemObservationOrComment(this.demanda.id, data)
      .subscribe({
        next: (updatedDemanda) => {
          const tipoTraduzido = this.traduzirTipo(tipo);
          this.toastr.success(
            `${tipoTraduzido} adicionado com sucesso!`,
            'Sucesso'
          );
          
          // Atualiza a demanda local com a resposta do servidor (que já traz os objetos com data)
          this.demanda = {
            ...updatedDemanda,
            problems: updatedDemanda.problems || [],
            observations: updatedDemanda.observations || [],
            comments: updatedDemanda.comments || [],
          };
          
          this.resetarFormulario(tipo);
          this.cdr.detectChanges();
        },
        error: (err) => {
          const tipoTraduzido = this.traduzirTipo(tipo);
          this.toastr.error(`Erro ao adicionar ${tipoTraduzido.toLowerCase()}.`, 'Erro');
        },
      });
  }

  iniciarEdicao(tipo: 'problem' | 'observation' | 'comment', index: number): void {
    if (!this.demanda) return;

    this.abrirProblema = false;
    this.abrirObs = false;
    this.abrirComentario = false;

    this.itemEmEdicao = { tipo, index };

    // Extrai apenas o texto do objeto para edição
    switch (tipo) {
      case 'problem':
        this.valorEmEdicao = this.demanda.problems![index].text;
        break;
      case 'observation':
        this.valorEmEdicao = this.demanda.observations![index].text;
        break;
      case 'comment':
        this.valorEmEdicao = this.demanda.comments![index].text;
        break;
    }
  }

  iniciarEdicaoProblema(index: number): void {
    this.iniciarEdicao('problem', index);
  }

  iniciarEdicaoObservacao(index: number): void {
    this.iniciarEdicao('observation', index);
  }

  iniciarEdicaoComentario(index: number): void {
    this.iniciarEdicao('comment', index);
  }

  cancelarEdicao(): void {
    this.itemEmEdicao = null;
    this.valorEmEdicao = '';
  }

  atualizarItem(): void {
    if (!this.itemEmEdicao || !this.valorEmEdicao.trim() || !this.demanda) {
      this.cancelarEdicao();
      return;
    }

    const { tipo, index } = this.itemEmEdicao;
    const data = { [tipo + 's']: [this.valorEmEdicao] };
    
    this.painelService
      .updateProblemObservationOrComment(this.demanda.id, index, data)
      .subscribe({
        next: () => {
          const tipoTraduzido = this.traduzirTipo(tipo);
          this.toastr.success(`${tipoTraduzido} atualizado com sucesso!`, 'Sucesso');

          // Atualiza apenas o texto localmente, mantendo a data original
          const lista = tipo + 's'; 
          if (this.demanda && this.demanda[lista as keyof Demanda]) {
             // @ts-ignore
             this.demanda[lista][index].text = this.valorEmEdicao;
          }

          this.cancelarEdicao();
          this.cdr.detectChanges();
        },
        error: (err) => {
          const tipoTraduzido = this.traduzirTipo(tipo);
          this.toastr.error(`Erro ao atualizar ${tipoTraduzido.toLowerCase()}.`, 'Erro');
          this.cancelarEdicao();
        },
      });
  }

  excluirItem(tipo: 'problem' | 'observation' | 'comment', index: number): void {
    if (this.demanda === null) return;
    
    let deleteObservable;

    switch (tipo) {
      case 'problem':
        deleteObservable = this.painelService.deleteProblem(this.demanda.id, index);
        break;
      case 'observation':
        deleteObservable = this.painelService.deleteObservation(this.demanda.id, index);
        break;
      case 'comment':
        deleteObservable = this.painelService.deleteComment(this.demanda.id, index);
        break;
    }

    deleteObservable.subscribe({
      next: () => {
        const tipoTraduzido = this.traduzirTipo(tipo);
        this.toastr.success(`${tipoTraduzido} excluído com sucesso!`, 'Sucesso');
        this.loadDemanda(this.demanda!.id);
      },
      error: (err) => {
        const tipoTraduzido = this.traduzirTipo(tipo);
        this.toastr.error(`Erro ao excluir ${tipoTraduzido.toLowerCase()}.`, 'Erro');
      },
    });
  }

  resetarFormulario(tipo: 'problem' | 'observation' | 'comment'): void {
    if (tipo === 'problem') {
      this.novoProblema = '';
      this.abrirProblema = false;
    }
    if (tipo === 'observation') {
      this.novaObs = '';
      this.abrirObs = false;
    }
    if (tipo === 'comment') {
      this.novoComentario = '';
      this.abrirComentario = false;
    }
  }

  capitalize(s: string) {
    if (!s) return '';
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  editarDemanda(): void {
    if (this.demanda && this.demanda.id) {
      this.router.navigate(['/editar-demanda', this.demanda.id]);
    }
  }

  voltar(): void {
    this.router.navigate(['/demandas']);
  }
}