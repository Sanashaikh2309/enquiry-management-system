import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { Subscription } from 'rxjs';
import { DatePipe, NgFor } from '@angular/common';
import { Router } from '@angular/router';
import { MasterService } from '../../services/master-service';
import { IEnquiry } from '../../model/interface/Master.model';

@Component({
  selector: 'app-enquiry-list',
  standalone: true,
  templateUrl: './enquiry-list.html',
  styleUrls: ['./enquiry-list.css'],
  imports: [NgFor, DatePipe]
})
export class EnquiryList implements OnInit, OnDestroy {

  private masterService = inject(MasterService);
  private router = inject(Router);
  enquiryList: IEnquiry[] = [];
  private sub!: Subscription;

  ngOnInit(): void {
    this.sub = this.masterService.getAllEnquiries().subscribe({
      next: (data: IEnquiry[]) => {
        console.log('Fetched enquiries:', data);
        this.enquiryList = data;
      },
      error: (err: any) => {
        console.error('API error', err);
        this.enquiryList = [];
      }
    });
  }

  ngOnDestroy(): void {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }

  toggleConverted(item: IEnquiry) {
  if (item.enquiryId == null) {
    return;
  }

  this.masterService
    .updateConverted(item.enquiryId, !item.isConverted)
    .subscribe({
      next: () => {
        item.isConverted = !item.isConverted;
      }
    });
}


  view(id: number) {
    this.router.navigate(['/enquiry', id]);
  }

  edit(id: number) {
    this.router.navigate(['/enquiry-edit', id]);
  }
}


