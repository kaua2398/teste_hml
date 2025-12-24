import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Container } from './container';


@NgModule({
  declarations: [Container],
  imports: [CommonModule],
  exports: [Container]
})
export class ContainerModule {}
