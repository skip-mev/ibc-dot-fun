import { useManager } from "@cosmos-kit/react";
import { RouteResponse, SkipRouter, TxStatusResponse } from "@skip-router/core";
import { differenceInMinutes, parseISO } from "date-fns";
import { useState } from "react";

import { ContactButton } from "@/components/ContactButton";
import { SwapWidget } from "@/components/SwapWidget";
import { WalletModalProvider } from "@/components/WalletModal";
import {
  failTxHistory,
  successTxHistory,
  TxHistoryItem,
  updateTxStatus,
  useTxHistory,
} from "@/context/tx-history";
import { useInterval } from "@/hooks/useInterval";
import { queryClient } from "@/lib/react-query";
import { useSkipClient } from "@/solve";
import { getBalancesByChain } from "@/utils/utils";

function routeHasAxelarTransfer(route: RouteResponse): boolean {
  for (const operation of route.operations) {
    if ("axelarTransfer" in operation) {
      return true;
    }
  }
  return false;
}

function historyItemIsMissingAxelarlarscanLink(historyItem: TxHistoryItem) {
  if (!routeHasAxelarTransfer(historyItem.route)) {
    return false;
  }

  for (const tx of historyItem.txStatus) {
    if (tx.axelarscanLink) {
      return false;
    }
  }

  return true;
}

function maybeGetAxelarscanLinkFromTransactionStatus(
  status: TxStatusResponse,
): string | undefined {
  for (const seqEvent of status.transferSequence) {
    if ("axelarTransfer" in seqEvent) {
      if ("contractCallWithTokenTxs" in seqEvent.axelarTransfer.txs) {
        return seqEvent.axelarTransfer.txs.contractCallWithTokenTxs.sendTx
          ? `https://axelarscan.io/gmp/${seqEvent.axelarTransfer.txs.contractCallWithTokenTxs.sendTx.txHash}`
          : undefined;
      }

      if ("sendTokenTxs" in seqEvent.axelarTransfer.txs) {
        return seqEvent.axelarTransfer.txs.sendTokenTxs.sendTx
          ? `https://axelarscan.io/transfer/${seqEvent.axelarTransfer.txs.sendTokenTxs.sendTx.txHash}`
          : undefined;
      }
    }
  }
  return undefined;
}

async function updatePendingRoute(
  id: string,
  historyItem: TxHistoryItem,
  skipRouter: SkipRouter,
) {
  const firstTx =
    historyItem.txStatus.length > 0 ? historyItem.txStatus[0] : undefined;

  if (!firstTx) {
    return;
  }

  try {
    const status = await skipRouter.transactionStatus({
      chainID: firstTx.chainId,
      txHash: firstTx.txHash,
    });

    if (status.state === "STATE_COMPLETED_SUCCESS") {
      successTxHistory(id);
    }

    if (status.state === "STATE_COMPLETED_ERROR") {
      failTxHistory(id);
    }
  } catch {
    // Sometimes this is called before the API knows about the transaction. We can probably safely ignore errors.
  }
}

async function updateAxelarscanLink(
  id: string,
  historyItem: TxHistoryItem,
  skipRouter: SkipRouter,
) {
  for (const tx of historyItem.txStatus) {
    try {
      const status = await skipRouter.transactionStatus({
        chainID: tx.chainId,
        txHash: tx.txHash,
      });

      const axelarscanLink =
        maybeGetAxelarscanLinkFromTransactionStatus(status);

      if (axelarscanLink && !tx.axelarscanLink) {
        if (axelarscanLink) {
          updateTxStatus(id, {
            ...tx,
            axelarscanLink,
          });
        }
      }
    } catch {
      /* empty */
    }
  }
}

export default function Home() {
  const { walletRepos } = useManager();
  const history = useTxHistory();
  const skipRouter = useSkipClient();

  async function prefetchBalances(address: string, chainID: string) {
    try {
      const balances = await getBalancesByChain(address, chainID);

      queryClient.setQueryData(
        ["balances-by-chain", address, chainID],
        balances,
      );
    } catch {
      /* empty */
    }
  }

  async function updateTransactionHistory(skipIfOlderThanMinutes?: number) {
    for (const [id, historyItem] of Object.entries(history)) {
      if (
        skipIfOlderThanMinutes &&
        differenceInMinutes(new Date(), parseISO(historyItem.timestamp)) >
          skipIfOlderThanMinutes
      ) {
        continue;
      }

      if (historyItem.status === "pending") {
        await updatePendingRoute(id, historyItem, skipRouter);
      }

      if (historyItemIsMissingAxelarlarscanLink(historyItem)) {
        await updateAxelarscanLink(id, historyItem, skipRouter);
      }
    }
  }

  useInterval(() => {
    for (const repo of walletRepos) {
      if (repo.current && repo.current.address) {
        prefetchBalances(repo.current.address, repo.chainRecord.chain.chain_id);
      }
    }
  }, 5000);

  // on the first run (aka page load), check all transactions in the history
  const [firstRun, setFirstRun] = useState(true);

  useInterval(async () => {
    await updateTransactionHistory(firstRun ? undefined : 30);

    if (firstRun) {
      setFirstRun(false);
    }
  }, 2000);

  return (
    <div className="max-w-md mx-auto">
      <ContactButton />
      <div className="bg-white shadow-xl rounded-3xl p-6 py-6 relative">
        <WalletModalProvider>
          <SwapWidget />
        </WalletModalProvider>
      </div>
      <style jsx global>{`
        html {
          overflow-x: hidden;
          overflow-y: scroll;
        }
      `}</style>
    </div>
  );
}
