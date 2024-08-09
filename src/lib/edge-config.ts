if (typeof window !== "undefined") {
  throw new Error("edge-config.ts should only be imported on the server");
}
import { ExperimentalFeature } from "@skip-go/client";
import { createClient } from "@vercel/edge-config";
import { z } from "zod";

export function client() {
  if (!process.env.NEXT_PUBLIC_EDGE_CONFIG) {
    throw new Error("NEXT_PUBLIC_EDGE_CONFIG is not set");
  }
  return createClient(process.env.NEXT_PUBLIC_EDGE_CONFIG);
}

export async function getExperimentalFeatures(): Promise<ExperimentalFeature[]> {
  try {
    const branch = process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF;
    const key = (() => {
      switch (branch) {
        case "main":
          return "experimental-features";
        case "staging":
          return "experimental-features-staging";
        case "dev":
          return "experimental-features-dev";
        default:
          return "experimental-features";
      }
    })();

    const data = await client().get(key);
    const value = (await stringArraySchema.parseAsync(data)) as ExperimentalFeature[];
    return value;
  } catch (error) {
    console.error(error);
    return ["cctp"];
  }
}

const stringArraySchema = z.array(z.string()).default([]);
