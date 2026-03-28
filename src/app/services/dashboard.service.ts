
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  constructor(private http: HttpClient) {}

  getAdminDashboard() {
    return this.http.get('http://localhost:5000/api/dashboard/admin');
  }

  
  getUserDashboard(userId: number) {
    return this.http.get(
      `http://localhost:5000/api/dashboard/user/${userId}`
    );
  }

}
