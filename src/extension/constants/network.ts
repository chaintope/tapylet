/**
 * Tapyrus network the extension operates on. This module is the one place that
 * resolves it: it reads the build-time configuration and injects the result
 * into @tapylet/core, which no longer reads PLASMO_PUBLIC_NETWORK_ID itself —
 * core also runs under React Native, where that variable does not exist.
 *
 * parseNetworkId rejects anything that isn't a network id, so a typo in .env
 * fails the build's first import instead of producing a `tapyrus:NaN/<address>`
 * QR or a registry lookup against a nonexistent network. TIP-0044 network ids:
 * 1939510133 = Tapyrus Testnet, 15215628 = Tapyrus API/mainnet.
 */
import { parseNetworkId, setNetworkId } from "@tapylet/core/config/network"

export const NETWORK_ID = parseNetworkId(
  process.env.PLASMO_PUBLIC_NETWORK_ID ?? "1939510133"
)

setNetworkId(NETWORK_ID)
