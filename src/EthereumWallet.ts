import fetch from "node-fetch";
import SpendableWallet from "./SpendableWallet";

const hex = (d) => Number(d).toString(16).padStart(2, "0");
const EthereumTx = require("ethereumjs-tx").Transaction;

/**
 * NowNodes.io is a free blockchain API for getting UXTOS, transaction counts, etc.
 * You either need to get your own API Key
 * OR
 * Use an alternative service like Infura with Web3js
 */
const NowNodes = null;

/**
 * Light-weight Ethereum wallet.
 *
 * @see https://davekiss.com/ethereum-web3-node-tutorial/
 */
export default class EthereumWallet extends SpendableWallet {
  constructor(public address: string, public privateKey: string) {
    super("eth", 18);
  }

  /**
   * Returns in Wei
   * @param address
   * @returns
   */
  async getBalance(address: string): Promise<number> {
    // {"jsonrpc":"2.0","id":1,"result":"0x438070999dccf3"}
    var s = await NowNodes.rpc("eth", NowNodes.apiKey, {
      jsonrpc: "2.0",
      method: "eth_getBalance",
      params: [address, "latest"],
      id: 1,
    });

    return parseInt(s.result || 0);
  }

  async getTransactionCount(address: string): Promise<number> {
    // {"jsonrpc":"2.0","id":1,"result":"0x1"}
    var s = await NowNodes.rpc("eth", NowNodes.apiKey, {
      jsonrpc: "2.0",
      method: "eth_getTransactionCount",
      params: [address, "latest"],
      id: 1,
    });

    return parseInt(s.result || 0);
  }

  /**
   * Creates and broadcasts a transaction to Ethereum Mainnet.
   * @param address - Receiving address
   * @param amount - in Wei
   * @param minerFee - in Wei
   */
  async send(
    address: string,
    amount: number,
    minerFee: number
  ): Promise<string> {
    /**
     * 1. Find out what the balance of our wallet is to make sure we can afford to send the defined amount.
     */
    let myBalanceWei = await this.getBalance(this.address);
    if (!myBalanceWei) {
      throw new Error("Empty wallet");
    }

    if (amount + minerFee > myBalanceWei) {
      throw new Error("Insufficient balance");
    }

    /**
     * 2. Get the nonce to use for each individual transaction.
     */
    let nonce = await this.getTransactionCount(this.address);

    /**
     * 3. Find the current gas prices required to power our transaction through the network.
     */
    let gasPrices = await this.getCurrentGasPrices();

    // converts the gwei price to wei


    recommendedGas = Math.floor(minerFee / 21_000);


    let details = {
      to: address,
      value: hex(amount),
      gasLimit: hex(21000),
      gasPrice: hex(recommendedGas),
      nonce: hex(nonce),
    };

    /**
     * 4. Build the transaction and sign it using our wallet private key
     */
    // The second parameter is not necessary if these values are used
    const tx = new EthereumTx(details, {
      chain: "mainnet",
      hardfork: "petersburg",
    });

    tx.sign(Buffer.from(this.privateKey, "hex"));
    const serializedTransaction = tx.serialize();

    //console.log(serializedTransaction);

    /**
     * 5. Submit the transaction and view the details on Etherscan.
     */
    return await this.broadcast(serializedTransaction);
  }
}
