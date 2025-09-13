import { Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ButtonVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark' | 'outline-primary' | 'outline-secondary' | 'outline-success' | 'outline-danger' | 'outline-warning' | 'outline-info';
export type ButtonSize = 'sm' | 'md' | 'lg';
export type ButtonType = 'button' | 'submit' | 'reset';

@Component({
    selector: 'app-button',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './button.component.html',
    styleUrl: './button.component.scss'
})
export class ButtonComponent {
    // Input properties
    variant = input<ButtonVariant>('primary');
    size = input<ButtonSize>('md');
    type = input<ButtonType>('button');
    disabled = input<boolean>(false);
    loading = input<boolean>(false);
    fullWidth = input<boolean>(false);
    icon = input<string | null>(null);
    iconPosition = input<'left' | 'right'>('left');
    loadingText = input<string>('Loading...');

    // Output events
    clicked = output<Event>();

    // Computed properties
    buttonClasses = computed(() => {
        const classes = ['btn'];

        // Add variant class
        classes.push(`btn-${this.variant()}`);

        // Add size class
        classes.push(`btn-${this.size()}`);

        // Add additional classes
        if (this.fullWidth()) classes.push('btn-full-width');
        if (this.loading()) classes.push('btn-loading');

        return classes.join(' ');
    });

    isDisabled = computed(() => this.disabled() || this.loading());

    displayText = computed(() => {
        return this.loading() ? this.loadingText() : '';
    });

    onButtonClick(event: Event): void {
        if (!this.isDisabled()) {
            this.clicked.emit(event);
        }
    }
}
