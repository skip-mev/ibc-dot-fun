import Image from "next/image";

import { AdaptiveLink } from "./AdaptiveLink";

function Footer() {
  return (
    <div className="relative flex flex-row items-center justify-center space-x-0 px-4 py-8 sm:py-12">
      <p className="text-sm text-black sm:text-base">Crafted by</p>
      <AdaptiveLink
        href="https://skip.money/"
        target="_blank"
      >
        <div className="relative h-12 w-36">
          <Image
            src="/skip-logo.png"
            fill
            className="h-8 sm:h-16"
            alt={"skip logo"}
            style={{
              objectFit: "contain",
            }}
          />
        </div>
      </AdaptiveLink>
    </div>
  );
}

export default Footer;
