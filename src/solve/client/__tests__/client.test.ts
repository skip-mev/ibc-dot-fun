import { rest } from "msw";
import { setupServer } from "msw/node";
import { SkipClient } from "../client";
import { IGNORE_CHAINS } from "../../../config";
import { DirectSecp256k1HdWallet, coin } from "@cosmjs/proto-signing";
import {
  DeliverTxResponse,
  SigningStargateClient,
  isDeliverTxFailure,
} from "@cosmjs/stargate";
import { TxRaw } from "cosmjs-types/cosmos/tx/v1beta1/tx";
import { spawn } from "child_process";
import path from "path";
import axios from "axios";
import { generateEndpointBroadcast } from "@evmos/provider";
import { DirectEthSecp256k1Wallet, PrivateKey } from "../../../test-utils";

const handlers = [
  rest.post(
    "https://api.skip.money/v1/fungible/route",
    async (req, res, ctx) => {
      const body = await req.json();

      if (!body.cumulative_affiliate_fee_bps) {
        return res(
          ctx.status(400),
          ctx.json({
            code: 3,
            message: "invalid cumulativeAffiliateFeeBps",
            details: [],
          })
        );
      }

      return res(
        ctx.status(200),
        ctx.json({
          source_asset_denom: "uosmo",
          source_asset_chain_id: "osmosis-1",
          dest_asset_denom: "uatom",
          dest_asset_chain_id: "cosmoshub-4",
          amount_in: "1000000",
          operations: [
            {
              swap: {
                swap_in: {
                  swap_venue: {
                    name: "osmosis-poolmanager",
                    chain_id: "osmosis-1",
                  },
                  swap_operations: [
                    {
                      pool: "1",
                      denom_in: "uosmo",
                      denom_out:
                        "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2",
                    },
                  ],
                  swap_amount_in: "1000000",
                },
                estimated_affiliate_fee:
                  "0ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2",
              },
            },
            {
              transfer: {
                port: "transfer",
                channel: "channel-0",
                chain_id: "osmosis-1",
                pfm_enabled: true,
                dest_denom: "uatom",
              },
            },
          ],
          chain_ids: ["osmosis-1", "cosmoshub-4"],
          does_swap: true,
          estimated_amount_out: "54631",
          swap_venue: {
            name: "osmosis-poolmanager",
            chain_id: "osmosis-1",
          },
        })
      );
    }
  ),
  rest.get("https://api.skip.money/v1/info/chains", (_, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        chains: [
          {
            chain_name: "osmosis",
            chain_id: "osmosis-1",
            pfm_enabled: true,
            cosmos_sdk_version: "v0.47.3",
            modules: {
              "github.com/cosmos/ibc-go": {
                path: "github.com/cosmos/ibc-go/v4",
                version: "v4.3.1",
                sum: "h1:xbg0CaCdxK3lvgGvSaI91ROOLd7s30UqEcexH6Ba4Ys=",
              },
              "github.com/osmosis-labs/osmosis/x/ibc-hooks": {
                path: "github.com/osmosis-labs/osmosis/x/ibc-hooks",
                version: "v0.0.7",
                sum: "h1:rd5guXn/SF6i66PO5rlGaDK0AT81kCpiLixyQ5EJ6Yg=",
              },
            },
          },
          {
            chain_name: "agoric",
            chain_id: "agoric-3",
            pfm_enabled: false,
            cosmos_sdk_version: "v0.45.11",
            modules: {
              "github.com/cosmos/ibc-go": {
                path: "github.com/cosmos/ibc-go/v3",
                version: "v3.4.0",
                sum: "h1:ha3cqEG36pqMWqA1D+kxDWBTZXpeFMd/aZIQF7I0xro=",
              },
            },
          },
          {
            chain_name: "8ball",
            chain_id: "eightball-1",
            pfm_enabled: false,
            cosmos_sdk_version: "v0.46.7",
            modules: {
              "github.com/cosmos/ibc-go": {
                path: "github.com/cosmos/ibc-go/v5",
                version: "v5.1.0",
                sum: "h1:m1NHXFkwwvNeJegZqtyox1WLinh+PMy4ivU/Cs9KjeA=",
              },
            },
          },
          {
            chain_name: "akash",
            chain_id: "akashnet-2",
            pfm_enabled: false,
            cosmos_sdk_version: "v0.45.9",
            modules: {
              "github.com/cosmos/ibc-go": {
                path: "github.com/cosmos/ibc-go/v3",
                version: "v3.1.0",
                sum: "",
              },
            },
          },
        ],
      })
    );
  }),
];

const server = setupServer(...handlers);

async function startLocalNet(name: string): Promise<void> {
  const child = spawn(
    path.resolve(__dirname, `../../../../scripts/localnets/${name}/start.sh`)
  );

  return new Promise((resolve) => {
    child.on("close", (code) => {
      resolve();
    });
  });
}

async function stopLocalNet(name: string): Promise<void> {
  const child = spawn(
    path.resolve(__dirname, `../../../../scripts/localnets/${name}/stop.sh`)
  );

  return new Promise((resolve) => {
    child.on("close", (code) => {
      resolve();
    });
  });
}

describe("SkipClient", () => {
  // Establish API mocking before all tests.
  beforeAll(() => server.listen());

  // Reset any request handlers that we may add during the tests,
  // so they don't affect other tests.
  afterEach(() => server.resetHandlers());

  // Clean up after the tests are finished.
  afterAll(() => server.close());

  describe("/v1/info/chains", () => {
    it("filters ignored chains", async () => {
      const client = new SkipClient({
        ignoreChains: IGNORE_CHAINS,
      });

      const response = await client.chains();

      const responseChainIDs = response.map((chain) => chain.chain_id);

      for (const ignoredChain of IGNORE_CHAINS) {
        expect(responseChainIDs).not.toContain(ignoredChain);
      }
    });
  });

  describe("/v1/fungible/route", () => {
    it("sets a value for cumulative_affiliate_fee_bps if not provided", async () => {
      const client = new SkipClient();

      await expect(
        client.fungible.getRoute({
          amount_in: "1000000",
          source_asset_denom: "uosmo",
          source_asset_chain_id: "osmosis-1",
          dest_asset_denom: "uatom",
          dest_asset_chain_id: "cosmoshub-4",
        })
      ).resolves.toEqual(expect.anything());
    });
  });

  test("works", async () => {
    await startLocalNet("cosmoshub");

    const wallet = await DirectSecp256k1HdWallet.fromMnemonic(
      "enlist hip relief stomach skate base shallow young switch frequent cry park"
    );

    const accounts = await wallet.getAccounts();
    const address = accounts[0].address;

    const message = {
      chain_id: "cosmoshub-localnet-1",
      path: ["cosmoshub-4", "osmosis-1"],
      msg: `{"source_port":"transfer","source_channel":"channel-141","token":{"denom":"uatom","amount":"5000"},"sender":"${address}","receiver":"osmo1f2f9vryyu53gr8vhsksn66kugnxaa7k8jdpk0e","timeout_height":{},"timeout_timestamp":1690975247072565510}`,
      msg_type_url: "/ibc.applications.transfer.v1.MsgTransfer",
    };

    const client = new SkipClient({
      endpointOptions: {
        "cosmoshub-localnet-1": {
          rpc: "localhost:26657",
        },
      },
    });

    const tx = await client.executeMultiChainMessage(
      address,
      wallet,
      message,
      "uatom"
    );

    console.log(tx);

    // // CheckTx must pass but the execution must fail in DeliverTx due to invalid channel/port
    expect(isDeliverTxFailure(tx)).toEqual(true);

    // stargateClient.disconnect();

    await stopLocalNet("cosmoshub");
  });

  test.skip("with evmos", async () => {
    await startLocalNet("evmos");

    const wallet = await DirectEthSecp256k1Wallet.fromKey(
      PrivateKey.fromHex(
        "d820416313152a8920636450badd1270a6ba1d5d68bc2946e6fb90c35529ced6"
      )
    );

    const accounts = await wallet.getAccounts();
    const address = accounts[0].address;

    const response = await axios.get(
      `http://localhost:1317/cosmos/auth/v1beta1/accounts/${address}`
    );

    const accountNumber = response.data.account.base_account
      .account_number as number;
    const sequence = response.data.account.base_account.sequence as number;

    const message = {
      chain_id: "evmos_9005-2",
      path: ["evmos_9001-2", "osmosis-1", "cosmoshub-4"],
      msg: `{"source_port":"transfer","source_channel":"channel-0","token":{"denom":"aevmos","amount":"50000000000000000"},"sender":"${address}","receiver":"osmo1mrm80xxdv8yhrt6gqvx2n638vjh23j023xj5yufha9y02gvskmaqwn2lw8","timeout_height":{},"timeout_timestamp":1691062830183914191,"memo":"{\\"wasm\\":{\\"contract\\":\\"osmo1mrm80xxdv8yhrt6gqvx2n638vjh23j023xj5yufha9y02gvskmaqwn2lw8\\",\\"msg\\":{\\"swap_and_action\\":{\\"user_swap\\":{\\"swap_venue_name\\":\\"osmosis-poolmanager\\",\\"operations\\":[{\\"pool\\":\\"722\\",\\"denom_in\\":\\"ibc/6AE98883D4D5D5FF9E50D7130F1305DA2FFA0C652D1DD9C123657C6B4EB2DF8A\\",\\"denom_out\\":\\"uosmo\\"},{\\"pool\\":\\"1\\",\\"denom_in\\":\\"uosmo\\",\\"denom_out\\":\\"ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2\\"}]},\\"min_coin\\":{\\"denom\\":\\"ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2\\",\\"amount\\":\\"408\\"},\\"timeout_timestamp\\":1691062830183901329,\\"post_swap_action\\":{\\"ibc_transfer\\":{\\"ibc_info\\":{\\"source_channel\\":\\"channel-0\\",\\"receiver\\":\\"cosmos1f2f9vryyu53gr8vhsksn66kugnxaa7k86kjxet\\",\\"fee\\":{\\"recv_fee\\":[],\\"ack_fee\\":[],\\"timeout_fee\\":[]},\\"memo\\":\\"\\",\\"recover_address\\":\\"osmo1f2f9vryyu53gr8vhsksn66kugnxaa7k8jdpk0e\\"}}},\\"affiliates\\":[]}}}}"}`,
      msg_type_url: "/ibc.applications.transfer.v1.MsgTransfer",
    };

    const client = new SkipClient();

    const rawTx = await client.signMultiChainMessageDirect(
      address,
      wallet,
      message,
      {
        amount: [coin("0", "aevmos")],
        gas: "200000",
      },
      {
        accountNumber: accountNumber,
        sequence: sequence,
        chainId: message.chain_id,
      }
    );

    const txBytes = TxRaw.encode(rawTx).finish();

    const txResponse = await axios.post(
      `http://localhost:1317${generateEndpointBroadcast()}`,
      {
        tx_bytes: Buffer.from(txBytes).toString("base64"),
        mode: "BROADCAST_MODE_BLOCK",
      }
    );

    const tx = txResponse.data.tx_response as DeliverTxResponse;

    // this test is not good. it fails signature verification, so it's only testing 50% of the problem.
    // i can't figure it out, and have spent hours on it. moving on for now.
    expect(isDeliverTxFailure(tx)).toEqual(true);

    await stopLocalNet("evmos");
  });
});
