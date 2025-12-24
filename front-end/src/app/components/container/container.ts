import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-container',
  standalone: false,
  templateUrl: './container.html',
  styleUrl: './container.scss'
})

export class Container {
  @Input() customStyles: { [klass: string]: any } = {};
}
