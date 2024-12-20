import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { Router } from '@angular/router';

export interface User {
  id?: string;
  fullName: string;
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;

  constructor(private router: Router) {
    const storedUser = localStorage.getItem('currentUser');
    this.currentUserSubject = new BehaviorSubject<User | null>(storedUser ? JSON.parse(storedUser) : null);
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  register(userData: { fullName: string; email: string; password: string; confirmPassword: string }): Observable<void> {
    try {
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      if (users.some((u: User) => u.email === userData.email)) {
        return throwError(() => new Error('Email already exists'));
      }

      if (userData.password !== userData.confirmPassword) {
        return throwError(() => new Error('Passwords do not match'));
      }

      const newUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        fullName: userData.fullName,
        email: userData.email,
        password: userData.password
      };

      users.push(newUser);
      localStorage.setItem('users', JSON.stringify(users));
      this.router.navigate(['/login']);
      return of(void 0);
    } catch (error) {
      return throwError(() => new Error('Registration failed. Please try again.'));
    }
  }

  login(email: string, password: string): Observable<void> {
    try {
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const user = users.find((u: User) => u.email === email && u.password === password);
      
      if (user) {
        const { password: _, ...userWithoutPassword } = user;
        localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
        this.currentUserSubject.next(userWithoutPassword);
        this.router.navigate(['/dashboard']);
        return of(void 0);
      }
      
      return throwError(() => new Error('Invalid email or password'));
    } catch (error) {
      return throwError(() => new Error('Login failed. Please try again.'));
    }
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    return !!this.currentUserValue;
  }
}
