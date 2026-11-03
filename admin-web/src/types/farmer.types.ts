export interface Farmer {
  id: string;
  code: string;
  name: string;
  division: string;
  phone: string;
  nic: string;
  teaLandAcreage: number;
  bankName: string;
  accountNumber: string;
  status: 'Active' | 'Inactive' | 'Suspended';
  joinedDate: string;
  totalDeliveredKgMonth: number;
}

