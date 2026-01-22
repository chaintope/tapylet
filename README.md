# Tapylet

A Chrome extension wallet for Tapyrus Testnet.

## Features

- Wallet creation (BIP39 mnemonic generation)
- Wallet restoration (from mnemonic phrase)
- Password-protected encryption
- Tapyrus address display

## Tech Stack

- [Plasmo](https://docs.plasmo.com/) - Browser extension framework
- [React](https://react.dev/) - UI library
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [tapyrusjs-lib](https://github.com/chaintope/tapyrusjs-lib) - Tapyrus library
- [@noble/secp256k1](https://github.com/paulmillr/noble-secp256k1) - Elliptic curve cryptography

## Supported Networks

- Tapyrus Testnet (NetworkId: 1939510133)

## Development

### Prerequisites

- Node.js 18+
- npm or pnpm

### Setup

```bash
npm install
```

### Start Development Server

```bash
npm run dev
```

### Load in Chrome

1. Open `chrome://extensions` in Chrome
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `build/chrome-mv3-dev` folder

### Production Build

```bash
npm run build
```

Build artifacts will be generated in `build/chrome-mv3-prod`.

## HD Wallet Derivation Path

Compliant with [TIP-0044](https://github.com/chaintope/tips/blob/main/tip-0044.md):

```
m/44'/1939510133'/0'/0/0
      └── NetworkId (Testnet)
```

## License

MIT
