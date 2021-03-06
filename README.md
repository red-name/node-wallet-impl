# Node Crypto Wallet Implemtation
My Javascript implemtation on BTC, BCH, ETH, LTC, and XMR wallets. These wallets are designed only to spend funds. You must source your own blockchain API, such as fetching utxos/broadcasting txs.

This is not a package. This is a practical implemtation for a NodeJS Crypto wallet.
## Bitcoin

HD Wallet.
Extended Public and Private key needed. Exodus wallet does not currently support viewing your extended private key(xprv)

Extended Keys are used to generate children addresses. This wallet is programmed to search your children addresses for
funds. All change is returned to the first child address.


```js
var wallet = new BitcoinHDWallet("xpub", "xprv");

// Sends ~$45 to the recipient address (+$6 fee)
var txid = await wallet.send("recipientAddress", 0.001, 0.00015);

// view your transaction on the mainnet
console.log("https://blockchair.com/bitcoin/transaction/" + txid);
```

## Bitcoin Cash

HD Wallet
```js
var wallet = new BitcoinCashHDWallet("xpub", "xprv");

// Sends ~$45 to the recipient address (+6 cent fee)
var txid = await wallet.send("recipientAddress", 0.045, 0.00006);

// view your transaction on the mainnet
console.log("https://blockchair.com/bitcoin-cash/transaction/" + txid);
```

## Ethereum

Wallet. Private key needed.
```js
var wallet = new EthereumWallet("address", "privateKey");

// Sends ~$45 to the recipient address (+$13 fee)
var txid = await wallet.send("recipientAddress", 0.012, 0.003);

// view your transaction on the mainnet
console.log("https://etherscan.io/tx/" + txid);
```

## Litecoin

HD Wallert
```js
var wallet = new LitecoinHDWallet("xpub", "xprv");

// Sends ~$45 to the recipient address (+1 cent fee)
var txid = await wallet.send("recipientAddress", 0.17, 0.00004);

// view your transaction on the mainnet
console.log("https://blockchair.com/litecoin/transaction/" + txid);
```

## (coming soon) Monero

Wallet


## Dependencies Used

| Package          | Purpose                                       | Required For  |
|------------------|-----------------------------------------------|---------------|
| [bitcore-lib](https://www.npmjs.com/package/bitcore-lib)      | Pure JS solution for creating and signing txs | BTC, BCH, LTC |
| [bitcore-lib-cash](https://www.npmjs.com/package/bitcore-lib-cash) | Creating and signing Bitcoin-Cash txs         | BCH           |
| [litecore-lib-v5](https://www.npmjs.com/package/litecore-lib-v5)     | Creating and signing litecoin txs             | LTC           |
| [ethereumjs-tx](https://www.npmjs.com/package/ethereumjs-tx) | Creating and signing ethereum txs | ETH |
| [monerolib](https://www.npmjs.com/package/monerolib)        | Creating and signing Monero txs               | XMR           |
| [multicoin-address-validator](https://www.npmjs.com/package/multicoin-address-validator) | Validates generated addresses | All |

## About bitcore-explorers

Bitcore-explorers is now a defunct library. The Insights server, managed by Bitpay, is no longer usable. I recommend switching over to [NOWNodes.io](https://nownodes.io) for your blockchain api.

## About Monerolib

monerolib is not currently finished. Therefore, the Monero wallet is haulted until then.

## Getting xprvs from Exodus

Exodus Wallet has no method to view your xprvs (extended private keys)
You need to use a website like this: https://iancoleman.io/bip39/ (google "bip39 online" for alternatives)

1. Enter your secret phrase in BIP39 Mnemonic textbox (make sure you audit the source first!!)
2. xprv is in the Account Extended Private Key textbox

For Bitcoin Cash and Litecoin, scroll back up to Coin and select BCH or LTC. Also uncheck the Uncheck Prefixes, so it's in 'xprv...' form.

## Contrubiting

Feel free to open PRs and issues. If are you unsure of anything, don't hesitate to ask.

