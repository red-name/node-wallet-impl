import { ok } from "assert";

import litecore from "litecore-lib-v5";

import SpendableWallet from "./SpendableWallet";
import validateAddress from "./Validator";

var HDPublicKey = litecore.HDPublicKey;
var HDPrivateKey = litecore.HDPrivateKey;
var Address = litecore.Address;
var Networks = litecore.Networks;
var PrivateKey = litecore.PrivateKey;

/**
 * Hierarchical Deterministic Litecoin Wallet.
 *
 * Spend funds from children addresses via your xpub and xpriv.
 *
 * Exodus is a HD wallet for Litecoin.
 * Tripe Dots Icon -> Export XPub
 * For getting xprv, check the ReadMe for this repo.
 */
export default class LitecoinHDWallet extends SpendableWallet {
  constructor(
    public extendedPublicKey: string,
    public extendedPrivateKey: string
  ) {
    super("ltc", 8);

    ok(this.extendedPublicKey, "Extended Public key required (xpub)");
    ok(this.extendedPrivateKey, "Extended Private key required (xprv)");

    ok(
      validateAddress(this.getChildAddress(0), "ltc"),
      "must be valid child address"
    );

    var privateKey = new PrivateKey(
      this.getChildPrivateKeyWIF(0),
      Networks.livenet
    );

    // Verify this xpub and xpriv are related
    ok(
      privateKey.toAddress().toString() === this.getChildAddress(0),
      "private key must control public key"
    );
  }

  /**
   * Will return a the string representation of the address
   * @param index
   * @returns string
   * @see https://github.com/bitpay/bitcore-lib/blob/master/lib/address.js
   */
  getChildAddress(index: number): string {
    var hdPublicKey = new HDPublicKey(this.extendedPublicKey);

    var derived = hdPublicKey.derive(0).derive(index);

    var address = new Address(derived.publicKey, Networks.livenet);

    return address.toString();
  }

  /**
   * Returns hex-encoded string
   * @param index
   * @returns
   * @see https://github.com/bitpay/bitcore-lib/blob/master/lib/privatekey.js
   */
  getChildPrivateKey(index: number): string {
    var hdPrivateKey = new HDPrivateKey(this.extendedPrivateKey);

    var privateKey = hdPrivateKey.derive(0).derive(index);

    return privateKey.toString();
  }

  /**
   * Creates and broadcasts a transaction to the Bitcoin Cash Mainnet.
   * @param address - Receiving address
   * @param amount - In satoshis
   * @param minerFee - In satoshis
   * @returns
   */
  async send(
    address: string,
    amount: number,
    minerFee: number
  ): Promise<string> {
    if (
      typeof amount !== "number" ||
      Math.floor(amount) !== amount ||
      amount < 1
    ) {
      throw new Error("Invalid amount");
    }

    if (
      typeof minerFee !== "number" ||
      Math.floor(minerFee) !== minerFee ||
      minerFee < 1
    ) {
      throw new Error("Invalid minerFee.");
    }

    if (!validateAddress(address, "btc")) {
      throw new Error("Recipient address checksum failed");
    }

    var utxos = [];
    var keys = [];
    var check = 0;
    var i = 0;

    var totalSpend = amount + minerFee;

    var sats = 0;

    // fetch all unspent transactions on our children addresses
    // case 1: finds enough funds and spends them
    // case 2: cant accumulate enough funds. Stops scanning after 20 empty children, then throws error
    while (true) {
      var childAddress = this.getChildAddress(i);

      if (!validateAddress(childAddress, "btc")) {
        throw new Error(
          "Child Address " + i + " is invalid (" + childAddress + ")"
        );
      }

      var privateKey = this.getChildPrivateKey(i);

      try {
        var array = await this.getUnspentTransactions(childAddress);

        array.forEach((utxo) => {
          utxos.push(utxo);
          keys.push(privateKey);

          sats += parseInt(utxo.satoshis + "");
        });

        /**
         * reset exit case
         */
        if (array.length) {
          check = 0;
        }

        // enough found
        if (sats >= totalSpend) {
          break;
        }
      } catch (e) {}

      i++;
      check++;
      if (check > 20) {
        break;
      }
    }

    if (utxos.length == 0) {
      throw new Error(
        "No unspent transactions found (empty wallet, scanned " +
          i +
          " child addresses)"
      );
    }

    if (sats < totalSpend) {
      throw new Error(
        "Insufficient balance to spend " +
          totalSpend +
          " sats (found " +
          sats +
          " unspent)"
      );
    }

    /**
     * All change is returned to first child address
     */

    var changeAddress = this.getChildAddress(0);

    let ltc_tx = new litecore.Transaction()
      .from(utxos)
      .to(address, amount)
      .fee(minerFee)
      .change(changeAddress)
      .sign(keys)
      .serialize();

    // console.log(ltc_tx);

    // broadcast the transaction to the blockchain
    return await this.broadcast(ltc_tx);
  }
}
