import {Algodv2, Indexer} from "algosdk"
import { ALGORAND_PROTOCOL_MAINNET_NETWORK } from "../types/protocol";

export const algodClient = new Algodv2("", ALGORAND_PROTOCOL_MAINNET_NETWORK.rpcUrl, "");
export const indexerClient = new Indexer("", ALGORAND_PROTOCOL_MAINNET_NETWORK.rpcUrl, "");