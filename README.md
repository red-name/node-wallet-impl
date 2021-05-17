# node-wallet-impl
My Javascript implemtation on BTC, BCH, ETH, LTC, and XMR wallets.

## Bitcoin

HD Wallet
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

Wallet
```js
var wallet = new EthereumWallet("address", "privateKey");

// Sends ~$45 to the recipient address (+$13 fee)
var txid = await wallet.send("recipientAddress", 0.012, 0.003);

// view your transaction on the mainnet
console.log("https://blockchair.com/ethereum/transaction/" + txid);
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
