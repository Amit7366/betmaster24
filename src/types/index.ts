export * from "./common";

// types/index.ts
export interface Promotion {
  code: string;
  title: string;
  minDeposit: number;
  bonusRate?: number;
  fixedBonus?: number;
  turnoverX: number;
  eligibleGames: string[];
  maxWithdrawLimit?: number;
  usageType: string;
  description?: string;
}

