/**
 * Promo codes — edit this file to add or remove codes.
 * Key = code string (case-insensitive match applied at redemption).
 * Value = plan tier to grant.
 *
 * Keep this file private / out of public repos once codes are added.
 */
const PROMO_CODES: Record<string, 'pro' | 'business'> = {
    LINKZY_FRIENDS: 'pro',
    LINKZY_PRO2025: 'pro',
    LINKZY_BETAS: 'pro',
    LINKZY_TEAM: 'business',
};

export default PROMO_CODES;
