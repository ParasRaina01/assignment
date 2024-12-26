import { TestBed } from '@angular/core/testing';
import { AuthService, User } from './auth.service';
import { Router } from '@angular/router';

describe('AuthService', () => {
  let service: AuthService;
  let routerSpy: jasmine.SpyObj<Router>;

  const createNewServiceInstance = () => {
    TestBed.resetTestingModule();
    const routerMock = jasmine.createSpyObj('Router', ['navigate']);
    TestBed.configureTestingModule({
      providers: [AuthService, { provide: Router, useValue: routerMock }],
    });
    service = TestBed.inject(AuthService);
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  };

  beforeEach(() => {
    localStorage.clear();
    createNewServiceInstance();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('register', () => {
    const validRegistrationData = {
      fullName: 'Test user',
      email: 'testuser1@gmail.com',
      password: 'password123',
      confirmPassword: 'password123',
    };

    it('should register a new user successfully', (done) => {
      service.register(validRegistrationData).subscribe({
        next: () => {
          const users = JSON.parse(localStorage.getItem('users') || '[]');
          expect(users.length).toBe(1);
          expect(users[0].email).toBe('testuser1@gmail.com');
          expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
          done();
        },
        error: () => {
          fail('Expected success but got an error');
        },
      });
    });

    it('should throw an error if email already exists', (done) => {
      localStorage.setItem(
        'users',
        JSON.stringify([
          {
            fullName: 'Test user',
            email: 'testuser1@gmail.com',
            password: 'password123',
          },
        ])
      );

      service.register(validRegistrationData).subscribe({
        next: () => {
          fail('Expected an error but got success');
        },
        error: (error) => {
          expect(error.message).toBe('Email already exists');
          done();
        },
      });
    });

    it('should throw an error if passwords do not match', (done) => {
      const invalidData = {
        ...validRegistrationData,
        confirmPassword: 'wrongPassword',
      };

      service.register(invalidData).subscribe({
        next: () => {
          fail('Expected an error but got success');
        },
        error: (error) => {
          expect(error.message).toBe('Passwords do not match');
          done();
        },
      });
    });
  });

  describe('login', () => {
    const testUser = {
      fullName: 'Test user',
      email: 'testuser1@gmail.com',
      password: 'password123',
    };

    it('should login successfully with correct credentials', (done) => {
      localStorage.setItem('users', JSON.stringify([testUser]));

      service.login('testuser1@gmail.com', 'password123').subscribe({
        next: () => {
          const currentUser = JSON.parse(
            localStorage.getItem('currentUser') || '{}'
          );
          expect(currentUser.email).toBe('testuser1@gmail.com');
          expect(currentUser.password).toBeUndefined();
          expect(routerSpy.navigate).toHaveBeenCalledWith(['/dashboard']);
          done();
        },
        error: () => {
          fail('Expected success but got an error');
        },
      });
    });

    it('should throw an error if credentials are invalid', (done) => {
      service.login('testuser1@gmail.com', 'wrongPassword').subscribe({
        next: () => {
          fail('Expected an error but got success');
        },
        error: (error) => {
          expect(error.message).toBe('Invalid email or password');
          done();
        },
      });
    });
  });

  describe('logout', () => {
    it('should logout the current user', () => {
      localStorage.setItem(
        'currentUser',
        JSON.stringify({ fullName: 'Test user', email: 'testuser1@gmail.com' })
      );
      createNewServiceInstance();

      service.logout();

      expect(localStorage.getItem('currentUser')).toBeNull();
      expect(service.currentUserValue).toBeNull();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
    });
  });

  describe('isAuthenticated', () => {
    it('should return true if a user is logged in', () => {
      const user = { fullName: 'Test user', email: 'testuser1@gmail.com' };
      localStorage.setItem('currentUser', JSON.stringify(user));
      createNewServiceInstance();

      const result = service.isAuthenticated();
      expect(result).toBeTrue();
    });

    it('should return false if no user is logged in', () => {
      localStorage.removeItem('currentUser');
      createNewServiceInstance();

      const result = service.isAuthenticated();
      expect(result).toBeFalse();
    });
  });

  describe('currentUserValue', () => {
    it('should return the currently logged-in user', () => {
      const user: User = {
        fullName: 'Test user',
        email: 'testuser1@gmail.com',
        password: 'password123',
      };
      localStorage.setItem('currentUser', JSON.stringify(user));
      createNewServiceInstance();

      const result = service.currentUserValue;
      expect(result).toEqual(user);
    });

    it('should return null if no user is logged in', () => {
      localStorage.clear();
      createNewServiceInstance();

      const result = service.currentUserValue;
      expect(result).toBeNull();
    });
  });
});
