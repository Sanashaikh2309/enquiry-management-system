import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription, Observable } from 'rxjs';   

import { MasterService } from '../../services/master-service';
import { EnquiryModel } from '../../model/class/Enquiry.Model';
import { CommonImports } from '../../Global.constant';

@Component({
  selector: 'app-submit-enquiry',
  standalone: true,
  imports: [...CommonImports],
  templateUrl: './submit-enquiry.html',
  styleUrls: ['./submit-enquiry.css']
})
export class SubmitEnquiry implements OnInit, OnDestroy {

  masterService = inject(MasterService);

  newEnquiryObj: EnquiryModel = new EnquiryModel();
  subscription!: Subscription;

  $categoryList!: Observable<any[]>;   
  $statusList!: Observable<any[]>;     

  ngOnInit(): void {
    // set logged-in user id
    this.newEnquiryObj.createdBy = Number(localStorage.getItem('userId'));

    // ✅ ADDED
    this.$categoryList = this.masterService.getAllCategory();
    this.$statusList = this.masterService.getAllStatus();
  }

  onSaveEnquiry(): void {
    this.newEnquiryObj.statusId = 1;

    this.subscription = this.masterService
      .saveNewEnquiry(this.newEnquiryObj)
      .subscribe({
        next: () => {
          alert('Enquiry submitted successfully');
          this.newEnquiryObj = new EnquiryModel();
          this.newEnquiryObj.createdBy = Number(localStorage.getItem('userId'));
        },
        error: (err: any) => {
          console.error(err);
          alert('Something went wrong');
        }
      });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
