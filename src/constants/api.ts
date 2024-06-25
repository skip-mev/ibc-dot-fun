// export const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.skip.money";
export const API_URL = "https://api.dev.skip.money";


export const APP_URL = process.env.APP_URL;

export const appUrl =
  process.env.NEXT_PUBLIC_VERCEL_ENV === "preview" || process.env.NEXT_PUBLIC_VERCEL_ENV === "staging"
    ? typeof window !== "undefined"
      ? `https://${window.location.hostname}`
      : process.env.NEXT_PUBLIC_VERCEL_URL
    : APP_URL;

export const APP_DOMAIN =
  process.env.APP_URL?.replace(/https?:\/\//, "").split("/")[0] ||
  process.env.NEXT_PUBLIC_VERCEL_URL ||
  `${process.env.HOST || "localhost"}:${process.env.PORT || 3000}`;

export const APP_PROTOCOL =
  APP_DOMAIN.includes("localhost") || APP_DOMAIN.match(/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/) ? "http" : "https";
