/**
 * Client-side mirror of the server's shipping + tax rules, used only to show
 * a live estimate in the checkout summary before the order is submitted.
 * The API server (artifacts/api-server/src/lib/pricing.ts) is the source of
 * truth and always recomputes + persists the authoritative amounts.
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

export function estimateShippingCents({ state, country }: ShippingDestination): number {
  if (!isUsCountry(country)) return SHIPPING_INTERNATIONAL_CENTS;
  const code = normalizeStateCode(state);
  if (code === "CT") return SHIPPING_CT_CENTS;
  if (code && NORTHEAST_STATES.has(code)) return SHIPPING_NORTHEAST_CENTS;
  return SHIPPING_REST_OF_US_CENTS;
}

/** Looks up the destination state's tax rate. Only Connecticut is taxed (0 otherwise). */
export function getDestinationTaxRate(destination: ShippingDestination): number {
  if (!isUsCountry(destination.country)) return 0;
  const code = normalizeStateCode(destination.state);
  return code === "CT" ? CT_SALES_TAX_RATE : 0;
}

export function estimateTaxCents(subtotalCents: number, destination: ShippingDestination): number {
  const rate = getDestinationTaxRate(destination);
  return Math.round(subtotalCents * rate);
}
