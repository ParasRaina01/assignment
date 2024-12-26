import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { RegisterComponent } from './register.component';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: Router;

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['register']);

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, RouterTestingModule, RegisterComponent],
      providers: [{ provide: AuthService, useValue: authServiceSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Form Initialization', () => {
    it('should initialize with empty form', () => {
      expect(component.registerForm.get('fullName')?.value).toBe('');
      expect(component.registerForm.get('email')?.value).toBe('');
      expect(component.registerForm.get('password')?.value).toBe('');
      expect(component.registerForm.get('confirmPassword')?.value).toBe('');
      expect(component.registerForm.valid).toBeFalse();
    });
  });

  describe('Form Validation', () => {
    it('should validate full name', () => {
      const fullNameControl = component.fullName;

      fullNameControl.setValue('');
      expect(fullNameControl.errors?.['required']).toBeTruthy();

      fullNameControl.setValue('ab');
      expect(fullNameControl.errors?.['minlength']).toBeTruthy();

      fullNameControl.setValue('Test user');
      expect(fullNameControl.errors).toBeNull();
    });

    it('should validate email', () => {
      const emailControl = component.email;

      emailControl.setValue('');
      expect(emailControl.errors?.['required']).toBeTruthy();

      emailControl.setValue('invalid-email');
      expect(emailControl.errors?.['email']).toBeTruthy();

      emailControl.setValue('valid@email.com');
      expect(emailControl.errors).toBeNull();
    });

    it('should validate password', () => {
      const passwordControl = component.password;

      passwordControl.setValue('');
      expect(passwordControl.errors?.['required']).toBeTruthy();

      passwordControl.setValue('12345');
      expect(passwordControl.errors?.['minlength']).toBeTruthy();

      passwordControl.setValue('123456');
      expect(passwordControl.errors).toBeNull();
    });

    it('should validate password match', () => {
      component.registerForm.patchValue({
        password: '123456',
        confirmPassword: '123456',
      });
      expect(component.registerForm.errors?.['mismatch']).toBeFalsy();

      component.registerForm.patchValue({
        password: '123456',
        confirmPassword: '654321',
      });
      expect(component.registerForm.errors?.['mismatch']).toBeTruthy();
    });
  });

  describe('Form Submission', () => {
    const validFormData = {
      fullName: 'Test user',
      email: 'testuser1@gmail.com',
      password: '123456',
      confirmPassword: '123456',
    };

    it('should submit valid form successfully', fakeAsync(() => {
      const navigateSpy = spyOn(router, 'navigate');
      authService.register.and.returnValue(of(void 0));

      component.registerForm.patchValue(validFormData);
      component.onSubmit();
      tick();

      expect(authService.register).toHaveBeenCalledWith(validFormData);
      expect(component.errorMessage).toBe('');
      expect(navigateSpy).toHaveBeenCalledWith(['/login']);
    }));

    it('should handle registration error', fakeAsync(() => {
      const errorMessage = 'Registration failed';
      authService.register.and.returnValue(
        throwError(() => new Error(errorMessage))
      );

      component.registerForm.patchValue(validFormData);
      component.onSubmit();
      tick();

      expect(component.errorMessage).toBe(errorMessage);
    }));

    it('should not submit invalid form', () => {
      const markAllAsTouchedSpy = spyOn(
        component.registerForm,
        'markAllAsTouched'
      );

      component.onSubmit();

      expect(authService.register).not.toHaveBeenCalled();
      expect(markAllAsTouchedSpy).toHaveBeenCalled();
    });

    it('should handle generic error message', fakeAsync(() => {
      authService.register.and.returnValue(throwError(() => new Error()));

      component.registerForm.patchValue(validFormData);
      component.onSubmit();
      tick();

      expect(component.errorMessage).toBe(
        'Registration failed. Please try again.'
      );
    }));
  });
});
