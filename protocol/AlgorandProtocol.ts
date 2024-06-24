// protocol-full.ts

import { AirGapProtocol, ProtocolNetwork } from "@airgap/module-kit";

class MyProtocol implements AirGapProtocol {
  constructor(network: ProtocolNetwork) {}

  // ...
}

const MY_PROTOCOL_MAINNET_NETWORK: ProtocolNetwork = {
  name: "Mainnet",
  type: "mainnet",
  rpcUrl: "...",
  blockExplorerUrl: "...",
};

const MY_PROTOCOL_TESTNET_NETWORK: ProtocolNetwork = {
  name: "Testnet",
  type: "testnet",
  rpcUrl: "...",
  blockExplorerUrl: "...",
};