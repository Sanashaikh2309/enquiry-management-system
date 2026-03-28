import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MasterService } from '../../services/master-service';
import { DatePipe, NgIf } from '@angular/common';

@Component({
  selector: 'app-enquiry-view',
  standalone: true,
  imports: [NgIf, DatePipe],
  templateUrl: './enquiry-view.html',
  styleUrls: ['./enquiry-view.css'], // corrected from styleUrl → styleUrls
})
export class EnquiryView implements OnInit {

  private masterService = inject(MasterService);
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);

  enquiry: any;

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = Number(params.get('id'));

      if (!id) {
        return;
      }

      this.masterService
        .getEnquiryById(id)
        .subscribe((res: any) => {
          this.enquiry = res.data;
          this.cdr.detectChanges(); 
        });
    });
  }

  toggleConverted(enquiry: any) {
    if (!enquiry.enquiryId) return;

    this.masterService
      .updateConverted(enquiry.enquiryId, !enquiry.isConverted)
      .subscribe(() => {
        enquiry.isConverted = !enquiry.isConverted;
        this.cdr.detectChanges();
      });
  }

  view(id: number) {
    // Add navigation if needed
  }

  edit(id: number) {
    // Add navigation if needed
  }
}
