const { marketBuySellModel } = require("../models/marketBuySellModel");
const { TokenModel } = require("../models/token");
const { buySellOnMarketPrice } = require("./cromMarket");
const { buySellOnLimit } = require("./cronLimits");

const transferAssetsToUsers = () => {
  try {
    marketBuySellModel.find({ status: 'pending',isCanceled: false }).then(async (marketResult) => {

      if (marketResult) {

        // console.log(marketResult.length, 'get pending result')
        var requestOptions = {
          method: 'GET',
          redirect: 'follow'
        };
        let url = process.env.PRICECONVERTURL;

        await TokenModel.find({}).then(async (token) => {
          if (token) {
            let symbol = '';
            for (const d of token) {
              if (symbol == '') {
                symbol = d.coinName
              }
              else {
                symbol += ',' + d.coinName;
              }
            }

            //====== get current market price for all token that in exchange =======================
            let priceObj = await fetch(url + "fsyms=" + symbol + "&tsyms=USDT&api_key="+process.env.MIN_API_KEY, requestOptions)
              .then(response => response.text())
              .then(result => {
                return JSON.parse(result);
              }).catch(error => console.log('error', error));

            //========= Market Based Request====================
            let marketRequest = marketResult.filter((item) => {
              return item.market_type === 'market'
            })

            // console.log(marketRequest.length, 'get market order result')
            if (marketRequest.length > 0) {
              buySellOnMarketPrice(marketRequest, priceObj);
            }

            //========= Limit Based Request======================
            let limitRequest = marketResult.filter((item) => {
              return item.market_type === 'limit'
            })

            // console.log(limitRequest.length, 'get limit order result')
            if (limitRequest.length > 0) {
              buySellOnLimit(limitRequest, priceObj);
            }
          }
        })
      }
    }).catch((error) => {
      console.log('getting error in market data', error);
    })
  } catch (error) {
    console.log('try catch error', error);
  }
}




module.exports = {
  transferAssetsToUsers
}