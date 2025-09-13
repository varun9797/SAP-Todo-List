import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ButtonComponent } from './button.component';

describe('ButtonComponent', () => {
    let component: ButtonComponent;
    let fixture: ComponentFixture<ButtonComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ButtonComponent]
        }).compileComponents();

        fixture = TestBed.createComponent(ButtonComponent);
        component = fixture.componentInstance;
    });

    describe('Component Initialization', () => {
        it('should create', () => {
            expect(component).toBeTruthy();
        });

        it('should have default values', () => {
            expect(component.variant()).toBe('primary');
            expect(component.size()).toBe('md');
            expect(component.disabled()).toBe(false);
            expect(component.loading()).toBe(false);
        });
    });

    describe('Variant Classes', () => {
        it('should apply primary variant class', () => {
            fixture.componentRef.setInput('variant', 'primary');
            fixture.detectChanges();

            const button = fixture.debugElement.query(By.css('button'));
            expect(button.nativeElement.className).toContain('btn-primary');
        });

        it('should apply secondary variant class', () => {
            fixture.componentRef.setInput('variant', 'secondary');
            fixture.detectChanges();

            const button = fixture.debugElement.query(By.css('button'));
            expect(button.nativeElement.className).toContain('btn-secondary');
        });

        it('should apply outline-danger variant class', () => {
            fixture.componentRef.setInput('variant', 'outline-danger');
            fixture.detectChanges();

            const button = fixture.debugElement.query(By.css('button'));
            expect(button.nativeElement.className).toContain('btn-outline-danger');
        });

        it('should apply danger variant class', () => {
            fixture.componentRef.setInput('variant', 'danger');
            fixture.detectChanges();

            const button = fixture.debugElement.query(By.css('button'));
            expect(button.nativeElement.className).toContain('btn-danger');
        });

        it('should apply success variant class', () => {
            fixture.componentRef.setInput('variant', 'success');
            fixture.detectChanges();

            const button = fixture.debugElement.query(By.css('button'));
            expect(button.nativeElement.className).toContain('btn-success');
        });
    });

    describe('Size Classes', () => {
        it('should apply small size class', () => {
            fixture.componentRef.setInput('size', 'sm');
            fixture.detectChanges();

            const button = fixture.debugElement.query(By.css('button'));
            expect(button.nativeElement.className).toContain('btn-sm');
        });

        it('should apply medium size class', () => {
            fixture.componentRef.setInput('size', 'md');
            fixture.detectChanges();

            const button = fixture.debugElement.query(By.css('button'));
            expect(button.nativeElement.className).toContain('btn-md');
        });
    });

    describe('State Classes', () => {
        it('should be disabled when disabled input is true', () => {
            fixture.componentRef.setInput('disabled', true);
            fixture.detectChanges();

            const button = fixture.debugElement.query(By.css('button'));
            expect(button.nativeElement.disabled).toBe(true);
        });

        it('should apply loading class when loading', () => {
            fixture.componentRef.setInput('loading', true);
            fixture.detectChanges();

            const button = fixture.debugElement.query(By.css('button'));
            expect(button.nativeElement.className).toContain('btn-loading');
        });

        it('should be disabled when loading', () => {
            fixture.componentRef.setInput('loading', true);
            fixture.detectChanges();

            expect(component.isDisabled()).toBe(true);
        });
    });

    describe('Click Handling', () => {
        it('should emit clicked event when button is clicked', () => {
            spyOn(component.clicked, 'emit');

            const button = fixture.debugElement.query(By.css('button'));
            button.nativeElement.click();

            expect(component.clicked.emit).toHaveBeenCalled();
        });

        it('should not emit clicked event when button is disabled', () => {
            fixture.componentRef.setInput('disabled', true);
            fixture.detectChanges();
            spyOn(component.clicked, 'emit');

            const button = fixture.debugElement.query(By.css('button'));
            button.nativeElement.click();

            expect(component.clicked.emit).not.toHaveBeenCalled();
        });

        it('should not emit clicked event when button is loading', () => {
            fixture.componentRef.setInput('loading', true);
            fixture.detectChanges();
            spyOn(component.clicked, 'emit');

            const button = fixture.debugElement.query(By.css('button'));
            button.nativeElement.click();

            expect(component.clicked.emit).not.toHaveBeenCalled();
        });
    });

    describe('Button Type', () => {
        it('should have default button type', () => {
            fixture.detectChanges();

            const button = fixture.debugElement.query(By.css('button'));
            expect(button.nativeElement.type).toBe('button');
        });

        it('should accept custom button type', () => {
            fixture.componentRef.setInput('type', 'submit');
            fixture.detectChanges();

            const button = fixture.debugElement.query(By.css('button'));
            expect(button.nativeElement.type).toBe('submit');
        });
    });

    describe('Computed Classes', () => {
        it('should compute all classes correctly', () => {
            fixture.componentRef.setInput('variant', 'outline-danger');
            fixture.componentRef.setInput('size', 'sm');
            fixture.componentRef.setInput('loading', true);
            fixture.detectChanges();

            const classes = component.buttonClasses();
            expect(classes).toContain('btn');
            expect(classes).toContain('btn-outline-danger');
            expect(classes).toContain('btn-sm');
            expect(classes).toContain('btn-loading');
        });
    });
});
