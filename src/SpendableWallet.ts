const bitcore = require("bitcore-lib");
const UnspentOutput = bitcore.Transaction.UnspentOutput;

export default class SpendableWallet {
  constructor(public ticker: string, public decimals: number) {}

  send(address: string, amount: number, minerFee: number): Promise<string> {
    throw new Error("not implemented");
  }

  /**
   * Returns an array of unspent confirmed transactions.
   * @param address - The address to find utxos for
   * @returns An array of utxos
   */
  async getUnspentTransactions(
    address: string
  ): Promise<
    {
      satoshis: number;

      /**
       * string version of satoshis
       */
      value: string;
      txId: string;
      address: string;
      outputIndex: number;
      script: string;
    }[]
  > {
    // [{"txid":"96c27faa60f61e361fc29e4d74a171b6a282b55463e463796907bbdb9dcfd9c2","vout":0,"value":"46978","confirmations":0,"lockTime":683916,"scriptPubKey":"001479f04cb2e77de4a7b02927bd24e2775959672e54"}]
    var utxos = await NowNodes.api(this.ticker, "utxo/" + address);

    // convert to bitcore-lib format

    /**
     * bitcore-explorers converts json to UnspentOutput class
     * https://github.com/bitpay/bitcore-explorers/blob/master/lib/insight.js#L99
     */
    var converted = utxos.map((utxo) => {
      var u = new UnspentOutput({
        satoshis: parseInt(utxo.value),
        txId: utxo.txid,
        scriptPubKey: utxo.scriptPubKey,
        address: address,
        outputIndex: utxo.vout,
        script: null,
      });

      // keep string version
      u.value = utxo.value;

      return u;
    });

    return converted;
  }

  /**
   * Broadcasts your transaction to the network. Returns the txid as a string;
   * @param signedHex - The serialized transaction in hex
   * @returns {string} The transaction id.
   */
  async broadcast(signedHex: string): Promise<string> {
    return await NowNodes.api(this.ticker, "sendtx/" + signedHex);
  }
}
