export default class UtilHelper {
  static getUserAgent(): string {
    return window.navigator.userAgent;
  }

  static getNftLink(nfTokenId: string): string {
    return `${process.env.REACT_APP_NFT_EXPLORER_PREFIX}/${nfTokenId}`;
  }
}
