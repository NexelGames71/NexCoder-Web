export type PolarBillingPeriod = "monthly" | "yearly";
export type PolarCheckoutPlan = "plus" | "pro" | "premium" | "business-standard" | "business-plus";

const PRODUCT_ENV_KEYS: Record<PolarCheckoutPlan, Record<PolarBillingPeriod, string>> = {
  plus: {
    monthly: "POLAR_PRODUCT_PLUS_MONTHLY",
    yearly: "POLAR_PRODUCT_PLUS_YEARLY",
  },
  pro: {
    monthly: "POLAR_PRODUCT_PRO_MONTHLY",
    yearly: "POLAR_PRODUCT_PRO_YEARLY",
  },
  premium: {
    monthly: "POLAR_PRODUCT_PREMIUM_MONTHLY",
    yearly: "POLAR_PRODUCT_PREMIUM_YEARLY",
  },
  "business-standard": {
    monthly: "POLAR_PRODUCT_BUSINESS_STANDARD_MONTHLY",
    yearly: "POLAR_PRODUCT_BUSINESS_STANDARD_YEARLY",
  },
  "business-plus": {
    monthly: "POLAR_PRODUCT_BUSINESS_PLUS_MONTHLY",
    yearly: "POLAR_PRODUCT_BUSINESS_PLUS_YEARLY",
  },
};

export function parsePolarPlan(value: string | null): PolarCheckoutPlan | null {
  if (
    value === "plus" ||
    value === "pro" ||
    value === "premium" ||
    value === "business-standard" ||
    value === "business-plus"
  ) {
    return value;
  }
  return null;
}

export function parseBillingPeriod(value: string | null): PolarBillingPeriod {
  return value === "yearly" ? "yearly" : "monthly";
}

export function getPolarProductId(plan: PolarCheckoutPlan, billing: PolarBillingPeriod) {
  return process.env[PRODUCT_ENV_KEYS[plan][billing]];
}

export function getPolarApiBaseUrl() {
  if (process.env.POLAR_API_BASE_URL) return process.env.POLAR_API_BASE_URL.replace(/\/$/, "");
  return process.env.POLAR_SERVER === "sandbox" ? "https://sandbox-api.polar.sh" : "https://api.polar.sh";
}

export function isBusinessPlan(plan: PolarCheckoutPlan) {
  return plan === "business-standard" || plan === "business-plus";
}
