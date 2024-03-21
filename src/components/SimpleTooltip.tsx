import * as Tooltip from "@radix-ui/react-tooltip";
import { ComponentPropsWithoutRef, ReactNode } from "react";

import { cn } from "@/utils/ui";

type Props = Tooltip.TooltipProps & {
  type?: "default" | "warning" | "brand";
  enabled?: boolean;
  label: ReactNode;
  children: ReactNode;
  _content?: ComponentPropsWithoutRef<"div">;
};

export const SimpleTooltip = (props: Props) => {
  const { type = "default", enabled = true, label, children, _content, ...tooltipProps } = props;
  if (!enabled) {
    return <>{children}</>;
  }
  return (
    <Tooltip.Root {...tooltipProps}>
      <Tooltip.Trigger asChild>{children}</Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content
          sideOffset={4}
          {..._content}
          className={cn(
            "rounded-md bg-white px-4 py-2 leading-none",
            "select-none shadow shadow-neutral-500/50",
            "text-sm",
            "animate-slide-up-and-fade",
            type === "warning" && "bg-[#fbeef1] text-[#FF486E]",
            type === "warning" && "font-medium",
            type === "brand" && "bg-[#FF486E] text-white",
            _content?.className,
          )}
        >
          {label}
          <Tooltip.Arrow
            className={cn(
              "fill-white drop-shadow",
              type === "warning" && "fill-[#fbeef1]",
              type === "brand" && "fill-[#FF486E]",
            )}
          />
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
};
