export interface SettlementSummary {
  period: string;
  totalGrossValue: number;
  netFarmerPayout: number;
  fertilizerDeduction: number;
  cashLoansDeduction: number;
  teaPacketsDeduction: number;
  factoryGrossMarginPercentage: number;
  disbursalDate: string;
  disbursalStatus: 'Pending' | 'Ready' | 'Processed';
  bankPartner: string;
  unresolvedClaimsCount: number;
  unresolvedClaimsAmount: number;
}

