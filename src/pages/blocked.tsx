import DiscordButton from "@/components/DiscordButton";
import { LogoGo } from "@/components/LogoGo";
import { VersionCheck } from "@/components/VersionCheck";
import WidgetButton from "@/components/WidgetButton";
import { cn } from "@/utils/ui";

export default function Home() {
  return (
    <div
      className={cn(
        "bg-[#ff86ff] font-sans subpixel-antialiased",
        "relative overflow-x-hidden overflow-y-hidden",
        "before:fixed before:inset-x-0 before:bottom-0 before:h-[100vh] before:content-['']",
        "before:bg-[url(/bg.svg)] before:bg-cover before:bg-[center_top] before:bg-no-repeat",
      )}
    >
      <main className="relative flex min-h-screen flex-col items-center">
        <div className="flex h-20 w-full flex-row items-center justify-between px-6 py-4">
          <LogoGo />
          <div className="flex flex-row space-x-2">
            <WidgetButton />
            <DiscordButton />
          </div>
        </div>
        <div className="flex flex-grow flex-col items-center pt-36">
          <div className="relative h-[250px] w-[95%] overflow-hidden rounded-3xl bg-white p-2 shadow-xl sm:w-[450px]">
            <div className="flex h-full w-full flex-col items-center justify-center space-y-4">
              <p className="font-diatype text-2xl font-bold">Sorry!</p>
              <p className="text-center font-diatype">The Skip Go App is unavailable in your region.</p>
            </div>
          </div>
        </div>
      </main>
      <VersionCheck />
    </div>
  );
}
