declare module "tiny-secp256k1" {
  export function __initializeContext(): void
  export function isPoint(p: Uint8Array | Buffer): boolean
  export function isPointCompressed(p: Uint8Array | Buffer): boolean
  export function isPrivate(d: Uint8Array | Buffer): boolean
  export function pointFromScalar(d: Uint8Array | Buffer, compressed?: boolean): Uint8Array | null
  export function pointCompress(p: Uint8Array | Buffer, compressed?: boolean): Uint8Array | null
  export function pointAddScalar(p: Uint8Array | Buffer, tweak: Uint8Array | Buffer, compressed?: boolean): Uint8Array | null
  export function privateAdd(d: Uint8Array | Buffer, tweak: Uint8Array | Buffer): Uint8Array | null
  export function privateSub(d: Uint8Array | Buffer, tweak: Uint8Array | Buffer): Uint8Array | null
  export function privateNegate(d: Uint8Array | Buffer): Uint8Array
  export function sign(h: Uint8Array | Buffer, d: Uint8Array | Buffer, e?: Uint8Array | Buffer): Uint8Array | null
  export function verify(h: Uint8Array | Buffer, Q: Uint8Array | Buffer, signature: Uint8Array | Buffer, strict?: boolean): boolean
  export function pointAdd(pA: Uint8Array | Buffer, pB: Uint8Array | Buffer, compressed?: boolean): Uint8Array | null
  export function pointMultiply(p: Uint8Array | Buffer, tweak: Uint8Array | Buffer, compressed?: boolean): Uint8Array | null
}
