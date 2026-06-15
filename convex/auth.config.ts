import { resolveClerkJwtIssuerDomain } from "./authIssuer";

const authConfig = {
  providers: [
    {
      domain: resolveClerkJwtIssuerDomain(process.env),
      applicationID: "convex",
    },
  ],
};

export default authConfig;
