import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EnquiryView } from './enquiry-view';

describe('EnquiryView', () => {
  let component: EnquiryView;
  let fixture: ComponentFixture<EnquiryView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EnquiryView]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EnquiryView);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
