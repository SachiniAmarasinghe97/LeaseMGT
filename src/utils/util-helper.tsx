const { decodeAccountID } = require("ripple-address-codec");

export default class UtilHelper {
  static getUserAgent(): string {
    return window.navigator.userAgent;
  }

  static getNftLink(nfTokenId: string): string {
    return `${process.env.REACT_APP_NFT_EXPLORER_PREFIX}/${nfTokenId}`;
  }

  static getNFTokenId(flags: number, transferFee: number, taxon: number, issuer: string, sequence: number) {
    console.log("flags", flags, "transferFee", transferFee, "taxon", taxon, "issuer", issuer, "sequence", sequence);
    const buf = Buffer.alloc(32);
    buf.writeUInt16BE(flags, 0);
    buf.writeUInt16BE(transferFee, 2);
    decodeAccountID(issuer).copy(buf, 4);
    buf.writeUInt32BE((taxon ^ (384160001 * sequence + 2459) % 4294967296) >>> 0, 24);
    buf.writeUInt32BE(sequence, 28);
    return buf.toString("hex").toUpperCase();
  }
}