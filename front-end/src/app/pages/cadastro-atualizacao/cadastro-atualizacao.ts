import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ContainerModule } from '../../components/container/container.module';
import { PainelService } from '../../services/painel.service';
import { demandaSchema } from '../../schemas/cadastrar-atualizacao-schema';


@Component({
  selector: 'app-cadastro-atualizacao',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ContainerModule,
  ],
  templateUrl: './cadastro-atualizacao.html',
  styleUrls: ['./cadastro-atualizacao.scss']
})
export class CadastroAtualizacao implements OnInit {
  form!: FormGroup;
  isEditMode = false;
  demandaId: number | null = null;
  pageTitle = 'Cadastro de Demanda';
  pageDescription = 'Preencha os campos abaixo para registrar uma nova solicitação de TI';
  
  nextPriority: number = 1; 
  existingPriority: number | null = null;

  private fb = inject(FormBuilder);
  
  constructor(
    private painelService: PainelService,
    private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    this.calculateNextPriority();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.demandaId = Number(id);
      this.pageTitle = 'Atualização de Demanda';
      this.pageDescription = 'Altere os campos abaixo para atualizar a solicitação de TI';
      this.loadDemanda(this.demandaId);
    }
  }

  initForm(): void {
    this.form = this.fb.group({
      title: [''],
      status: ['Iniciada'],
      gitLink: [''],
      date: [''],
      description: ['']
    });
  }

  calculateNextPriority(): void {
    this.painelService.getUserAllDemandRecord().subscribe({
      next: (demandas) => {
        const total = Array.isArray(demandas) ? demandas.length : 0;
        this.nextPriority = total + 1;
        console.log('Próxima prioridade calculada:', this.nextPriority);
      },
      error: (err) => {
        console.error('Erro ao calcular prioridade:', err);
      }
    });
  }

  loadDemanda(id: number): void {
    this.painelService.getDemandById(id).subscribe({
      next: (data) => {
        if (data.date) {
          data.date = new Date(data.date).toISOString().split('T')[0];
        }
        
        this.existingPriority = data.priority;

        this.form.patchValue({
          title: data.title,
          status: data.status,
          gitLink: data.gitLink,
          date: data.date,
          description: data.description
        });
        this.cdr.detectChanges();
      },
      error: () => {
        this.toastr.error('Erro ao carregar a demanda para edição.', 'Erro');
        this.router.navigate(['/demandas']);
      }
    });
  }

  onSubmit(): void {
    const formValues = this.form.value;
    const result = demandaSchema.safeParse(formValues);

    if (!result.success) {
      result.error.issues.forEach((issue) => {
        const fieldName = issue.path[0];
        const control = this.form.get(fieldName.toString());
        if (control) {
          control.setErrors({ zodError: issue.message });
          control.markAsTouched();
        }
      });
      return;
    }

    const priorityToUse = this.isEditMode && this.existingPriority !== null 
      ? this.existingPriority 
      : this.nextPriority;

    const payload = {
      ...result.data,
      priority: priorityToUse
    };

    if (this.isEditMode && this.demandaId) {
      this.painelService.updateDemand(this.demandaId, payload).subscribe({
        next: () => {
          this.toastr.success('Demanda atualizada com sucesso!', 'Sucesso!');
          this.router.navigate(['/demandas']);
        },
        error: (err) => {
          this.toastr.error(err.error?.message || 'Erro ao atualizar a demanda.', 'Erro');
        }
      });
    } else {
      console.log("Enviando payload (Prioridade Auto): ", payload);
      this.painelService.registerDemand(payload).subscribe({
        next: () => {
          this.toastr.success(`Demanda cadastrada com prioridade ${priorityToUse}!`, 'Sucesso!');
          this.router.navigate(['/demandas']);
        },
        error: (err) => {
          this.toastr.error(err.error?.message || 'Erro ao cadastrar a demanda.', 'Erro');
        }
      });
    }
  }

  hasError(field: string): string | null {
    const control = this.form.get(field);
    if (control && control.touched && control.errors?.['zodError']) {
      return control.errors['zodError'];
    }
    return null;
  }

  get descriptionLength(): number {
    return this.form.get('description')?.value?.length || 0;
  }
}