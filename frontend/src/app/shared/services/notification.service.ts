import { Injectable, signal } from '@angular/core';
import { NotificationData, NotificationType } from '../components/notification/notification.component';

interface ConfirmationData extends NotificationData {
    resolveCallback?: (value: boolean) => void;
}

@Injectable({
    providedIn: 'root'
})
export class NotificationService {
    private currentNotification = signal<ConfirmationData | null>(null);

    // Expose as readonly signal
    readonly notification = this.currentNotification.asReadonly();

    private defaultDurations: Record<NotificationType, number> = {
        success: 4000,
        error: 6000,
        warning: 5000,
        info: 4000,
        confirmation: 0 // No auto-hide for confirmations
    };

    /**
     * Show a success notification
     */
    showSuccess(message: string, title?: string, duration?: number): void {
        this.show({
            type: 'success',
            title,
            message,
            duration: duration ?? this.defaultDurations.success
        });
    }    /**
     * Show an error notification
     */
    showError(message: string, title?: string, duration?: number): void {
        this.show({
            type: 'error',
            title: title ?? 'Error',
            message,
            duration: duration ?? this.defaultDurations.error
        });
    }

    /**
     * Show a warning notification
     */
    showWarning(message: string, title?: string, duration?: number): void {
        this.show({
            type: 'warning',
            title: title ?? 'Warning',
            message,
            duration: duration ?? this.defaultDurations.warning
        });
    }

    /**
     * Show an info notification
     */
    showInfo(message: string, title?: string, duration?: number): void {
        this.show({
            type: 'info',
            title: title ?? 'Information',
            message,
            duration: duration ?? this.defaultDurations.info
        });
    }

    /**
     * Show a confirmation dialog
     */
    showConfirmation(
        message: string,
        title?: string,
        confirmText?: string,
        cancelText?: string
    ): Promise<boolean> {
        return new Promise((resolve) => {
            const notification: ConfirmationData = {
                type: 'confirmation',
                title: title ?? 'Confirm Action',
                message,
                confirmText: confirmText ?? 'Confirm',
                cancelText: cancelText ?? 'Cancel',
                duration: 0,
                resolveCallback: resolve
            };

            this.show(notification);

            // Create a one-time listener for the result
            const checkResult = (): void => {
                if (!this.currentNotification()) {
                    // Notification was closed without explicit confirm/cancel
                    resolve(false);
                } else {
                    // Keep checking
                    setTimeout(checkResult, 100);
                }
            };

            setTimeout(checkResult, 100);
        });
    }

    /**
     * Handle confirmation result
     */
    onConfirmed(): void {
        const current = this.currentNotification();
        if (current && current.type === 'confirmation' && current.resolveCallback) {
            current.resolveCallback(true);
        }
        this.hide();
    }

    /**
     * Handle cancellation result
     */
    onCancelled(): void {
        const current = this.currentNotification();
        if (current && current.type === 'confirmation' && current.resolveCallback) {
            current.resolveCallback(false);
        }
        this.hide();
    }

    /**
     * Show a custom notification
     */
    show(notification: ConfirmationData): void {
        this.currentNotification.set(notification);
    }    /**
     * Hide the current notification
     */
    hide(): void {
        this.currentNotification.set(null);
    }

    /**
     * Clear any existing notification
     */
    clear(): void {
        this.hide();
    }
}
