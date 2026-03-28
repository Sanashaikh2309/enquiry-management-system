import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NgIf, CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  standalone: true,
  selector: 'app-register',
  imports: [FormsModule, NgIf, CommonModule, RouterLink],
  templateUrl: './register.html',
  styleUrls: ['./register.css']
})
export class Register {

  registerObj = { name: '', email: '', password: '', phone: '' };
  isLoading = signal<boolean>(false);
  errorMessage = signal<string>('');

  constructor(private auth: AuthService, private router: Router) {}

  onRegister() {
    const { name, email, password, phone } = this.registerObj;

    // Validation
    if (!name || !email || !password || !phone) {
      this.errorMessage.set('All fields are required');
      return;
    }

    if (phone.length < 10) {
      this.errorMessage.set('Phone number must be at least 10 digits');
      return;
    }

    if (password.length < 6) {
      this.errorMessage.set('Password must be at least 6 characters');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    this.auth.register(this.registerObj).subscribe({
      next: () => {
        this.isLoading.set(false);
        alert('Registration successful! Please login with your credentials.');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err?.error?.message || 'Registration failed. Please try again.');
      }
    });
  }
}
