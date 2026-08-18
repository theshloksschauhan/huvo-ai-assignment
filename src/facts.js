/**
 * PROJECT_FACTS — Single source of truth.
 * Imported by the prompt builder AND served to the frontend via /api/facts.
 * If a fact isn't here, it doesn't exist — the prompt enforces this strictly.
 */
export const PROJECT_FACTS = {
  project: "Project Northstar One",
  location: "Sector 79, Gurugram",
  configs: ["2 BHK", "3 BHK"],
  price2BHK: "₹1.35 crore onwards",
  price3BHK: "₹1.75 crore onwards"
};
