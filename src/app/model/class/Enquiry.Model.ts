export class EnquiryModel {
    enquiryId: number;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    message: string;
    categoryId: number;
    statusId: number;
    enquiryType: string;
    isConverted: boolean;
    enquiryDate: string;
    followUpDate: string;
    feedback: string;
    createdBy: number;


    constructor() {
        this.enquiryId = 0;
        this.customerName = '';
        this.customerEmail = '';
        this.customerPhone = '';
        this.message = '';
        this.categoryId = 0;
        this.statusId = 0;
        this.enquiryType = '';
        this.isConverted = false;
        this.enquiryDate = "";
        this.followUpDate = "";
        this.feedback = '';
        this.createdBy = 0;

    }
}
