import { RouteResponse } from "@skip-router/core";
import { Fragment, useEffect, useState } from "react";
import toast from "react-hot-toast";

import { useDisclosureKey } from "@/context/disclosures";
import { cn } from "@/utils/ui";

import { PreviewRoute } from "./PreviewRoute";
import { PriceImpactWarning } from "./PriceImpactWarning";

export type ActionType = "NONE" | "TRANSFER" | "SWAP";

interface Props {
  isLoading?: boolean;
  route?: RouteResponse;
  isAmountError?: boolean | string;
  shouldShowPriceImpactWarning?: boolean;
  routeWarningMessage?: string;
  routeWarningTitle?: string;
  onAllTransactionComplete?: () => void;
}

function TransactionDialog({
  isLoading,
  route,
  isAmountError,
  shouldShowPriceImpactWarning,
  routeWarningMessage,
  routeWarningTitle,
}: Props) {
  const [hasDisplayedWarning, setHasDisplayedWarning] = useState(false);
  const confirmDisclosure = useDisclosureKey("confirmSwapDialog");
  const [isOpen, confirmControl] = confirmDisclosure;
  const [, priceImpactControl] = useDisclosureKey("priceImpactDialog");

  useEffect(() => {
    if (!isOpen) {
      setHasDisplayedWarning(false);
      return;
    }

    if (hasDisplayedWarning) {
      return;
    }

    if (shouldShowPriceImpactWarning) {
      priceImpactControl.open();
      setHasDisplayedWarning(true);
    }

    if (isOpen && !route) {
      priceImpactControl.close();
      confirmControl.close();
      toast.error(
        <p>
          <strong>Something went wrong!</strong>
          <br />
          Your transaction may or may not be processed.
        </p>,
      );
      return;
    }
    // reason: ignoring control handlers
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasDisplayedWarning, isOpen, route, shouldShowPriceImpactWarning]);

  return (
    <Fragment>
      <div>
        <button
          className={cn(
            "w-full rounded-md bg-[#FF486E] py-4 font-semibold text-white outline-none transition-[opacity,transform]",
            "disabled:cursor-not-allowed disabled:opacity-75",
            "enabled:hover:rotate-1",
          )}
          disabled={!route || (typeof isLoading === "boolean" && isLoading)}
          onClick={() => confirmControl.open()}
        >
          Preview Route
        </button>
        {isOpen && route && (
          <PreviewRoute
            route={route}
            disclosure={confirmDisclosure}
            isAmountError={isAmountError}
          />
        )}
      </div>
      <PriceImpactWarning
        onGoBack={confirmControl.close}
        message={routeWarningMessage}
        title={routeWarningTitle}
      />
    </Fragment>
  );
}

export default TransactionDialog;
