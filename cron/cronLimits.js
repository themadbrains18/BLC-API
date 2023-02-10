const { adminProfitModel } = require('../models/adminProfitModel');
const { TokenModel } = require('../models/token');
const { UserAssetsModel } = require('../models/userAssets');
const { createMarketOrderHistory, updateBuyerSellerOrderStatus } = require('./comman');

/**
 * 
 * @param {*} orders 
 * @param {*} marketPriceObj 
 */
const buySellOnLimit = (orders, marketPriceObj) => {

  try {
    /** Get/Filter buyer bids */
    let buyBids = orders.filter((item) => {
      return item.order_type === 'buy'
    })

    /** Get/Filter seller bids */
    let sellBids = orders.filter((item) => {
      return item.order_type === 'sell'
    })

    //======map function on buyer user array===============
    let previous_seller = [];
    for (const buyer of buyBids) {
      if (marketPriceObj[buyer.token] != undefined) {
        let marketPrice = marketPriceObj[buyer.token]['USDT'];
        if (previous_seller.length > 0) {
          sellBids = sellBids.filter((item) => {
            return item._id.toString() != previous_seller[0]._id.toString();
          })
        }
        //=====map function on seller user array=========
        for (const seller of sellBids) {
          if (buyer.token === seller.token && seller.amount_token >= buyer.amount_token) {

            if (parseFloat(buyer.limit_usdt) >= parseFloat(marketPrice)) {

              if (parseFloat(buyer.limit_usdt) >= parseFloat(seller.limit_usdt) && parseFloat(seller.limit_usdt) >= parseFloat(marketPrice)) {
                previous_seller.push(seller);
                let paid_usdt = parseFloat(buyer.amount_token) * parseFloat(marketPrice)
                console.log(paid_usdt, 'paid usdt amount');
                let paid_to_admin_usdt = parseFloat(buyer.volume_usdt) - parseFloat(paid_usdt);
                console.log(paid_to_admin_usdt, 'paid to admin usdt amount')
                processExecution(buyer, seller, marketPrice, paid_usdt, paid_to_admin_usdt)
              }
              // else if(parseFloat(seller.limit_usdt) === parseFloat(buyer.limit_usdt) && parseFloat(seller.limit_usdt)>= parseFloat(marketPrice)){
              //   console.log('buyer limit equal to seller limit and seller limit greater than/ equal to market price');
              // }
            }
            else if (buyer.limit_usdt > seller.limit_usdt && marketPrice >= buyer.limit_usdt) {
              console.log('here when seller limit less than buyer and price more than buyer')
              previous_seller.push(seller);
              let paid_usdt = parseFloat(buyer.amount_token) * parseFloat(seller.limit_usdt)
              console.log(paid_usdt, 'paid usdt amount');
              let paid_to_admin_usdt = parseFloat(buyer.volume_usdt) - parseFloat(paid_usdt);
              console.log(paid_to_admin_usdt, 'paid to admin usdt amount')
              processExecution(buyer, seller, marketPrice, paid_usdt, paid_to_admin_usdt)
            }
          }
        }
      }
    }
  } catch (error) {
    console.log(error)
  }

}

/**
 * process Execution function is call from buySellOnLimitPrice function
 * @param {*} buyer 
 * @param {*} seller 
 * @param {*} marketPrice 
 */
const processExecution = (buyer, seller, marketPrice, paid_usdt, paid_to_admin_usdt) => {

  // ==============================================================================
  //================= Seller token assets updates(eg: USD) ========================
  // ==============================================================================

  console.log('===here case 1');
  UserAssetsModel.find({ userID: seller.userid, walletType: 'main_wallet' }).then((assets) => {

    let usdtAsset = assets.filter((item) => {
      return item.token === 'USDT'
    })
    console.log('===here case 2');
    //===========check if seller USDT assets not exist =======================
    if (usdtAsset.length === 0) {
      UserAssetsModel.create({
        "userID": seller.userid,
        "accountType": 'Main Account',
        "token": 'USDT',
        "token_id": "632178ffd2e3551816b9b8ab",
        "network": "BEP20",
        "balance": paid_usdt,
        "walletType": 'main_wallet',
      }).then((record) => {
        if (record) {
          console.log('here add new assets in user account');
        }
      }).catch((err) => {
        console.log(err)
      })
    }
    //===========check if seller USDT assets exist =======================
    else {
      console.log('===here case 3');
      console.log('limit case seller usdt amount', parseFloat(usdtAsset[0].balance) + (parseFloat(paid_usdt)))
      UserAssetsModel.findOneAndUpdate({ _id: usdtAsset[0]._id.toString() }, { balance: parseFloat(usdtAsset[0].balance) + (parseFloat(paid_usdt)) }).then((responseUsdt) => {
        if (responseUsdt) {
          console.log('update usdt assets ')
        }
      })
    }

  }).catch((error) => {
    console.log(error, '==========')
  })
  //============================Seller assets updates End==========================


  // ==============================================================================
  // ==========================Buyer assets updates================================
  // ==============================================================================

  console.log('===here case 7')
  UserAssetsModel.find({ userID: buyer.userid, walletType: 'main_wallet' }).then((buyerassets) => {
    let buyerTokenAsset = buyerassets.filter((item) => {
      return item.token === buyer.token
    })

    console.log('===here case 8');
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
          console.log('create buyer token assets error', err);
        })
      })
    }
    else {
      // update seller USDT assets when exist  
      console.log('===here case 9');
      UserAssetsModel.findOneAndUpdate({ _id: buyerTokenAsset[0]._id.toString() }, { balance: parseFloat(buyerTokenAsset[0].balance) + parseFloat(buyer.amount_token) }).then((responseUsdt) => {
        if (responseUsdt) {
          console.log('update buyer token assets ')
        }
      }).catch((error) => {
        console.log('update buyer token assets error', error);
      })
    }

  }).catch((error) => {
    console.log('buyer case error', error);
  })
  //==========================Buyer assets updates End=============================

  // ==============================================================================
  // ================= Admin token assets updates(eg: USD) ========================
  // ==============================================================================

  adminProfitModel.create({
    "buy_orderid": buyer._id.toString(),
    "sell_orderid": seller._id.toString(),
    "amount": paid_to_admin_usdt
  }).then((record) => {
    if (record) {
      console.log('here add new assets in admin account');
    }
  }).catch((err) => {
    console.log(err)
  })

  //============================Admin assets updates End==========================

  //=======================Update market buy sell record after matched=============
  updateBuyerSellerOrderStatus(buyer, seller, marketPrice);

  //=======================Save Entry In Market History============================
  createMarketOrderHistory(buyer, seller, marketPrice);

}


module.exports = {
  buySellOnLimit
}