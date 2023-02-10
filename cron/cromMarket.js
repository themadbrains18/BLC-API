const { TokenModel } = require('../models/token');
const { UserAssetsModel } = require('../models/userAssets');
const { createMarketOrderHistory, updateBuyerSellerOrderStatus } = require('./comman');

/**
 * 
 * @param {*} orders 
 * @param {*} marketPriceObj 
 */
const buySellOnMarketPrice = (orders, marketPriceObj) => {

  /** Get/Filter buyer bids */
  let buyBids = orders.filter((item) => {
    return item.order_type === 'buy'
  })

  /** Get/Filter seller bids */
  let sellBids = orders.filter((item) => {
    return item.order_type === 'sell'
  })

  let previousSeller =[]; 
  
  buyBids.map(async (buyer) => {

    let marketPrice = marketPriceObj[buyer.token]['USD'];

    if(previousSeller.length >0){
      sellBids = sellBids.filter(function(el) { return el._id.toString() != previousSeller._id.toString(); });
    }

    previousSeller=[];

    sellBids.map(async (seller) => {
      if (marketPrice !== undefined) {
        if (buyer.token === seller.token && seller.amount_token >= buyer.amount_token) {

          previousSeller.push(seller);
          
          //==============================================================================
          //===================Seller assets updates======================================
          //==============================================================================

          UserAssetsModel.find({ userID: seller.userid, walletType: 'main_wallet' }).then((assets) => {

            let usdtAsset = assets.filter((item) => {
              return item.token === 'USDT'
            })

            if (usdtAsset.length === 0) { //check if seller USDT assets not exist 
              console.log(parseFloat(buyer.amount_token) * parseFloat(marketPrice),'Seller usdt amount');
              UserAssetsModel.create({
                "userID": seller.userid,
                "accountType": 'Main Account',
                "token": 'USDT',
                "token_id": "632178ffd2e3551816b9b8ab",
                "network": "BEP20",
                "balance": parseFloat(buyer.amount_token) * parseFloat(marketPrice),
                "walletType": 'main_wallet',
              }).then((record) => {
                if (record) {
                  console.log('here add new assets in user account');
                }
              }).catch((err) => {
                console.log(err)
              })
            }
            else {
              // update seller USDT assets when exist  
              console.log(parseFloat(usdtAsset[0].balance) + (parseFloat(buyer.amount_token) * parseFloat(marketPrice)),'Seller usdt amount');
              UserAssetsModel.findOneAndUpdate({ _id: usdtAsset[0]._id.toString() }, { balance: parseFloat(usdtAsset[0].balance) + (parseFloat(buyer.amount_token) * parseFloat(marketPrice)) }).then((responseUsdt) => {
                if (responseUsdt) {
                  // console.log('update usdt assets ')
                }
              })
            }
          }).catch((error) => {
            console.log(error, '==========')
          })

          //=====================Seller assets updates End=================================

          //===============================================================================
          //=====================Buyer assets updates======================================
          //===============================================================================

          // console.log('===here case 8')
          UserAssetsModel.find({ userID: buyer.userid, walletType: 'main_wallet' }).then((buyerassets) => {
            let buyerTokenAsset = buyerassets.filter((item) => {
              return item.token === buyer.token
            })

            if (buyerTokenAsset.length === 0) { //check if seller token assets not exist 
              TokenModel.findOne({ coinName: buyer.token }).then((token) => {
                UserAssetsModel.create({
                  "userID": buyer.userid,
                  "accountType": 'Main Account',
                  "token": buyer.token,
                  "token_id": token._id,
                  "network": "BEP20",
                  "balance": buyer.amount_token,
                  "walletType": 'main_wallet',
                }).then((record) => {
                  if (record) {
                    console.log('here add new assets in user account');
                  }
                }).catch((err) => {
                  console.log(err)
                })
              })
            }
            else {
              // update seller USDT assets when exist  
              // console.log('===here case 11');
              console.log(parseFloat(buyerTokenAsset[0].balance) + parseFloat(buyer.amount_token),' buyer token amount');
              UserAssetsModel.findOneAndUpdate({ _id: buyerTokenAsset[0]._id.toString() }, { balance: parseFloat(buyerTokenAsset[0].balance) + parseFloat(buyer.amount_token) }).then((responseUsdt) => {
                if (responseUsdt) {
                  // console.log('update token assets ')
                }
              })
            }

          }).catch((error) => {
            console.log('buyer case error', error);
          })
          //=======================Buyer assets updates End================================

          //=======================Update market buy sell record after matched=============
          updateBuyerSellerOrderStatus(buyer,seller,marketPrice);

          //=======================Save Entry In Market History============================
          createMarketOrderHistory(buyer,seller,marketPrice);
        }
      }
    })
  })
}




module.exports = {
  buySellOnMarketPrice
}
