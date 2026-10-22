import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Keep the first version on the stable App Router rendering model.
   * Product pages read MySQL at request time and therefore should not be
   * forced into the Cache Components prerendering rules. */
};

export default nextConfig;
