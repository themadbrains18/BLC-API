const { TokenModel } = require("../../models/token");
const { orderModel } = require('../../models/orderModel');

const getAllCoins = async (req, res) => {
  const token = req.headers['authorization'];
  try {

    let orderList = await orderModel.find({}).sort({ 'createdAt': -1 }).limit(1).then(async (result) => {

      if (result) {
        return result;
      }
    })
    TokenModel.find({}).sort({ "_id": -1 }).then(async (token) => {

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
        let coins = await fetch('https://min-api.cryptocompare.com/data/pricemultifull?fsyms=' + symbol + '&tsyms=USDT&api_key='+process.env.MIN_API_KEY).then(response =>
          response.json()
        )
          .then(result => { return result; })
          .catch(console.error);

        let coinsArray = [];
        Object.keys(coins.RAW).forEach(element => {
          let coinItem = token.filter((item) => {
            return item.coinName === element
          })
          let obj = coins.RAW[element]['USDT'];
          obj.TOKENTYPE = coinItem[0].tokenType;
          obj.CREATEDAT = coinItem[0].createdAt;
          coinsArray.push(obj);
        });

        let a = []
        for (const e of token) {
          let coinList = e.coinName;
          let ff = orderList.filter((item) => {
            if (coinList === item.token) {
              return item
            }
          })
          var obj = e.toObject();
          obj.price = ff;
          a.push(obj)
        }
        const data = {
          all: coinsArray,
          recent: a
        }
        return res.send({ status: 200, data: data });
      }
    })
  } catch (error) {
    return res.send({ status: 500, data: error });
  }

}


module.exports = {
  getAllCoins
}