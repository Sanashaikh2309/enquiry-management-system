import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NgIf, CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  standalone: true,
  selector: 'app-login',
  imports: [FormsModule, NgIf, CommonModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
})
export class Login {
  loginMethod = signal<'email' | 'otp'>('email'); // 'email' or 'otp'
  
  // Email/Password login
  loginObj = { email: '', password: '' };
  
  // OTP login
  otpEmail = signal<string>(''); // CHANGED: phone to otpEmail
  otp = signal<string>('');
  otpSent = signal<boolean>(false);
  otpLoading = signal<boolean>(false);
  otpError = signal<string>('');
  otpSuccess = signal<string>('');
  verifyLoading = signal<boolean>(false);
  loginLoading = signal<boolean>(false);

  constructor(private auth: AuthService, private router: Router) { }

  // ===== TRADITIONAL EMAIL/PASSWORD LOGIN =====
  onLogin() {
    this.loginLoading.set(true);
    this.auth.login(this.loginObj).subscribe({
      next: (res: any) => {
        console.log('Login Response:', res);

        this.auth.saveUser({
          name: res.name,
          email: res.email,
          role: res.role,
          userId: res.userId,
          token: res.token
        });

        console.log('Saved Auth Data:', localStorage.getItem('auth'));

        window.dispatchEvent(
          new CustomEvent('enquiry-login', {
            detail: { username: res.name  }
          })
        );

        alert('Login successful!');

        res.role === 'ADMIN'
          ? this.router.navigate(['/enquiry-list'])
          : this.router.navigate(['/submit-enquiry']);
        
        this.loginLoading.set(false);
      },
      error: (err) => {
        this.loginLoading.set(false);
        alert(err?.error?.message || 'Login failed. Please check your credentials.');
      }
    });
  }

  // ===== OTP LOGIN =====
  sendOTP() {
    const emailValue = this.otpEmail().trim(); // CHANGED: phoneValue to emailValue
    
    if (!emailValue || !emailValue.includes('@')) { // CHANGED: validation for email
      this.otpError.set('Please enter a valid email address');
      return;
    }

    this.otpLoading.set(true);
    this.otpError.set('');
    this.otpSuccess.set('');

    this.auth.sendOTP(emailValue).subscribe({ // CHANGED: parameter name
      next: (res: any) => {
        this.otpLoading.set(false);
        this.otpSent.set(true);
        this.otpSuccess.set('OTP sent to your email!'); // CHANGED: message
      },
      error: (err) => {
        this.otpLoading.set(false);
        this.otpError.set(err?.error?.message || 'Failed to send OTP. Try again.');
      }
    });
  }

  verifyOTP() {
    const emailValue = this.otpEmail().trim(); // CHANGED: phoneValue to emailValue
    const otpValue = this.otp().trim();

    if (!otpValue || otpValue.length !== 6) {
      this.otpError.set('Please enter a valid 6-digit OTP');
      return;
    }

    this.verifyLoading.set(true);
    this.otpError.set('');

    this.auth.verifyOTP(emailValue, otpValue).subscribe({ // CHANGED: parameter name
      next: (res: any) => {
        this.verifyLoading.set(false);
        console.log('OTP Verified:', res);

        this.auth.saveUser({
          name: res.name,
          email: res.email,
          role: res.role,
          userId: res.userId,
          token: res.token
        }); // REMOVED: phone from saveUser

        window.dispatchEvent(
          new CustomEvent('enquiry-login', {
            detail: { username: res.name }
          })
        );

        alert('Login successful!');

        res.role === 'ADMIN'
          ? this.router.navigate(['/enquiry-list'])
          : this.router.navigate(['/submit-enquiry']);
      },
      error: (err) => {
        this.verifyLoading.set(false);
        this.otpError.set(err?.error?.message || 'Invalid OTP. Please try again.');
      }
    });
  }

  // Toggle login method
  switchToOTP() {
    this.loginMethod.set('otp');
    this.otpError.set('');
    this.otpSuccess.set('');
  }

  switchToEmail() {
    this.loginMethod.set('email');
    this.otpError.set('');
    this.otpSuccess.set('');
  }
}