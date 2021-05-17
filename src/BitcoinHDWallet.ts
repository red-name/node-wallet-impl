import { ok } from "assert";

delete (global as any)._bitcore;
var bitcore = require("bitcore-lib");
var HDPublicKey = bitcore.HDPublicKey;
var HDPrivateKey = bitcore.HDPrivateKey;
var PrivateKey = bitcore.PrivateKey;

var Address = bitcore.Address;
var Networks = bitcore.Networks;

import validateAddress from "../Validator";
import SpendableWallet from "./SpendableWallet";

/**
 * Hierarchical Deterministic Bitcoin Wallet.
 *
 * Spend funds from children addresses via your xpub and xpriv.
 *
 * Exodus is a HD wallet for Bitcoin.
 * Gear Icon -> Export XPub
 * Gear Icon -> View Private Keys
 */
export default class BitcoinHDWallet extends SpendableWallet {
  /**
   * Constructs a Bitcoin HD Wallet
   * @param extendedPublicKey - Also known as your 'xpub'
   * @param extendedPrivateKey - 'xpriv' or 'xprv'
   */
  constructor(
    public extendedPublicKey: string,
    public extendedPrivateKey: string
  ) {
    super("btc", 8);

    ok(this.extendedPublicKey, "Extended Public key required (xpub)");
    ok(this.extendedPrivateKey, "Extended Private key required (xprv)");

    // verify this xpub generates valid addresses
    ok(
      validateAddress(this.getChildAddress(0), "btc"),
      "must be valid child address"
    );

    // Verify this xpub and xpriv are related
    ok(
      new PrivateKey(this.getChildPrivateKey(0)).toAddress() ==
        this.getChildAddress(0),
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
    ok(typeof index === "number", "index must be number");
    ok(Math.floor(index) === index, "index must be an integer");
    ok(index >= 0, "index must be positive");

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
    ok(typeof index === "number", "index must be number");
    ok(Math.floor(index) === index, "index must be an integer");
    ok(index >= 0, "index must be positive");

    var hdPrivateKey = new HDPrivateKey(this.extendedPrivateKey);

    var privateKey = hdPrivateKey.derive(0).derive(index);

    return privateKey.toString();
  }

  /**
   * Creates and broadcasts a transaction to the Bitcoin Mainnet.
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

    // scan children addresses for funds
    // stops once enough funds are found
    // or
    // stops after 20 empty wallets
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

    let bitcore_transaction = new bitcore.Transaction()
      .from(utxos)
      .to(address, amount)
      .fee(minerFee)
      .change(changeAddress)
      .sign(keys)
      .serialize();

    //console.log(bitcore_transaction);

    // broadcast the transaction to the blockchain
    return await this.broadcast(bitcore_transaction);
  }
}
