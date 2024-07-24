import { createClient } from "@vercel/edge-config";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const corsOptions = {
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, solana-client",
};

const cleanOrigin = (str: string) => {
  try {
    const url = new URL(str);
    let domain = url.hostname;

    // Remove www.
    if (domain.startsWith("www.")) {
      domain = domain.slice(4);
    }

    return domain;
  } catch (error) {
    return str; // Return the original string if it's not a valid URL
  }
};

const isVercelPreview = (str: string) => {
  if (str.endsWith("vercel.app")) {
    return true;
  }
  return false;
};

const isCloudflarePreview = (str: string) => {
  if (str.endsWith("pages.dev")) {
    return true;
  }
  return false;
};

const isPreview = (str: string) => {
  if (isVercelPreview(str) || isCloudflarePreview(str)) {
    return true;
  }
  return false;
};

export async function middleware(request: NextRequest) {
  console.log(request);
  // Check the origin from the request
  const origin = request.headers.get("origin") ?? "";

  if (!process.env.ALLOWED_LIST_EDGE_CONFIG) {
    console.error("ALLOWED_LIST_EDGE_CONFIG is not set");
    return NextResponse.next();
  }
  const client = createClient(process.env.ALLOWED_LIST_EDGE_CONFIG);
  const isAllowed = await (async () => {
    const domain = cleanOrigin(origin) || "";
    if (isPreview(domain)) {
      const allowedPreviewData = await client.get("preview-namespace");
      const allowedPreview = await stringArraySchema.parseAsync(allowedPreviewData);
      if (allowedPreview.find((d) => domain.includes(d))) {
        return true;
      }
    }

    const allowedOriginsData = await client.get("allowed-origins");
    const allowedOrigins = await stringArraySchema.parseAsync(allowedOriginsData);
    return allowedOrigins.includes(domain);
  })();
  // Handle preflighted requests
  const isPreflight = request.method === "OPTIONS";
  if (isPreflight) {
    const preflightHeaders = {
      ...(isAllowed && { "Access-Control-Allow-Origin": origin }),
      ...corsOptions,
    };
    return NextResponse.json({}, { headers: preflightHeaders });
  }

  // Handle simple requests
  const response = NextResponse.next();

  console.log("is allowed: " + isAllowed);
  if (isAllowed) {
    response.headers.set("Access-Control-Allow-Origin", origin);
  }

  Object.entries(corsOptions).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
}

const stringArraySchema = z.array(z.string()).default([]);

export const config = {
  matcher: "/api/(.*)",
};
