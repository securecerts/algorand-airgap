import {
  newSignedTransaction,
  newUnsignedTransaction,
} from "@airgap/module-kit";
import {
  AlgorandSignedTransaction,
  AlgorandUnsignedTransaction,
} from "../../../../types/transaction";
import { AlgorandTransactionSignRequest } from "../definitions/transaction-sign-request-algorand";
import { AlgorandTransactionSignResponse } from "../definitions/transaction-sign-response";

function algorandUnsignedTransactionToRequest(
  unsigned: AlgorandUnsignedTransaction,
  publicKey: string,
  callbackUrl?: string
): AlgorandTransactionSignRequest {
  const { type: _, ...rest } = unsigned;

  return {
    transaction: rest,
    publicKey,
    callbackURL: callbackUrl,
  };
}

export function algorandSignedTransactionToResponse(
  signed: AlgorandSignedTransaction,
  accountIdentifier: string
): AlgorandTransactionSignResponse {
  return { transaction: JSON.stringify(signed), accountIdentifier };
}

export function algorandTransactionSignRequestToUnsigned(
  request: AlgorandTransactionSignRequest
): AlgorandUnsignedTransaction {
  return newUnsignedTransaction<AlgorandUnsignedTransaction>(
    request.transaction
  );
}

export function algorandTransactionSignResponseToSigned(
  response: AlgorandTransactionSignResponse
): AlgorandSignedTransaction {
  return newSignedTransaction<AlgorandSignedTransaction>(
    JSON.parse(response.transaction)
  );
}
