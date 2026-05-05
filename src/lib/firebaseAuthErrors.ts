const AUTH_MESSAGES: Record<string, string> = {
  "auth/configuration-not-found":
    "Account sign-in is not wired up yet. If you maintain this site, enable Authentication in Firebase (Email/Password) and attach the matching web app config.",

  "auth/invalid-api-key":
    "The Firebase web API key doesn’t match this project or is restricted. Replace it in your app config with the key from Firebase → Project settings → Your apps.",

  "auth/operation-not-allowed":
    "This sign-in method is turned off for this Firebase project. In Firebase Console → Authentication → Sign-in method, enable Email/Password.",

  "auth/invalid-email": "Enter a valid email address.",

  "auth/user-disabled": "This account has been disabled.",

  "auth/user-not-found": "No account exists for that email. Check spelling or register first.",

  "auth/wrong-password": "That password isn’t correct. Try again or reset your password.",

  "auth/invalid-credential":
    "The email or password is incorrect, or too many tries were made from this browser. Verify your details or try again shortly.",

  "auth/email-already-in-use": "An account already uses this email.",

  "auth/weak-password": "Pick a stronger password (longer mixes of letters and numbers work well).",

  "auth/too-many-requests": "Too many attempts. Wait a minute and try again.",

  "auth/network-request-failed":
    "We couldn’t reach the sign-in service. Check your connection and try again.",

  "auth/internal-error": "Something went wrong on the sign-in service. Try again in a moment.",
};

export function firebaseAuthMessage(error: unknown, fallback = "Something went wrong. Please try again."): string {
  if (!(typeof error === "object" && error !== null && "code" in error)) {
    return error instanceof Error && error.message ? error.message : fallback;
  }

  const codeProp = (error as { code: unknown }).code;
  if (typeof codeProp !== "string" || !codeProp.startsWith("auth/")) {
    return error instanceof Error && error.message ? error.message : fallback;
  }

  if (AUTH_MESSAGES[codeProp]) {
    return AUTH_MESSAGES[codeProp];
  }

  return `Sign-in couldn’t complete (${codeProp}). Please try again.`;
}
