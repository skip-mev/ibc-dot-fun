import { bech32mAddress } from "@penumbra-zone/bech32m/penumbra";
import { bech32CompatAddress } from "@penumbra-zone/bech32m/penumbracompat1";
import { ViewService } from "@penumbra-zone/protobuf";
import { MinimalWallet, SwapWidgetProviderProps } from "@skip-go/widget";
import toast from "react-hot-toast";

import { appUrl } from "@/constants/api";

import { createPraxClient, isPraxInstalled, requestPraxAccess } from "./prax";

export const endpointOptions: SwapWidgetProviderProps["endpointOptions"] = {
  getRpcEndpointForChain: async (chainID) => {
    return `${appUrl}/api/rpc/${chainID}`;
  },
  getRestEndpointForChain: async (chainID) => {
    return `${appUrl}/api/rest/${chainID}`;
  },
};

export const apiURL = `${appUrl}/api/skip`;

const penumbraBech32ChainIDs = ["noble-1", "grand-1"];
const getPenumbraCompatibleAddress = ({
  chainID,
  address,
}: {
  chainID?: string;
  address: { inner: Uint8Array };
}): string => {
  if (!chainID) return bech32mAddress(address);
  return penumbraBech32ChainIDs.includes(chainID) ? bech32CompatAddress(address) : bech32mAddress(address);
};

export const praxWallet: MinimalWallet = {
  walletName: "prax",
  walletPrettyName: "Prax Wallet",
  walletInfo: {
    logo: "https://raw.githubusercontent.com/prax-wallet/web/e8b18f9b997708eab04f57e7a6c44f18b3cf13a8/apps/extension/public/prax-white-vertical.svg",
  },
  connect: async () => {
    console.error("Prax wallet is not supported for connect");
    toast.error("Prax wallet is not supported for connect");
  },
  getAddress: async (props) => {
    const penumbraWalletIndex = props?.praxWallet?.index;
    const sourceChainID = props?.praxWallet?.sourceChainID;
    try {
      const isInstalled = await isPraxInstalled();
      if (!isInstalled) {
        throw new Error("Prax Wallet is not installed");
      }
      await requestPraxAccess();
      const praxClient = createPraxClient(ViewService);

      const address = await praxClient.addressByIndex({
        addressIndex: {
          account: penumbraWalletIndex ? penumbraWalletIndex : 0,
        },
      });
      if (!address.address) throw new Error("No address found");
      const bech32Address = getPenumbraCompatibleAddress({
        address: address.address,
        chainID: sourceChainID,
      });
      return bech32Address;
    } catch (error) {
      console.error(error);
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      toast.error(error?.message);
    }
  },
  disconnect: async () => {
    console.error("Prax wallet is not supported");
  },
  isWalletConnected: false,
};
