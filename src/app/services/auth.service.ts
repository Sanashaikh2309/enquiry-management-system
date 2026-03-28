import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private api = 'http://localhost:5000/api/auth';

  constructor(private http: HttpClient, private router: Router) {}

  login(data: any) {
    return this.http.post<any>(`${this.api}/login`, data);
  }

  register(data: any) {
    return this.http.post<any>(`${this.api}/register`, data);
  }

  // OTP Login - Step 1: Send OTP to email
  sendOTP(email: string) {
    return this.http.post<any>(`${this.api}/send-otp`, { email });
  }

  // OTP Login - Step 2: Verify OTP
  verifyOTP(email: string, otp: string) {
    return this.http.post<any>(`${this.api}/verify-otp`, { email, otp });
  }

  saveUser(data: any) {
    localStorage.setItem('auth', JSON.stringify(data));
    localStorage.setItem('token', data.token);
    localStorage.setItem('role', data.role);
    localStorage.setItem('userId', data.userId);
  }

  getRole() {
    return localStorage.getItem('role');
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  logout() {
    localStorage.clear();

    window.dispatchEvent(new CustomEvent('enquiry-logout'));

    this.router.navigate(['/login']);
  }
}