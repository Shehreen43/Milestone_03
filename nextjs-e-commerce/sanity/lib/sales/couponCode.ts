export const COUPON_CODES = {
    NYEAR25: "NYEAR25",
    EID2024: "EID2024",
    WINTER25: "WINTER25",
} as const;

export type CouponCode = keyof typeof COUPON_CODES;