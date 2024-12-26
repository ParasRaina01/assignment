import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: Router;

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['login']);
    
    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        RouterTestingModule,
        LoginComponent
      ],
      providers: [
        { provide: AuthService, useValue: authServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
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
      expect(component.loginForm.get('email')?.value).toBe('');
      expect(component.loginForm.get('password')?.value).toBe('');
      expect(component.loginForm.valid).toBeFalse();
    });
  });

  describe('Form Validation', () => {
    it('should validate email format', () => {
      const emailControl = component.email;
      
      emailControl.setValue('invalid-email');
      expect(emailControl.errors?.['email']).toBeTruthy();
      
      emailControl.setValue('valid@email.com');
      expect(emailControl.errors).toBeNull();
    });

    it('should validate password length', () => {
      const passwordControl = component.password;
      
      passwordControl.setValue('12345');
      expect(passwordControl.errors?.['minlength']).toBeTruthy();
      
      passwordControl.setValue('123456');
      expect(passwordControl.errors).toBeNull();
    });
  });

  describe('Form Submission', () => {
    it('should not call auth service if form is invalid', () => {
      component.onSubmit();
      expect(authService.login).not.toHaveBeenCalled();
    });

    it('should call auth service on valid form submission', fakeAsync(() => {
      const testEmail = 'test@example.com';
      const testPassword = '123456';
      
      authService.login.and.returnValue(of(void 0));
      
      component.loginForm.setValue({
        email: testEmail,
        password: testPassword
      });
      
      component.onSubmit();
      tick();

      expect(authService.login).toHaveBeenCalledWith(testEmail, testPassword);
    }));

    it('should handle login error', fakeAsync(() => {
      const errorMessage = 'Invalid credentials';
      authService.login.and.returnValue(throwError(() => new Error(errorMessage)));
      
      component.loginForm.setValue({
        email: 'test@example.com',
        password: '123456'
      });
      
      component.onSubmit();
      tick();

      expect(component.errorMessage).toBe(errorMessage);
    }));
  });
});
