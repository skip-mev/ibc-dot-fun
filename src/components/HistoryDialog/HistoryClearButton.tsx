import { TrashIcon } from "@heroicons/react/20/solid";
import { ComponentProps } from "react";

import { txHistory, useTxHistory } from "@/context/tx-history";
import { cn } from "@/utils/ui";

import { SimpleTooltip } from "../SimpleTooltip";

type Props = ComponentProps<"button">;

export const HistoryClearButton = ({ className, ...props }: Props) => {
  const hasHistory = useTxHistory((state) => Object.keys(state).length > 0);

  if (!hasHistory) return null;

  return (
    <SimpleTooltip
      label="Clear transaction history"
      type="warning"
    >
      <button
        className={cn(
          "text-xs font-semibold text-[#FF486E]",
          "bg-[#FF486E]/20 hover:bg-[#FF486E]/30",
          "rounded-lg p-2",
          "flex items-center gap-1",
          "transition-colors focus:outline-none",
          className,
        )}
        onClick={() => txHistory.clear()}
        {...props}
      >
        <TrashIcon className="h-4 w-4" />
      </button>
    </SimpleTooltip>
  );
};
