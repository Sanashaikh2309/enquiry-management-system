import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class UserGuard implements CanActivate {

  constructor(private router: Router) {}

  canActivate(): boolean {
    const token = localStorage.getItem('token');  
    const role = localStorage.getItem('role');

    if (!token || !role) {              // ✅ added: block if not logged in
      this.router.navigate(['/login']); 
      return false;                     
    }

    if (role === 'USER' || role === 'ADMIN') {  // ✅ added: allow both roles
      return true;
    }

    this.router.navigate(['/login']);
    return false;
  }
}
