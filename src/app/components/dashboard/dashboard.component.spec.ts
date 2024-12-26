import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { Router } from '@angular/router';
import { DashboardComponent } from './dashboard.component';
import { AuthService, User } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { BehaviorSubject } from 'rxjs';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;
  let currentUserSubject: BehaviorSubject<User | null>;

  const mockUser: User = {
    fullName: 'Test User',
    email: 'testuser1@gmail.com',
    password: 'password123',
  };

  beforeEach(async () => {
    currentUserSubject = new BehaviorSubject<User | null>(null);

    authService = jasmine.createSpyObj(
      'AuthService',
      ['isAuthenticated', 'logout'],
      {
        currentUserValue: currentUserSubject.value,
      }
    );

    router = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [CommonModule],
      declarations: [],
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: Router, useValue: router },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should redirect to login page when user is not authenticated', fakeAsync(() => {
      authService.isAuthenticated.and.returnValue(false);
      component.ngOnInit();
      tick();
      expect(router.navigate).toHaveBeenCalledWith(['/login']);
      expect(component.currentUser).toBeNull();
    }));

    it('should set currentUser when user is authenticated', fakeAsync(() => {
      authService.isAuthenticated.and.returnValue(true);
      currentUserSubject.next(mockUser);
      Object.defineProperty(authService, 'currentUserValue', {
        get: () => currentUserSubject.value,
      });
      component.ngOnInit();
      tick();
      expect(router.navigate).not.toHaveBeenCalled();
      expect(component.currentUser).toEqual(mockUser);
    }));
  });

  describe('logout', () => {
    it('should call authService.logout when logout is called', () => {
      component.logout();
      expect(authService.logout).toHaveBeenCalled();
    });
  });

  describe('Template Rendering', () => {
    it('should display user information when currentUser is set', () => {
      component.currentUser = mockUser;
      fixture.detectChanges();

      const compiled = fixture.nativeElement;
      expect(compiled.textContent).toContain(mockUser.fullName);
      expect(compiled.textContent).toContain(mockUser.email);
    });

    it('should not display user information when currentUser is null', () => {
      component.currentUser = null;
      fixture.detectChanges();

      const compiled = fixture.nativeElement;
      expect(compiled.textContent).not.toContain('Test User');
      expect(compiled.textContent).not.toContain('testuser1@gmail.com');
    });
  });
});
