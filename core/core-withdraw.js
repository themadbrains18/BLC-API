const TronWeb = require('tronweb');

const HttpProvider = TronWeb.providers.HttpProvider;

//*********************** tron ************************//

async function sendTrx(fromAddress, toAddress, amount, privateKey, AppKey) {
    let headers = null;
    if (AppKey) {
        headers = { "TRON-PRO-API-KEY": AppKey };
    }
    const tronWeb = new TronWeb({
        fullHost: 'https://api.shasta.trongrid.io',
        headers: headers,   
        privateKey: privateKey,
    });
    const tradeobj = await tronWeb.transactionBuilder.sendTrx(
          tronWeb.address.toHex(toAddress),
          amount * 1000 * 1000,
          tronWeb.address.toHex(fromAddress)
    );
    const signedtxn = await tronWeb.trx.sign(
          tradeobj,
          privateKey
    );
    const receipt = await tronWeb.trx.sendRawTransaction(
          signedtxn
    );
    return receipt;
}

//   (async function() {
//     const fromAddress = "TL.....";
//     const toAddress = "TN.....";
//     const amount = 1.2;
//     const privateKey = "key";
//     const AppKey = "Tron Pro API Key - Optional";
//     await sendTrx(fromAddress, toAddress, amount, privateKey, AppKey);
// })();