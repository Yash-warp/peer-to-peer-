/**
 * ============================================================================
 * COLLEGE CONFIGURATION
 * ============================================================================
 * CHANGE THIS TO YOUR REAL COLLEGE EMAIL DOMAIN.
 * Any user signing up must use an email ending with this domain.
 * For example: "iitb.ac.in", "pilani.bits-pilani.ac.in", "nitt.edu", "mycollege.edu.in"
 */
export const COLLEGE_EMAIL_DOMAIN = "aitpune.edu.in";

export const COLLEGE_NAME = "Campus Peer Share";
export const COLLEGE_SHORT_NAME = "CampusShare";

/**
 * Validates if an email address belongs to the allowed college domain.
 */
export function isValidCollegeEmail(email: string): boolean {
  if (!email || !email.includes("@")) return false;
  const domain = email.trim().toLowerCase().split("@")[1];
  return domain === COLLEGE_EMAIL_DOMAIN.toLowerCase() || domain.endsWith("." + COLLEGE_EMAIL_DOMAIN.toLowerCase());
}

export const ITEM_CATEGORIES = [
  { id: "cycle", label: "Cycles & Bicycles", icon: "Bike" },
  { id: "drafter", label: "Drafters & Engineering Kits", icon: "Compass" },
  { id: "lab_coat", label: "Lab Coats & Aprons", icon: "Shirt" },
  { id: "camera", label: "Cameras & Photography", icon: "Camera" },
  { id: "electronics", label: "Electronics & Chargers", icon: "Cpu" },
  { id: "sports", label: "Sports & Fitness", icon: "Trophy" },
  { id: "books", label: "Books & Notes", icon: "BookOpen" },
  { id: "other", label: "Fest Equipment & Others", icon: "Package" },
] as const;

export type ItemCategory = (typeof ITEM_CATEGORIES)[number]["id"];

