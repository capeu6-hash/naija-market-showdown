export const COUNTRIES = ["Nigeria", "Ghana", "Cameroon", "Benin", "Togo", "Niger", "Chad", "Côte d'Ivoire", "Senegal", "South Africa", "Kenya", "United Kingdom", "United States", "Canada", "Other"];

export const NG_STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno", "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu",
  "FCT (Abuja)", "Gombe", "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo",
  "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara",
];

// Lagos area fees (owner-set). Unlisted Lagos areas default to 2000.
export const LAGOS_FEES: Record<string, number> = {
  Ikeja: 2000, Lekki: 2500, "Lekki Phase 1": 2500, Surulere: 2000, Yaba: 1800, Ikorodu: 3500, Ajah: 3000,
  "Victoria Island": 2500, Ikoyi: 2500,
};
export const LAGOS_AREAS = [...Object.keys(LAGOS_FEES), "Alaba", "Oshodi", "Agege", "Others"];
export const OUTSIDE_LAGOS_FEE = 5000;
export const OUTSIDE_NIGERIA_FEE = 15000;

export function deliveryFee(country: string, state: string, region: string): number {
  if (country.trim().toLowerCase() !== "nigeria") return OUTSIDE_NIGERIA_FEE;
  if (state !== "Lagos") return OUTSIDE_LAGOS_FEE;
  const r = region.trim().toLowerCase();
  const hit = Object.entries(LAGOS_FEES).find(([k]) => k.toLowerCase() === r);
  return hit ? hit[1] : 2000;
}

// WhatsApp number for order confirmation (international format, no +).
export const STORE_WHATSAPP = "2348089778840";

// Payment details shown to customers.
export const BANK = { name: "OPay", accountName: "Chukwuemeka Columbus", accountNumber: "8089778840" };
