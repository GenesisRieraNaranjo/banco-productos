import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirm-dialog.component.html',
  styleUrl: './confirm-dialog.component.scss'
})
export class ConfirmDialogComponent {

  @Input() title = '';
  @Input() message = '';
  @Input() visible = false;

  @Output() confirmed = new EventEmitter<void>();

  onConfirm(): void {
    this.confirmed.emit();
  }
}