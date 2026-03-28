import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EnquiryEdit } from './enquiry-edit';

describe('EnquiryEdit', () => {
  let component: EnquiryEdit;
  let fixture: ComponentFixture<EnquiryEdit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EnquiryEdit]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EnquiryEdit);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
