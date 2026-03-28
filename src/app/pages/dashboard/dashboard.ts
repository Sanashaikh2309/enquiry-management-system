import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService } from '../../services/dashboard.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class Dashboard implements OnInit {

  role: 'ADMIN' | 'USER' = 'ADMIN'; 
  userId = 0;

  adminData: any = {};
  userData: any = {};

  constructor(
    private dashboardService: DashboardService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.userId = Number(localStorage.getItem('userId')) || 0;
    
    const storedRole = localStorage.getItem('role');
  
    if (storedRole?.toUpperCase() === 'ADMIN') {
      this.role = 'ADMIN';
      this.loadAdminDashboard();
    } else {
      this.role = 'USER';
      this.loadUserDashboard();
    }
  }

  loadAdminDashboard(): void {
    this.dashboardService.getAdminDashboard().subscribe({
      next: (res: any) => {
        this.adminData = res.data;   
        console.log(this.adminData);
        this.cdr.detectChanges();
      },
      error: err => console.error(err)
    });
  }
  
  loadUserDashboard(): void {
    this.dashboardService.getUserDashboard(this.userId).subscribe({
      next: (res: any) => {
        this.userData = res.data;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
      }
    });
  }
}