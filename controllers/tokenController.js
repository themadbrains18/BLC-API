const { TokenNetworkModel } = require('../models/tokenDetail');
const { TokenModel } = require('../models/token');

const mongoose = require('mongoose')
/**
 * Get All Token List
 */

const getTokenList = async (req, res) => {
  try {
    let list = [];
    let networkList = await TokenNetworkModel.find({}).then((result) => {
      if (result) {
        result.map((item) => {
          list.push(item);
        })
        return list;
      }
    }).catch((error) => {
      console.log(error, '=====network error====')
    });

    TokenModel.find({}).then(async (result) => {
      if (result) {
        let tokenList = [];

        for await (const token of result) {
          let obj;

          const networkids  = token.networks
          let netWorks = [];
          for await (const obj of networkids) {

            let network = await networkList.filter((item) => {
              return item._id.toString() === obj._id;
            })
            if(network[0] !== undefined){
              let newobj={
                id : obj._id,
                CoinName: network[0].networkName,
                Network: network[0].Network,
                confirmations: network[0].confirmations,
                type: network[0].type,
                decimals: obj.decimals,
                fee :obj.fee,
                constract :obj.constract,
                abi:obj.abi
              }
  
              netWorks.push(newobj);
            }
            
          }


          obj = {
            _id: token._id,
            "coinName": token.coinName,
            "fullName" : token.fullanme,
            "confirmations": token.confirmations,
            "createdAt": token.createdAt,
            "decimals": token.decimals,
            "image": token.image,
            "minimum_withdraw": token.minimum_withdraw,
            "type": token.type,
            "updatedAt": token.updatedAt,
            "network": netWorks
          }
          tokenList.push(obj);
        }
        return res.send({ status: 200, data: tokenList });
      }
    })
  } catch (error) {
    console.log(error);
    return res.send({ status: 401, message: error.message });
  }
}

/**
 * Get token Network List
 */
const getTokenNetwork = async () => {
  
  try {
    let list = [];
    await TokenNetworkModel.find().then((result) => {
      if (result) {
        result.map((item) => {
          list.push(item);
        })
        return list;
      }
    }).catch((error) => {
      console.log(error, '=====network error====')
    })
  } catch (error) {
    console.log(error);
  }
}


//=====================================================//
//   list new token in exchnage
//=====================================================//

const newTokenListing = async (req, res) => {
  const data = req.body;
  try {
    const tokenCreate = new TokenModel(data);
    tokenCreate.save().then((item) => {
      res.status(200).send({ status: 200, message: 'Token Successfully list in exchange' })
    }).catch((error) => {
      res.status(400).send({ status: 400, message: error })
    })

  } catch (error) {
    res.status(400).send({ message: error })
  }
}


//=====================================================//
//   list update token in exchnage
//=====================================================//


const updateToken = async (req, res) => {
    const { tokenId } = req.params 
    try {

      //=======================================//
      // find record
      //=======================================//

      var exitsToken = await TokenModel.findOne({_id : tokenId})

      if(Object.keys(exitsToken).length > 0){
        await TokenModel.update({_id : tokenId},req.body) 
        res.status(200).send({message : "Token Updated successfull."})
      }else{
        res.status(400).send({message : "Opps! something went wrong. Please try again."})
      }

    } catch (error) {
      res.status(400).send({message : error.message , status : 400})
    }
}


//================================================//
// delete token 
//================================================//

const deleteToken = async (req, res) => {
    const { tokenId } = req.params 
    try {
       //=======================================//
      // find record
      //=======================================//
      var exitsToken = await TokenModel.findOne({_id : tokenId})

      if(Object.keys(exitsToken).length > 0){
        await TokenModel.deleteOne({_id : tokenId}) 
        res.status(200).send({message : "Token deleted successfull."})
      }else{
        res.status(400).send({message : "Opps! something went wrong. Please try again."})
      }
    } catch (error) {
       res.status(400).send({message : error.message , status : 400})
    }
}

const topGainer = async(req,res)=>{
  try {
    await fetch('https://api2.bybit.com/v3/private/useroperate/markets/querySymbolNewListing').then(response => response.text())
      .then(result => {
        if (result) {
          return res.send({ status: 200, data: JSON.parse(result)  });
        }
        else {
          return response.send({ status: 200, data: 'something wrong' });
        }

      })
      .catch(error => console.log('error', error));
  } catch (error) {
    res.status(400).send({message : error.message , status : 400})
  }
}

module.exports = {
  deleteToken,
  updateToken,
  newTokenListing,
  getTokenList,
  getTokenNetwork,
  topGainer
}