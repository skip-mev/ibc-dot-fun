import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { Help } from "@/components/Help";
import SkipBanner from "@/components/SkipBanner";
import { VersionCheck } from "@/components/VersionCheck";
import { Widget } from "@/widget/Widget";

export default function Home() {
  return (
    <>
      <main className="relative flex min-h-screen flex-col items-center sm:pt-11">
        <SkipBanner className="inset-x-0 top-0 z-50 w-screen sm:fixed" />
        <Header />
        <div className="flex flex-grow flex-col items-center">
          <div className="relative w-screen bg-white p-6 shadow-xl sm:max-w-[450px] sm:rounded-3xl">
            <Widget />
          </div>
          <Footer />
        </div>
      </main>
      <VersionCheck />
      <Help />
    </>
  );
}
