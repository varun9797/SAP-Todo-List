import { Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ButtonVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'outline-primary' | 'outline-danger';
export type ButtonSize = 'sm' | 'md';
export type ButtonType = 'button' | 'submit';

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

    // Output events
    clicked = output<Event>();

    // Computed properties
    buttonClasses = computed(() => {
        const classes = ['btn'];
        classes.push(`btn-${this.variant()}`);
        classes.push(`btn-${this.size()}`);
        if (this.loading()) classes.push('btn-loading');
        return classes.join(' ');
    });

    isDisabled = computed(() => this.disabled() || this.loading());

    onButtonClick(event: Event): void {
        if (!this.isDisabled()) {
            this.clicked.emit(event);
        }
    }
}
