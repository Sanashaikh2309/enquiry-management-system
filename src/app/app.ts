import { Component, signal, NgZone } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { DatePipe, NgIf } from '@angular/common';
import { AuthService } from './services/auth.service'; 

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NgIf, RouterLink, DatePipe],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App {
  isLoggedIn = signal<boolean>(false);
  username = signal<string>('');
  userEmail = signal<string>(''); // ✅ FIX: separate signal for email
  showUserDetailsModal = signal<boolean>(false);
  userData = signal<any>(null);

  constructor(
    private router: Router,
    private zone: NgZone,
    private auth: AuthService 
  ) {
    const user = localStorage.getItem('auth');
    const parsedUser = user ? JSON.parse(user) : null;

    this.isLoggedIn.set(!!parsedUser);
    this.username.set(parsedUser?.name || '');
    this.userEmail.set(parsedUser?.email || ''); // ✅ FIX: set email
    this.userData.set(parsedUser);

    window.addEventListener('enquiry-login', (e: any) => {
      this.zone.run(() => {
        const userData = JSON.parse(localStorage.getItem('auth') || '{}');

        this.isLoggedIn.set(true);
        this.username.set(userData?.name || '');
        this.userEmail.set(userData?.email || ''); // ✅ FIX
        this.userData.set(userData);
      });
    });

    window.addEventListener('enquiry-logout', () => {
      this.zone.run(() => {
        this.isLoggedIn.set(false);
        this.username.set('');
        this.userEmail.set(''); // ✅ FIX
        this.userData.set(null);
        this.showUserDetailsModal.set(false);
      });
    });
  }

  showLoginModal(): void {
    this.router.navigate(['/login']);
  }

  openUserDetailsModal(): void {
    this.showUserDetailsModal.set(true);
  }

  closeUserDetailsModal(): void {
    this.showUserDetailsModal.set(false);
  }

  logout(): void {
    this.auth.logout();

    this.isLoggedIn.set(false);
    this.username.set('');
    this.userEmail.set(''); // ✅ FIX
    this.userData.set(null);
    this.showUserDetailsModal.set(false);

    window.dispatchEvent(new CustomEvent('enquiry-logout'));
    this.router.navigate(['/login']); 
  }
}
