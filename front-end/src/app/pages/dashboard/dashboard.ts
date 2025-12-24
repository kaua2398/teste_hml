import { Component, OnInit, OnDestroy, ElementRef, ViewChild, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ContainerModule } from '../../components/container/container.module';
import { PainelService } from '../../services/painel.service';
import { ToastrService } from 'ngx-toastr';
import { Chart, registerables } from 'chart.js/auto';
import { FormsModule } from '@angular/forms';
import { ReplacePipe } from '../../util/replace.pipe';
import { forkJoin } from 'rxjs';


@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, ContainerModule, FormsModule, DatePipe, ReplacePipe],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class Dashboard implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('demandasPorFuncionarioChart') private demandasPorFuncionarioChartRef!: ElementRef;
  @ViewChild('totalDemandasPorPeriodoChart') private totalDemandasPorPeriodoChartRef!: ElementRef;

  demandas: any[] = [];
  usuarios: any[] = [];
  demandasFiltradas: any[] = [];
  demandasPaginadas: any[] = [];

  totalDemandasAtivas = 0;
  demandasConcluidas = 0;
  tempoMedioResolucaoGeral: number = 0;
  tempoMedioPorUsuario: { nome: string, tempoMedio: number }[] = [];
  funcionarioComMaisDemandas = { nome: 'N/A', quantidade: 0 };
  resumoTexto = '';

  demandasPorFuncionarioChart: Chart | undefined;
  totalDemandasPorPeriodoChart: Chart | undefined;

  filtros = {
    funcionarioId: 'todos',
    prioridade: 'todas',
    dataInicio: '',
    dataFim: ''
  };

  paginaAtual = 1;
  itensPorPagina = 5;

  constructor(
    private painelService: PainelService,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef
  ) {
    Chart.register(...registerables);
  }

  ngOnInit(): void {
    this.carregarDados();
  }

  ngAfterViewInit(): void {
    // Intencionalmente deixado em branco.
  }

  ngOnDestroy(): void {
    this.demandasPorFuncionarioChart?.destroy();
    this.totalDemandasPorPeriodoChart?.destroy();
  }

  carregarDados(): void {
    forkJoin({
      usuarios: this.painelService.getAllUsers(),
      demandas: this.painelService.getAllDemandRecord()
    }).subscribe({
      next: ({ usuarios, demandas }) => {
        this.usuarios = usuarios || [];
        this.demandas = demandas || [];
        this.aplicarFiltros();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.cdr.detectChanges();
      }
    });
  }

  aplicarFiltros(): void {
    let demandasResultantes = [...this.demandas];

    if (this.filtros.funcionarioId !== 'todos') {
      const selectedUser = this.usuarios.find(u => u.id === Number(this.filtros.funcionarioId));
      if (selectedUser) {
        const ownerName = selectedUser.email.split('@')[0];
        demandasResultantes = demandasResultantes.filter(d => d.owner === ownerName);
      }
    }

    if (this.filtros.prioridade !== 'todas') {
      demandasResultantes = demandasResultantes.filter(d => d.priority === Number(this.filtros.prioridade));
    }

    if (this.filtros.dataInicio || this.filtros.dataFim) {
      const dataInicio = this.filtros.dataInicio ? new Date(this.filtros.dataInicio) : null;
      const dataFim = this.filtros.dataFim ? new Date(this.filtros.dataFim) : null;

      if(dataInicio) dataInicio.setHours(0, 0, 0, 0);
      if(dataFim) dataFim.setHours(23, 59, 59, 999);

      demandasResultantes = demandasResultantes.filter(d => {
        const dataDemanda = new Date(d.createdAt);
        
        const afterStart = dataInicio ? dataDemanda >= dataInicio : true;
        const beforeEnd = dataFim ? dataDemanda <= dataFim : true;
        
        return afterStart && beforeEnd;
      });
    }

    this.demandasFiltradas = demandasResultantes;
    this.paginaAtual = 1;
    this.atualizarDashboard();
  }
  
  limparFiltros(): void {
    this.filtros = {
      funcionarioId: 'todos',
      prioridade: 'todas',
      dataInicio: '',
      dataFim: ''
    };
    this.aplicarFiltros();
  }

  private atualizarDashboard(): void {
    this.calcularEstatisticas();
    this.gerarResumoTexto();
    this.atualizarGraficos();
    this.atualizarPaginacao();
  }

  atualizarPaginacao(): void {
    const indiceInicial = (this.paginaAtual - 1) * this.itensPorPagina;
    const indiceFinal = indiceInicial + this.itensPorPagina;
    this.demandasPaginadas = this.demandasFiltradas.slice(indiceInicial, indiceFinal);
    this.cdr.detectChanges();
  }

  irParaPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginas()) {
      this.paginaAtual = pagina;
      this.atualizarPaginacao();
    }
  }

  proximaPagina(): void {
    this.irParaPagina(this.paginaAtual + 1);
  }

  paginaAnterior(): void {
    this.irParaPagina(this.paginaAtual - 1);
  }

  totalPaginas(): number {
    return Math.ceil(this.demandasFiltradas.length / this.itensPorPagina);
  }

  getPaginas(): number[] {
    const total = this.totalPaginas();
    if (total <= 1) return [];
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  private calcularEstatisticas(): void {
    this.totalDemandasAtivas = this.demandasFiltradas.filter(d => d.status !== 'Concluída').length;
    this.demandasConcluidas = this.demandasFiltradas.filter(d => d.status === 'Concluída').length;
    
    // Removido cálculo de demandas atrasadas

    this.calcularTempoMedioResolucao();

    const contagemPorFuncionario: { [key: string]: number } = {};
    this.demandasFiltradas.forEach(demanda => {
      const nome = this.getNomeAbreviado(demanda.owner);
      if (nome && nome !== 'N/A') {
        contagemPorFuncionario[nome] = (contagemPorFuncionario[nome] || 0) + 1;
      }
    });

    let maxDemandas = 0;
    let nomeFuncionario = 'N/A';
    for (const nome in contagemPorFuncionario) {
      if (contagemPorFuncionario[nome] > maxDemandas) {
        maxDemandas = contagemPorFuncionario[nome];
        nomeFuncionario = nome;
      }
    }

    this.funcionarioComMaisDemandas = { nome: nomeFuncionario, quantidade: maxDemandas };
  }
  
  private calculateBusinessDays(startDateStr: string, endDateStr: string): number {
    if (!startDateStr || !endDateStr) {
      return 0;
    }

    let startDate = new Date(startDateStr);
    let endDate = new Date(endDateStr);

    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);

    if (startDate > endDate) {
      return 0;
    }
    
    if (startDate.getTime() === endDate.getTime()) {
        const dayOfWeek = startDate.getDay();
        return (dayOfWeek !== 0 && dayOfWeek !== 6) ? 1 : 0;
    }

    let businessDays = 0;
    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
        const dayOfWeek = currentDate.getDay();
        if (dayOfWeek !== 0 && dayOfWeek !== 6) { 
            businessDays++;
        }
        currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return businessDays;
  }

  private calcularTempoMedioResolucao(): void {
    const demandasConcluidasComDatas = this.demandasFiltradas.filter(
      d => d.status === 'Concluída' && d.createdAt && d.completionDate
    );
  
    if (demandasConcluidasComDatas.length === 0) {
      this.tempoMedioResolucaoGeral = 0;
      this.tempoMedioPorUsuario = [];
      return;
    }
  
    const totalDiasUteis = demandasConcluidasComDatas.reduce((acc, d) => {
      const businessDays = this.calculateBusinessDays(d.createdAt, d.completionDate!);
      return acc + businessDays;
    }, 0);
    this.tempoMedioResolucaoGeral = totalDiasUteis / demandasConcluidasComDatas.length;
  
    const tempoPorUsuario: { [key: string]: number[] } = {};
    demandasConcluidasComDatas.forEach(d => {
      const nome = this.getNomeAbreviado(d.owner);
      if (!tempoPorUsuario[nome]) {
        tempoPorUsuario[nome] = [];
      }
      const businessDays = this.calculateBusinessDays(d.createdAt, d.completionDate!);
      tempoPorUsuario[nome].push(businessDays);
    });
  
    this.tempoMedioPorUsuario = Object.keys(tempoPorUsuario).map(nome => {
      const tempos = tempoPorUsuario[nome];
      const media = tempos.reduce((a, b) => a + b, 0) / tempos.length;
      return { nome, tempoMedio: media };
    });
  }

  private gerarResumoTexto(): void {
    const nome = this.funcionarioComMaisDemandas.nome;
    const qtd = this.funcionarioComMaisDemandas.quantidade;
    // Texto de resumo atualizado sem a parte de atrasadas
    this.resumoTexto = `Hoje temos ${this.totalDemandasAtivas} demandas ativas, ${this.demandasConcluidas} concluídas e ${nome} é o funcionário com mais demandas (${qtd}).`;
  }

  private atualizarGraficos(): void {
    if (this.demandasPorFuncionarioChart) {
      this.demandasPorFuncionarioChart.destroy();
    }
    if (this.totalDemandasPorPeriodoChart) {
      this.totalDemandasPorPeriodoChart.destroy();
    }

    setTimeout(() => {
        this.criarGraficoDemandasPorFuncionario();
        this.criarGraficoTotalDemandasPorPeriodo();
    }, 100);
  }

  private criarGraficoDemandasPorFuncionario(): void {
    if (!this.demandasPorFuncionarioChartRef) return;
  
    const contagemPorFuncionario: { [key: string]: number } = {};
    this.demandasFiltradas.forEach(demanda => {
      const nome = this.getNomeAbreviado(demanda.owner);
      if (nome && nome !== 'N/A') {
        contagemPorFuncionario[nome] = (contagemPorFuncionario[nome] || 0) + 1;
      }
    });
  
    const labels = Object.keys(contagemPorFuncionario);
    const data = Object.values(contagemPorFuncionario);
  
    this.demandasPorFuncionarioChart = new Chart(this.demandasPorFuncionarioChartRef.nativeElement, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Quantidade de Demandas',
          data: data,
          backgroundColor: 'rgba(0, 86, 158, 0.6)',
          borderColor: 'rgba(0, 86, 158, 1)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: { display: true, text: 'Quantidade' }
          },
          x: {
            title: { display: true, text: 'Funcionário' }
          }
        }
      }
    });
  }

  private criarGraficoTotalDemandasPorPeriodo(): void {
    if (!this.totalDemandasPorPeriodoChartRef) return;
  
    const totalPorMes: { [key: string]: number } = {};
    
    // Ordena as demandas por data de criação para garantir a ordem cronológica no gráfico
    const demandasOrdenadas = [...this.demandasFiltradas].sort((a, b) => {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });
  
    demandasOrdenadas.forEach(demanda => {
        // Usa a data de criação para agrupar
        const dataCriacao = new Date(demanda.createdAt);
        if(!isNaN(dataCriacao.getTime())) {
            const mesAno = dataCriacao.toLocaleString('default', { month: 'short', year: '2-digit' });
            totalPorMes[mesAno] = (totalPorMes[mesAno] || 0) + 1;
        }
    });
  
    const labels = Object.keys(totalPorMes);
    const data = Object.values(totalPorMes);
  
    this.totalDemandasPorPeriodoChart = new Chart(this.totalDemandasPorPeriodoChartRef.nativeElement, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Total de Demandas',
          data: data,
          backgroundColor: 'rgba(40, 167, 69, 0.6)', // Cor verde para representar "Total" ou "Crescimento"
          borderColor: 'rgba(40, 167, 69, 1)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: { display: true, text: 'Quantidade' }
          },
          x: {
            title: { display: true, text: 'Período' }
          }
        }
      }
    });
  }
  
  getNomeAbreviado(name: string | null | undefined): string {
    if (!name) return 'N/A';
    const nome = name.split('@')[0];
    return nome.charAt(0).toUpperCase() + nome.slice(1);
  }
}