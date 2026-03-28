import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MasterService } from '../../services/master-service';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';
import { IEnquiry } from '../../model/interface/Master.model';

@Component({
  selector: 'app-enquiry-edit',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf],
  templateUrl: './enquiry-edit.html',
  styleUrls: ['./enquiry-edit.css'],
})
export class EnquiryEdit implements OnInit {

  private masterService = inject(MasterService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef);

  enquiry!: IEnquiry;
  editForm!: FormGroup;

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = Number(params.get('id'));
      if (!id) return;

      this.masterService.getEnquiryById(id).subscribe((res: any) => {
        this.enquiry = res.data;
        this.initForm();
        this.cdr.detectChanges(); // ensures immediate rendering
      });
    });
  }

  initForm() {
    this.editForm = this.fb.group({
      customerName: [this.enquiry.customerName],
      customerPhone: [this.enquiry.customerPhone],
      enquiryType: [this.enquiry.enquiryType],
      feedback: [this.enquiry.feedback],
      isConverted: [this.enquiry.isConverted],
      statusId: [this.enquiry.statusId]
    });
  }

  saveChanges(): void {
    if (!this.enquiry.enquiryId) return;

    this.masterService.updateEnquiry(this.enquiry.enquiryId, this.editForm.value)
      .subscribe(() => {
        alert('Enquiry updated successfully');
        this.router.navigate(['/enquiry', this.enquiry.enquiryId]);
      });
  }

  deleteEnquiry(): void {
    if (!this.enquiry.enquiryId) return;

    if (!confirm('Are you sure you want to delete this enquiry?')) return;

    this.masterService.deleteEnquiry(this.enquiry.enquiryId)
      .subscribe(() => {
        alert('Enquiry deleted successfully');
        this.router.navigate(['/enquiry-list']);
      });
  }
}
