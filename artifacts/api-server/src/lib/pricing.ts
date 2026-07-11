/**
 * Shipping + sales tax rules for Figureheadz.
 *
 * - Figureheadz has sales-tax nexus only in Connecticut, so CT state sales
 *   tax (6.35%) is charged on orders shipping to a CT address. No other
 *   state's tax is collected.
 * - Shipping is a flat rate per zone based on the destination state:
 *   in-state (CT) is cheapest, nearby Northeast states are mid-tier, the
 *   rest of the US is the standard rate, and international ships at a
 *   premium flat rate.
 *
 * This file is the source of truth on the server. The frontend keeps a
 * matching copy (`src/lib/pricing.ts`) purely to render a live estimate in
 * the checkout summary before the order is submitted — the server always
 * recomputes and persists the authoritative amounts.
 */

const CT_SALES_TAX_RATE = 0.0635;

const NORTHEAST_STATES = new Set(["NY", "MA", "RI", "NJ", "PA", "NH", "VT", "ME"]);

const SHIPPING_CT_CENTS = 499;
const SHIPPING_NORTHEAST_CENTS = 799;
const SHIPPING_REST_OF_US_CENTS = 1299;
const SHIPPING_INTERNATIONAL_CENTS = 2499;

const STATE_NAME_TO_CODE: Record<string, string> = {
  alabama: "AL", alaska: "AK", arizona: "AZ", arkansas: "AR", california: "CA",
  colorado: "CO", connecticut: "CT", delaware: "DE", florida: "FL", georgia: "GA",
  hawaii: "HI", idaho: "ID", illinois: "IL", indiana: "IN", iowa: "IA",
  kansas: "KS", kentucky: "KY", louisiana: "LA", maine: "ME", maryland: "MD",
  massachusetts: "MA", michigan: "MI", minnesota: "MN", mississippi: "MS",
  missouri: "MO", montana: "MT", nebraska: "NE", nevada: "NV",
  "new hampshire": "NH", "new jersey": "NJ", "new mexico": "NM", "new york": "NY",
  "north carolina": "NC", "north dakota": "ND", ohio: "OH", oklahoma: "OK",
  oregon: "OR", pennsylvania: "PA", "rhode island": "RI", "south carolina": "SC",
  "south dakota": "SD", tennessee: "TN", texas: "TX", utah: "UT", vermont: "VT",
  virginia: "VA", washington: "WA", "west virginia": "WV", wisconsin: "WI",
  wyoming: "WY", "district of columbia": "DC",
};

const US_COUNTRY_NAMES = new Set(["us", "usa", "united states", "united states of america"]);

/** Normalizes a free-text state field (name or abbreviation) to a 2-letter code, if recognizable. */
export function normalizeStateCode(state: string): string | null {
  const trimmed = state.trim().toLowerCase();
  if (!trimmed) return null;
  if (trimmed.length === 2) return trimmed.toUpperCase();
  return STATE_NAME_TO_CODE[trimmed] ?? null;
}

export function isUsCountry(country: string): boolean {
  return US_COUNTRY_NAMES.has(country.trim().toLowerCase());
}

export interface ShippingDestination {
  state: string;
  country: string;
}

export function calculateShippingCents({ state, country }: ShippingDestination): number {
  if (!isUsCountry(country)) {
    return SHIPPING_INTERNATIONAL_CENTS;
  }

  const code = normalizeStateCode(state);
  if (code === "CT") return SHIPPING_CT_CENTS;
  if (code && NORTHEAST_STATES.has(code)) return SHIPPING_NORTHEAST_CENTS;
  return SHIPPING_REST_OF_US_CENTS;
}

/** CT sales tax applies only to orders shipping to a Connecticut address. */
export function calculateTaxCents(subtotalCents: number, destination: ShippingDestination): number {
  if (!isUsCountry(destination.country)) return 0;
  const code = normalizeStateCode(destination.state);
  if (code !== "CT") return 0;
  return Math.round(subtotalCents * CT_SALES_TAX_RATE);
}
