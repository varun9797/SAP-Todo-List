import { TestBed } from '@angular/core/testing';
import { NotificationService } from './notification.service';

describe('NotificationService', () => {
    let service: NotificationService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [NotificationService]
        });
        service = TestBed.inject(NotificationService);
    });

    describe('Initial State', () => {
        it('should be created', () => {
            expect(service).toBeTruthy();
        });

        it('should have no notification initially', () => {
            expect(service.notification()).toBeNull();
        });
    });

    describe('Success Notifications', () => {
        it('should show success notification with default duration', () => {
            const message = 'Success message';
            const title = 'Success Title';

            service.showSuccess(message, title);

            const notification = service.notification();
            expect(notification).toBeTruthy();
            expect(notification?.type).toBe('success');
            expect(notification?.message).toBe(message);
            expect(notification?.title).toBe(title);
            expect(notification?.duration).toBe(4000);
        });

        it('should show success notification with custom duration', () => {
            const message = 'Success message';
            const customDuration = 2000;

            service.showSuccess(message, undefined, customDuration);

            const notification = service.notification();
            expect(notification?.duration).toBe(customDuration);
        });

        it('should show success notification without title', () => {
            const message = 'Success message';

            service.showSuccess(message);

            const notification = service.notification();
            expect(notification?.title).toBeUndefined();
        });
    });

    describe('Error Notifications', () => {
        it('should show error notification with default title and duration', () => {
            const message = 'Error message';

            service.showError(message);

            const notification = service.notification();
            expect(notification).toBeTruthy();
            expect(notification?.type).toBe('error');
            expect(notification?.message).toBe(message);
            expect(notification?.title).toBe('Error');
            expect(notification?.duration).toBe(6000);
        });

        it('should show error notification with custom title', () => {
            const message = 'Error message';
            const title = 'Custom Error';

            service.showError(message, title);

            const notification = service.notification();
            expect(notification?.title).toBe(title);
        });

        it('should show error notification with custom duration', () => {
            const message = 'Error message';
            const customDuration = 3000;

            service.showError(message, undefined, customDuration);

            const notification = service.notification();
            expect(notification?.duration).toBe(customDuration);
        });
    });

    describe('Warning Notifications', () => {
        it('should show warning notification with default title and duration', () => {
            const message = 'Warning message';

            service.showWarning(message);

            const notification = service.notification();
            expect(notification).toBeTruthy();
            expect(notification?.type).toBe('warning');
            expect(notification?.message).toBe(message);
            expect(notification?.title).toBe('Warning');
            expect(notification?.duration).toBe(5000);
        });

        it('should show warning notification with custom title', () => {
            const message = 'Warning message';
            const title = 'Custom Warning';

            service.showWarning(message, title);

            const notification = service.notification();
            expect(notification?.title).toBe(title);
        });
    });

    describe('Info Notifications', () => {
        it('should show info notification with default title and duration', () => {
            const message = 'Info message';

            service.showInfo(message);

            const notification = service.notification();
            expect(notification).toBeTruthy();
            expect(notification?.type).toBe('info');
            expect(notification?.message).toBe(message);
            expect(notification?.title).toBe('Information');
            expect(notification?.duration).toBe(4000);
        });

        it('should show info notification with custom title', () => {
            const message = 'Info message';
            const title = 'Custom Info';

            service.showInfo(message, title);

            const notification = service.notification();
            expect(notification?.title).toBe(title);
        });
    });

    describe('Confirmation Dialogs', () => {
        it('should show confirmation dialog with default settings', () => {
            const message = 'Are you sure?';

            service.showConfirmation(message);

            const notification = service.notification();
            expect(notification).toBeTruthy();
            expect(notification?.type).toBe('confirmation');
            expect(notification?.message).toBe(message);
            expect(notification?.title).toBe('Confirm Action');
            expect(notification?.confirmText).toBe('Confirm');
            expect(notification?.cancelText).toBe('Cancel');
            expect(notification?.duration).toBe(0);
        });

        it('should show confirmation dialog with custom settings', () => {
            const message = 'Delete this item?';
            const title = 'Delete Confirmation';
            const confirmText = 'Yes, Delete';
            const cancelText = 'No, Keep';

            service.showConfirmation(message, title, confirmText, cancelText);

            const notification = service.notification();
            expect(notification?.title).toBe(title);
            expect(notification?.confirmText).toBe(confirmText);
            expect(notification?.cancelText).toBe(cancelText);
        });

        it('should resolve to true when confirmed', async () => {
            const message = 'Are you sure?';
            
            const confirmationPromise = service.showConfirmation(message);
            
            // Simulate confirmation
            service.onConfirmed();
            
            const result = await confirmationPromise;
            expect(result).toBe(true);
            expect(service.notification()).toBeNull();
        });

        it('should resolve to false when cancelled', async () => {
            const message = 'Are you sure?';
            
            const confirmationPromise = service.showConfirmation(message);
            
            // Simulate cancellation
            service.onCancelled();
            
            const result = await confirmationPromise;
            expect(result).toBe(false);
            expect(service.notification()).toBeNull();
        });

        it('should resolve to false when closed without action', (done) => {
            const message = 'Are you sure?';
            
            service.showConfirmation(message).then(result => {
                expect(result).toBe(false);
                done();
            });
            
            // Simulate closing without action
            service.hide();
        });
    });

    describe('Notification Management', () => {
        it('should hide notification', () => {
            service.showSuccess('Test message');
            expect(service.notification()).toBeTruthy();

            service.hide();
            expect(service.notification()).toBeNull();
        });

        it('should clear notification', () => {
            service.showSuccess('Test message');
            expect(service.notification()).toBeTruthy();

            service.clear();
            expect(service.notification()).toBeNull();
        });

        it('should replace existing notification with new one', () => {
            service.showSuccess('First message');
            const firstNotification = service.notification();
            expect(firstNotification?.message).toBe('First message');

            service.showError('Second message');
            const secondNotification = service.notification();
            expect(secondNotification?.message).toBe('Second message');
            expect(secondNotification?.type).toBe('error');
        });
    });

    describe('Confirmation Handlers', () => {
        it('should handle confirmation when notification is not confirmation type', () => {
            service.showSuccess('Success message');
            
            service.onConfirmed();
            
            expect(service.notification()).toBeNull();
        });

        it('should handle cancellation when notification is not confirmation type', () => {
            service.showError('Error message');
            
            service.onCancelled();
            
            expect(service.notification()).toBeNull();
        });

        it('should not error when confirming with no notification', () => {
            expect(() => service.onConfirmed()).not.toThrow();
        });

        it('should not error when cancelling with no notification', () => {
            expect(() => service.onCancelled()).not.toThrow();
        });
    });
});
