type ClerkJwtIssuerEnv = Readonly<Record<string, string | undefined>>;

export function resolveClerkJwtIssuerDomain(env: ClerkJwtIssuerEnv) {
  if (env.CLERK_JWT_ISSUER_DOMAIN) return env.CLERK_JWT_ISSUER_DOMAIN;

  throw new Error("CLERK_JWT_ISSUER_DOMAIN is required.");
}
