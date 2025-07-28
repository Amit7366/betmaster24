export const PROMOTION_LIST = [
  {
    code: 'NO_PROMO',
    title: 'No Promotion Selected',
    minDeposit: 0,
    bonusRate: 0,
    turnoverX: 0,
    eligibleGames: [],
    maxWithdrawLimit: null,
    usageType: 'none', // or 'optional'
  },

  {
    code: 'PROMO_150_SLOT',
    title: '150% bonus (Slot + Fishing)',
    minDeposit: 500,
    bonusRate: 1.5,
    turnoverX: 18,
    eligibleGames: ['slot', 'fishing'],
    maxWithdrawLimit: null,
    usageType: 'once', // changed from 'always'
  },

  {
    code: 'PROMO_100_ALL',
    title: '100% bonus (All games)',
    minDeposit: 0,
    bonusRate: 1,
    turnoverX: 20,
    eligibleGames: ['all'],
    maxWithdrawLimit: null,
    usageType: 'once', // changed from 'always'
  },

  {
    code: 'PROMO_150_LIVE',
    title: '150% bonus (Live games)',
    minDeposit: 0,
    bonusRate: 1.5,
    turnoverX: 25,
    eligibleGames: ['live'],
    maxWithdrawLimit: null,
    usageType: 'once', // changed from 'always'
  },

  {
    code: 'PROMO_100_SLOT',
    title: '100% refund bonus (Slot + Fishing)',
    minDeposit: 0,
    bonusRate: 1,
    turnoverX: 25,
    eligibleGames: ['slot', 'fishing'],
    maxWithdrawLimit: null,
    usageType: 'once', // ✅ can only be triggered once
    refundTrigger: true, // ✅ bonus given only when balance reaches 0
  },

  {
    code: 'PROMO_300_FIXED',
    title: 'Fixed 300TK bonus on 500TK deposit',
    minDeposit: 500,
    bonusRate: 0, // special case: fixed bonus
    fixedBonus: 300,
    turnoverX: 8,
    eligibleGames: ['all'],
    maxWithdrawLimit: 5000,
    usageType: 'once', // changed from 'always'
  },

  {
    code: 'PROMO_25_DAILY',
    title: '25% reload bonus (daily)',
    minDeposit: 1000,
    bonusRate: 0.25,
    turnoverX: 18,
    eligibleGames: ['slot', 'fishing'],
    maxWithdrawLimit: null,
    usageType: 'daily', // ✅ once per calendar day
    maxBonusCap: 5000, // ✅ max cumulative bonus allowed for this promo
  },

  {
    code: 'PROMO_30_LIVE_ONCE',
    title: '30% reload bonus (Live games)',
    minDeposit: 1000,
    bonusRate: 0.3,
    turnoverX: 18,
    eligibleGames: ['live'],
    maxWithdrawLimit: null,
    usageType: 'always',
    maxBonusCap: 5000, // ✅ max cumulative bonus allowed for this promo
  },
];