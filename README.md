# AirGap Coin Library for Algorand

The **airgap-algorand-lib** is a protocol-agnostic library that allows easy handling of the most important tasks relating to the Algorand blockchain.

It implements operations such as preparing, signing, and broadcasting transactions for Algorand.

The library consists of a shared interface for all implemented protocols. This is especially useful in the context of AirGap because methods are designed to support offline key management and signing. The following core operations are specified:

- **prepareTransaction** - This is done on AirGap Wallet (online) side. A public key or extended public key is used and will fetch the required information from the Algorand network.
- **signTransaction** - This is done in AirGap Vault (offline) side. The output of `prepareTransaction` is the input for this method (hence the output of `prepareTransaction` is transferred via URL scheme (same-device) or QR code (2-device-setup)).
- **broadcastTransaction** - This is done in AirGap Wallet (online) side. The output of `signTransaction` is the input for this method (hence the output of `signTransaction` is transferred via URL scheme (same-device) or QR code (2-device-setup)).

## Features

### Protocols
The interface is designed to allow stateless calls. This means the class stores very little state itself. All required input comes from the method params (public key, extended public key, etc.).

Currently supported for Algorand:

- Single Address Wallets
- HD Wallets
- Delegation (Key registration and participation in consensus)

### Inter App Communication
A serializer is included that encodes JSON structures into RLP and Base58Check. Those strings can then be sent to the other app, either through QR codes or a URL. The serializer can only serialize messages in predefined formats, so new message types must be added when new features are integrated.

### Synchronising Wallets
Such that the system works, we need to be able to synchronize wallets. A wallet can be:

- **Single Address Wallet** - Only requires sharing the public key.
- **HD Wallet** - Requires sharing the extended public key.

## Getting Started

### Requirements
- npm >= 6
- NodeJS >= 12

Build dependencies are installed using `npm install`.

### Clone and Run
```bash
$ git clone https://github.com/airgap-it/airgap-algorand-lib.git
$ cd airgap-algorand-lib
$ npm install
```

### Contributing


We welcome contributions from the community. Simple README updates or bug fixes can be addressed with a PR directly.

For larger changes such as new features or refactorings, please contact us first by opening an issue. This project is under constant development, and until version 1.x.x is reached, frequent breaking changes may occur. Please refer to the development branch for the latest updates.

Regarding new features or integrations, we cannot guarantee they will be merged, but we are happy to discuss specific details through GitHub issues.