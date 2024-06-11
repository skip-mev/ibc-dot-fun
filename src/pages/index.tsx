import { SwapWidget } from "@skip-go/widget";

import Header from "@/components/Header";
import { Help } from "@/components/Help";
import SkipBanner from "@/components/SkipBanner";
import { VersionCheck } from "@/components/VersionCheck";
import { cn } from "@/utils/ui";

export default function Home() {
  return (
    <div
      className={cn(
        "bg-[#ffdc61] font-sans subpixel-antialiased",
        "relative overflow-x-hidden overflow-y-hidden",
        "before:fixed before:inset-x-0 before:bottom-0 before:h-[80vh] before:content-['']",
        "before:bg-[url(/site-bg-2.svg)] before:bg-cover before:bg-[center_top] before:bg-no-repeat",
      )}
    >
      <main className="flex min-h-screen flex-col items-center pb-11 sm:pt-11">
        <SkipBanner className="z-9 inset-x-0 top-0 w-screen sm:fixed" />
        <Header />
        <div className="flex flex-grow flex-col items-center">
          <div className="w-screen overflow-hidden shadow-xl sm:max-w-[450px] sm:rounded-3xl">
            <SwapWidget
              className="w-full p-6"
              defaultRoute={{
                srcChainID: "cosmoshub-4",
                srcAssetDenom: "uatom",
              }}
            />
          </div>
        </div>
      </main>
      <VersionCheck />
      <Help />
    </div>
  );
}
