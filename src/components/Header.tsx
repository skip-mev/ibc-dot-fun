import { AdaptiveLink } from "./AdaptiveLink";
import { IbcFunLogo } from "./IbcFunLogo";

function Header() {
  return (
    <nav className="relative flex items-center justify-center px-4 py-8 sm:py-12">
      <AdaptiveLink href="/">
        <IbcFunLogo className="h-8 sm:h-16" />
      </AdaptiveLink>
    </nav>
  );
}

export default Header;
