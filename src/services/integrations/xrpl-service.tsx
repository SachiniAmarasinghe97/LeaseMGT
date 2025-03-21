import { TransactionTypes } from "../../common/constants";
const xrpl = require("xrpl");

export default class XrplService {
  private readonly wallet: any;
  private readonly client: any;

  constructor(server: string, walletSecret: string) {
    this.wallet = xrpl.Wallet.fromSeed(walletSecret);
    this.client = new xrpl.Client(server);
  }

  async mintNFT(uri: string): Promise<any> {
    try {
      const transaction = {
        TransactionType: TransactionTypes.NFTokenMint,
        Account: this.wallet.classicAddress,
        NFTokenTaxon: 0,
        TransferFee: 0,
        Flags: 9, // 9 - tfBurnable + tfTransferable
        URI: uri,
      };
      await this.client.connect();
      const result = await this.client.submitAndWait(transaction, { wallet: this.wallet });
      await this.client.disconnect();
      console.log("Mint NFT transaction submission result:", result);
      return result;
    } catch (error) {
      await this.client.disconnect();
      throw error;
    }
  }

  async burnNFT(nftId: string): Promise<any> {
    try {
      const transaction = {
        TransactionType: TransactionTypes.NFTokenBurn,
        Account: this.wallet.classicAddress,
        NFTokenID: nftId,
      };
      await this.client.connect();
      const result = await this.client.submitAndWait(transaction, { wallet: this.wallet });
      await this.client.disconnect();
      console.log("Burn NFT transaction submission result:", result);
      return result;
    } catch (error) {
      await this.client.disconnect();
      throw error;
    }
  }
}
