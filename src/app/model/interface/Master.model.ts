export interface IStatus {
    statusId: number;
    statusName: string;
    isActive: boolean;
}

export interface ICategory {
    categoryId: number;
    categoryName: string,
    isActive: boolean;
}

export interface IApiResponseModel {
    error: any[],
    result: boolean;
    data: any[],
    message: string;
}

export interface IEnquiry {
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
  followUpDate?: string;
  feedback: string;
  createdBy: number;

}
