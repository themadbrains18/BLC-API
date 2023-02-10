const { marketBuySellModel } = require("../models/marketBuySellModel")
const { marketHistoryModel } = require("../models/marketHistory")

//===============================================================================
//=======================Save Entry In Market History============================
//===============================================================================

const createMarketOrderHistory = (buyer, seller, marketPrice) => {

  let historyObj = {
    buyer_orderid: buyer._id.toString(),
    seller_orderid: seller._id.toString(),
    buyer_userid: buyer.userid,
    seller_userid: seller.userid,
    token: buyer.token,
    market_type: buyer.market_type,
    buyer_limit: marketPrice,
    seller_limit: marketPrice,
    buyer_usdt_amount: parseFloat(buyer.amount_token) * parseFloat(marketPrice),
    seller_paying_usdt_amount: parseFloat(buyer.amount_token) * parseFloat(marketPrice),
    seller_pending_usdt_amount: (parseFloat(seller.amount_token) - parseFloat(buyer.amount_token)) * parseFloat(marketPrice),
    buyer_token_amount: parseFloat(buyer.amount_token),
    seller_token_amount: parseFloat(seller.amount_token) > parseFloat(buyer.amount_token) ? parseFloat(seller.amount_token) - parseFloat(buyer.amount_token) : parseFloat(seller.amount_token),
    seller_total_token: parseFloat(seller.amount_token)
  }
  marketHistoryModel.create(historyObj).then((history) => {
    if (history) {
      console.log('==here history created');
    }
  }).catch((error) => {
    console.log('history create error', error);
  })
}

//===============================================================================
//=======================Update market buy sell record after matched=============
//===============================================================================

const updateBuyerSellerOrderStatus = (buyer, seller, market) => {
  if (parseFloat(buyer.amount_token) === parseFloat(seller.amount_token)) {
    // console.log('===here case 5');
    marketBuySellModel.findOneAndUpdate({ _id: seller._id.toString() }, { status: 'success' }).then((updateMarketRecord) => {
      if (updateMarketRecord) {

      }
    }).catch((error) => {
      console.log('===seller market record update', error);
    })
  }
  // seller_token_value greater than buyer_token_value  market record update token value
  else {
    // console.log('===here case 6');
    marketBuySellModel.findOneAndUpdate({ _id: seller._id.toString() }, { amount_token: parseFloat(seller.amount_token) - parseFloat(buyer.amount_token) }).then((updateMarketRecord) => {
      if (updateMarketRecord) {
        // console.log('here ')
      }
    }).catch((error) => {
      console.log('===seller market record update', error);
    })
  }

  // console.log('===here case 7')
  marketBuySellModel.findOneAndUpdate({ _id: buyer._id.toString() }, { status: 'success' }).then((updateMarketRecord) => {
    if (updateMarketRecord) {

    }
  }).catch((error) => {
    console.log('===seller market record update', error);
  })
}

module.exports={
  createMarketOrderHistory,
  updateBuyerSellerOrderStatus
}