import { Component, Output, EventEmitter, signal, effect, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../button/button.component';

export type NotificationType = 'success' | 'error' | 'warning' | 'info' | 'confirmation';

export interface NotificationData {
  type: NotificationType;
  title?: string;
  message: string;
  duration?: number; // Auto-hide duration in milliseconds, 0 = no auto-hide
  confirmText?: string; // For confirmation dialogs
  cancelText?: string; // For confirmation dialogs
}

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  templateUrl: './notification.component.html',
  styleUrl: './notification.component.scss'
})
export class NotificationComponent {
  notification = input<NotificationData | null>(null);
  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();
  @Output() closed = new EventEmitter<void>();

  isVisible = signal(false);
  private autoHideTimer: number | null = null;

  constructor() {
    // Watch for changes to notification input
    effect(() => {
      const notif = this.notification();
      if (notif) {
        this.show();
        this.startAutoHide();
      } else {
        this.hide();
      }
    });
  }

  private show(): void {
    this.isVisible.set(true);
  }

  private hide(): void {
    this.isVisible.set(false);
    this.clearAutoHideTimer();
  }

  private startAutoHide(): void {
    const currentNotification = this.notification();
    if (!currentNotification) return;

    const duration = currentNotification.duration ?? 5000; // Default 5 seconds

    // Don't auto-hide confirmation dialogs
    if (currentNotification.type === 'confirmation' || duration === 0) {
      return;
    }

    this.clearAutoHideTimer();
    this.autoHideTimer = window.setTimeout(() => {
      this.close();
    }, duration);
  }

  private clearAutoHideTimer(): void {
    if (this.autoHideTimer) {
      clearTimeout(this.autoHideTimer);
      this.autoHideTimer = null;
    }
  }

  close(): void {
    this.hide();
    this.closed.emit();
  }

  confirm(): void {
    this.confirmed.emit();
    this.close();
  }

  cancel(): void {
    this.cancelled.emit();
    this.close();
  }

  getIconClass(): string {
    const currentNotification = this.notification();
    if (!currentNotification) return '';

    switch (currentNotification.type) {
      case 'success': return 'icon-success';
      case 'error': return 'icon-error';
      case 'warning': return 'icon-warning';
      case 'info': return 'icon-info';
      case 'confirmation': return 'icon-question';
      default: return '';
    }
  }

  getNotificationClass(): string {
    const currentNotification = this.notification();
    if (!currentNotification) return '';
    return `notification-${currentNotification.type}`;
  }
}
