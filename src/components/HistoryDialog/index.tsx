import { ArrowLeftIcon } from "@heroicons/react/20/solid";
import * as Dialog from "@radix-ui/react-dialog";
import * as ScrollArea from "@radix-ui/react-scroll-area";
import { useMemo } from "react";

import { useAssets } from "@/context/assets";
import { useDisclosureKey } from "@/context/disclosures";
import { useTxHistory } from "@/context/tx-history";
import { cn } from "@/utils/ui";

import { HistoryClearButton } from "./HistoryClearButton";
import * as HistoryList from "./HistoryList";
import { useSyncState } from "./SyncState";

export const HistoryDialog = () => {
  const [isOpen, { close }] = useDisclosureKey("historyDialog");

  const history = useTxHistory();
  const { isReady } = useAssets();

  const entries = useMemo(() => {
    return isReady ? Object.entries(history).reverse() : undefined;
  }, [history, isReady]);

  useSyncState();

  return (
    <Dialog.Root
      modal
      open={isOpen}
    >
      <Dialog.Content className="absolute inset-0 animate-fade-zoom-in rounded-3xl bg-white">
        <div className="flex h-full flex-col space-y-2 px-4 py-6">
          <div className="flex items-center gap-4 pb-2">
            <button
              className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-neutral-100"
              onClick={close}
            >
              <ArrowLeftIcon className="h-6 w-6" />
            </button>
            <h3 className="text-xl font-bold">Transaction History</h3>
            <div className="flex-grow" />
            <HistoryClearButton />
          </div>
          <ScrollArea.Root
            className={cn(
              "relative isolate -mx-4 overflow-hidden",
              "before:absolute before:inset-x-0 before:bottom-0 before:z-10 before:h-2",
              "before:bg-gradient-to-t before:from-white before:to-transparent",
            )}
          >
            <ScrollArea.Viewport className="h-full w-full px-4">
              <HistoryList.Root>
                {entries && entries.length < 1 && (
                  <span className="p-2 text-center text-sm opacity-60">No recent transactions.</span>
                )}
                {entries?.map(([id, data]) => (
                  <HistoryList.Item
                    key={id}
                    id={id}
                    data={data}
                  />
                ))}
                {!isReady && <div className="p-4 text-center opacity-60">Loading transaction history...</div>}
              </HistoryList.Root>
            </ScrollArea.Viewport>
            <ScrollArea.Scrollbar
              className="z-20 flex touch-none select-none transition-colors ease-out data-[orientation=horizontal]:h-2 data-[orientation=vertical]:w-2 data-[orientation=horizontal]:flex-col"
              orientation="vertical"
            >
              <ScrollArea.Thumb className="relative flex-1 rounded-[10px] bg-neutral-500/50 transition-colors before:absolute before:left-1/2 before:top-1/2 before:h-2 before:w-2 before:-translate-x-1/2 before:-translate-y-1/2 before:content-[''] hover:bg-neutral-500" />
            </ScrollArea.Scrollbar>
            <ScrollArea.Corner />
          </ScrollArea.Root>
        </div>
      </Dialog.Content>
    </Dialog.Root>
  );
};
