const { UserAssetsModel } = require('../models/userAssets');
const { TransferModel } = require('../models/transfer');
const { TokenModel } = require('../models/token')
const jwt = require('jsonwebtoken')
/**
 * Get All Assets List Main_wallet, Trading_Wallet and Funding_Wallet
 */
const getAssetsList = async (req, res) => {
  try {

    let response = await getPriceOfTokenBYCurrency(req.user._id, 'USDT');
    let data = [];
    for (const item of response.tokenList) {

      let convertPrice = parseFloat(response.priceObj[item.token]['USDT']) * parseFloat(item.balance)
      let obj = {
        "_id": item._id,
        "userID": item.userID,
        "accountType": item.accountType,
        "walletType": item.walletType,
        "token": item.token,
        "network": item.network,
        "balance": item.balance,
        "USDT": convertPrice,
        "createdAt": item.createdAt,
        "updatedAt": item.updatedAt,
      }
      data.push(obj)
    }
    return res.send({ status: 200, data });
  } catch (error) {
    console.log(error);
    return res.send({ status: 401, message: error.message });
  }
}

/**
 * Transfer Assets from one account to another account
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */

const transferToWallet = async (req, res) => {
  const { user_id, sender, receiver, amount, token_id } = req.body;
  try {
    TokenModel.findOne({ _id: token_id }).then((result) => {
      if (result) {
        let tokenName = result.coinName;
        UserAssetsModel.find({ userID: user_id }).then((data) => {
          if (data) {
            let senderAssets = data.filter((item) => {
              return item.walletType === sender && item.token === tokenName;
            })
            let senderUpdateAmount = parseFloat(senderAssets[0].balance) - parseFloat(amount);

            let receiverAssets = data.filter((item) => {
              return item.walletType === receiver && item.token === tokenName;
            })

            UserAssetsModel.findOneAndUpdate({ _id: senderAssets[0]._id }, { balance: senderUpdateAmount }).then((sender) => {
              if (sender) {
                if (receiverAssets.length > 0) {
                  let receiverUpdateAmount = parseFloat(receiverAssets[0].balance) + parseFloat(amount);
                  UserAssetsModel.findOneAndUpdate({ _id: receiverAssets[0]._id }, { balance: receiverUpdateAmount }).then((receiver) => {
                    if (receiver) {
                      TransferModel.create({
                        'userid': user_id,
                        'senderAccount': sender.accountType,
                        'recieverAccount': receiver.accountType,
                        'coinName': tokenName,
                        'amount': amount
                      }).then(async (data) => {
                        if (data) {
                          console.log("===data",data)
                        }
                      }).catch((e) => {
                        console.log(e);
                        return res.send({ status: 500, message: "Something Wrong!!!", e });
                      })
                      UserAssetsModel.find({ userID: user_id }).then((finalresult) => {
                        if (finalresult) {
                          return res.send({ status: 200, data: finalresult });
                        }
                      }).catch((error) => {
                        console.log(error, 'get updated user assets');
                        return res.send({ status: 200, error: error });
                      })
                    }
                  }).catch((error) => {
                    console.log(error, 'Receiver Data update');
                    return res.send({ status: 200, error: error });
                  })
                }
                else {
                  UserAssetsModel.create({
                    "userID": user_id,
                    "accountType": receiver === 'trading_wallet' ? "Trading Account" : receiver === 'main_wallet' ? 'Main Account' : 'Funding Account',
                    "token": tokenName,
                    "token_id": senderAssets[0].token_id,
                    "network": senderAssets[0].network,
                    "balance": amount,
                    "walletType": receiver,
                  }).then((record) => {
                    if (record) {
                      UserAssetsModel.find({ userID: user_id }).then((finalresult) => {
                        if (finalresult) {
                          TransferModel.create({
                            'userid': user_id,
                            'senderAccount': sender.accountType,
                            'recieverAccount': receiver.accountType,
                            'coinName': tokenName,
                            'amount': amount
                          }).then(async (data) => {
                            if (data) {
                              console.log("===data",data)
                            }
                          }).catch((e) => {
                            console.log(e);
                            return res.send({ status: 500, message: "Something Wrong!!!", e });
                          })
                          return res.send({ status: 200, data: finalresult });
                        }
                      }).catch((error) => {
                        console.log(error, 'get updated user assets');
                      })
                    }
                  }).catch((err) => {
                    console.log(err)
                    return res.send({ status: 500, error: err })
                  })
                }

              }
            }).catch((error) => {
              console.log(error, 'Sender Data update');
              return res.send({ status: 500, error: error })
            })
          }
        }).catch((err) => {
          console.log(err, 'get user assets')
          return res.send({ status: 500, error: err })
        })
      }
    }).catch((err) => {
      console.log(err, 'get token by token id')
      return res.send({ status: 500, error: err })
    })
  } catch (error) {
    return res.send({ status: 500, error: error })
  }
}

/**
 * Get all assets Overview Details
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
const getAssetsOverView = async (req, res) => {

  let mainWalletAssets = 0;
  let tradingWalletAssets = 0;
  let fundingWalletAssets = 0;
  let convertPriceObj;

  let response = await getPriceOfTokenBYCurrency(req.user._id, req.query.currency);
  for (const item of response.tokenList) {
    console.log(response.priceObj, 'response priceObj')
    convertPriceObj = response.priceObj;
    let convertPrice = parseFloat(response.priceObj[item.token][req.query.currency]) * parseFloat(item.balance)
    if (item.walletType === 'main_wallet') {
      mainWalletAssets = mainWalletAssets + convertPrice
    }
    else if (item.walletType === 'trading_wallet') {
      tradingWalletAssets = tradingWalletAssets + convertPrice
    }
    else {
      fundingWalletAssets = fundingWalletAssets + convertPrice
    }

  }
  if (response.tokenList.length > 0) {
    let data = { overall: (mainWalletAssets + tradingWalletAssets + fundingWalletAssets), main: mainWalletAssets, trade: tradingWalletAssets, funding: fundingWalletAssets, convertPrice: convertPriceObj }
    return res.send({ status: 200, data });
  }
  else {
    return res.send({ status: 200, data: [] });
  }

}

/**
 * get token price with selected currency
 * @param {*} userid 
 * @param {*} currency 
 * @returns 
 */
const getPriceOfTokenBYCurrency = async (userid, currency) => {

  let tokenList = await UserAssetsModel.find({ userID: userid }).then(async (result) => {
    if (result) {
      return result
    }
  })

  if (tokenList.length > 0) {
    var requestOptions = {
      method: 'GET',
      redirect: 'follow'
    };
    let url = process.env.PRICECONVERTURL;
    let userToken = '';
    for (const item of tokenList) {
      if (userToken === '') {
        userToken = item.token;
      }
      else {
        if (!userToken.includes(item.token)) {
          userToken += ',' + item.token;
        }
      }
    }

    //Get token price json object
    /**
     * userToken is comma seperated token list
     */

    console.log(userToken);

    let priceObj = await fetch(url + "fsyms=" + userToken + "&tsyms=" + currency + '&api_key=' + process.env.MIN_API_KEY, requestOptions)
      .then(response => response.text())
      .then(result => {
        return JSON.parse(result);
      }).catch(error => console.log('error', error));

    return { tokenList, priceObj };
  }

  else {
    return { tokenList: [], priceObj: {} }
  }

}

module.exports = {
  getAssetsList,
  transferToWallet,
  getAssetsOverView
}