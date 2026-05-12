import type { SiteContent } from "./types";

export const defaultSiteContent: SiteContent = {
  homeEyebrow: "Civic learning platform",
  homeTitle:
    "Learn how local government works without fighting the interface.",
  homeDescription:
    "CivicEd Mushindamo gives residents a simple way to study modules, follow announcements, and track progress from one consistent platform.",
  aboutEyebrow: "About CivicEd",
  aboutTitle:
    "A simpler civic education platform for Mushindamo Town Council.",
  aboutDescription:
    "The platform is designed to make civic learning easier to access, easier to manage, and easier to trust.",
  aboutFocusTitle:
    "The product now follows one navigation model and one reading rhythm.",
  aboutFocusBody:
    "Users no longer move between unrelated layouts. Public pages, learner pages, and content pages now share the same spacing, cards, buttons, and form patterns.",
  aboutOutcome:
    "Residents should be able to understand what the platform offers, where to go next, and how to continue learning within a few seconds.",
};

export function mergeSiteContent(data: Partial<SiteContent> = {}): SiteContent {
  return {
    ...defaultSiteContent,
    ...data,
  };
}
