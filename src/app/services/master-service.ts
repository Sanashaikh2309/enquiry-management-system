import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { IApiResponseModel, IEnquiry } from '../model/interface/Master.model';

@Injectable({
  providedIn: 'root'
})
export class MasterService {

  constructor(private http: HttpClient) {}

  getAllCategory() {
    return this.http
      .get<IApiResponseModel>('http://localhost:5000/api/master/categories')
      .pipe(map(response => response.data));
  }

  getAllStatus() {
    return this.http
      .get<IApiResponseModel>('http://localhost:5000/api/master/statuses')
      .pipe(map(res => res.data));
  }

  getAllEnquiries() {
    return this.http
      .get<IApiResponseModel>('http://localhost:5000/api/enquiry/all')
      .pipe(map(res => res.data));
  }

  saveNewEnquiry(obj: IEnquiry) {
    return this.http.post(
      'http://localhost:5000/api/enquiry/create',
      obj
    );
  }

  updateConverted(id: number, value: boolean) {
    return this.http.patch(
      `http://localhost:5000/api/enquiry/${id}/convert`,
      { isConverted: value }
    );
  }

  getEnquiryById(id: number) {
    return this.http.get<any>(
      `http://localhost:5000/api/enquiry/${id}`
    );
  }

  updateEnquiry(id: number, obj: any) {
    return this.http.put(
      `http://localhost:5000/api/enquiry/${id}`,
      obj
    );
  }

  deleteEnquiry(id: number) {
    return this.http.delete(
      `http://localhost:5000/api/enquiry/${id}`
    );
  }
}
