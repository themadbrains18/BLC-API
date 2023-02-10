const { MarketCapAPIURL } = require('../config/dbconfig.js')
const { TokenModel } = require('../models/token');
const { marketBuySellModel } = require('../models/marketBuySellModel');
const { UserAssetsModel } = require('../models/userAssets');


const getAllCoins = async (req, res) => {
  const token = req.headers['authorization'];
  // if (!token) {
  //   return res.status(401).send({ auth: false, message: 'unauthorized user.' });
  // }

  // let coins = await fetch(MarketCapAPIURL).then(response =>
  //   response.json()
  // )
  //   .then(result => { return result; })
  //   .catch(console.error);
  TokenModel.find({}).then(async (token) => {
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
      console.log('https://min-api.cryptocompare.com/data/pricemultifull?fsyms=' + symbol + '&tsyms=USDT&api_key='+process.env.MIN_API_KEY);
      let coins = await fetch('https://min-api.cryptocompare.com/data/pricemultifull?fsyms=' + symbol + '&tsyms=USDT&api_key='+process.env.MIN_API_KEY).then(response =>
        response.json()
      )
        .then(result => { return result; })
        .catch(console.error);
        
      let coinsArray = [];
      Object.keys(coins.RAW).forEach(element => {
        let coinItem = token.filter((item)=>{
          return item.coinName === element
        })
        if(coinItem != undefined && coinItem[0] != undefined){ 
          let obj = coins.RAW[element]['USDT'];
          obj.TOKENTYPE = coinItem[0].tokenType;
          obj.TOKENLOGOURL = coinItem[0].image;  
          coinsArray.push(obj);
        }
        
      });
      // console.log(coinsArray);
      return res.send({ status: 200, data: coinsArray });
    }
  })

}

const marketBuySell = (wss, ws, body) => {
  try {
    const { userid, token, user_address, market_type, order_type, limit_usdt, volume_usdt, amount_token } = body;

    let obj = { userid, token, user_address, market_type, order_type, limit_usdt, volume_usdt, amount_token };

    marketBuySellModel.create(obj).then((result) => {
      if (result) {
        console.log(result, 'market sell buy response');

        if (order_type === 'sell') {
          UserAssetsModel.findOne({ userID: userid, token: token }).then((asset) => {
            UserAssetsModel.findOneAndUpdate({ userID: userid, token: token }, { balance: parseFloat(asset.balance) - parseFloat(amount_token) }).then((assetsupdate) => {
              if (assetsupdate) {
                console.log('update seller token assets');
              }
            }).catch((error) => {
              console.log('update seller assets error on order create', error)
            })
          }).catch((error) => {
            console.log('get seller assets error', error)
          })

        }
        if (order_type === 'buy') {
          UserAssetsModel.findOne({ userID: userid, token: 'USDT' }).then((asset) => {
            UserAssetsModel.findOneAndUpdate({ userID: userid, token: 'USDT' }, { balance: parseFloat(asset.balance) - parseFloat(volume_usdt) }).then((assetsupdate) => {
              if (assetsupdate) {
                console.log('update buyer token assets');
              }
            }).catch((error) => {
              console.log('update buyer assets error on order create', error)
            })
          }).catch((error) => {
            console.log('get seller assets error', error)
          })

        }

        wss.clients.forEach(function e(client) {
          client.send(JSON.stringify({ status: 200, data: result, type: 'latest' }));
        })
      }

    }).catch((error) => {
      ws.send(JSON.stringify({ status: 500, data: error }))
    })
  } catch (error) {
    ws.send(JSON.stringify({ status: 500, data: error }))
  }
}

/**
 * Get all market order first time user reach on market
 * @param {*} socket 
 * @returns 
 */
const websocketOrderController = async (socket) => {
  // console.log('here after websocket controller call');
  try {
    await marketBuySellModel.find().sort({ "_id": -1 }).limit(50).then(async (result) => {
      if (result) {
        socket.send(JSON.stringify({ status: 200, data: result, type: 'all' }));
      }
    }).catch((error) => {
      console.log(error);
      return socket.send({ status: 500, error });
    })

  } catch (error) {
    console.log(error);
    return socket.send({ status: 500, error });
  }
}

// =======================================================================
// Cancel order bids by users
// =======================================================================
const cancelOrders = async (req, res) => {
  try {
    console.log(req.body.orders);
    const orders = req.body.orders;
    let orderLength =  orders.length;
    let count=0;
    for (const id of orders) {
      count = count+1;
      marketBuySellModel.findOneAndUpdate({_id : id},{isCanceled : true}).then((response)=>{
        if(response){
          if(count === orderLength){
            return res.send({ status: 200, data: 'order cancel successfully!.' });
          }
        }
      }).catch((error)=>{
        return res.send({status : 500, data : error});
      })
    }

  } catch (error) {
    console.log(error, 'error in try catch case');
  }

}

/**
 * Get all market order first time user reach on market
 * @param {*} socket 
 * @returns 
 */
 const websocketTokenOrderController = async (req,res) => {

  try {
    await marketBuySellModel.find({token: req.query.symbol}).then(async (result) => {
      if (result) {
        res.send({status :200,  data: result });
      }
    }).catch((error) => {
      console.log(error);
      return res.send({ status: 500, error });
    })

  } catch (error) {
    console.log(error);
    return res.send({ status: 500, error });
  }
}

module.exports = {
  getAllCoins,
  marketBuySell,
  websocketOrderController,
  cancelOrders,
  websocketTokenOrderController
}