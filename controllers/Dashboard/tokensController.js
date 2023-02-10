const { TokenModel } = require('../../models/token');
const {TokenNetworkModel} =require('../../models/tokenDetail')


const mongoose = require('mongoose')

const createTokenList = async (req, res) => {

  const data = req.body;
  console.log("====req.body", req.body)
  try {
    var existToken = await TokenModel.findOne({ coinName: req.body.coinName })
    if(!existToken){
      const tokenCreate = await new TokenModel(data);
  
      await tokenCreate.save().then((item) => {
        res.status(200).send({ status: 200, message: 'Token Successfully list in exchange' })
      }).catch((error) => {
        res.status(400).send({ status: 400, message: error })
      })

    }
    else{
      res.status(400).send({ status: 400, message: "Token Already exists" })
    }
  } catch (error) {
    res.status(400).send({ message: error })
  }
}

const getAllTokens = async (req, res) => {
   
  try {
    let netwotkList = await TokenNetworkModel.find({}).then((result) => {
    
      if (result) {
        return result;
      }
    })
    TokenModel.find({}).then(async (result) => {
      if (result.length > 0) {
        let a = []
        for (const e of result) {
          let tokenNetwork = e.networks;
          
          let ff = netwotkList.filter((item) => {
            for (const n of tokenNetwork) {
              if (n._id === item._id.toString()) {
                return item;
              }
            }
          })
          var obj = e.toObject();
          obj.networks = ff;
          a.push(obj)
        }
        res.send({ status: 200, data: a })
        
      }

      else {
        return res.send({ status: 200, data: {} });
      }
    })
  } catch (error) {
    return res.send({ status: 500, error });
  }
}


const updateToken = async (req, res) => {
  console.log("=====hiii")
  const { id } = req.params;
  try {

    //=======================================//
    // find record
    //=======================================//

    var existToken = await TokenModel.findOne({ _id: id })

    if (existToken) {
      await TokenModel.updateOne({ _id: id }, req.body)
      res.status(200).send({ message: "Token Updated successfull." })
    } else {
      res.status(400).send({ message: "Opps! something went wrong. Please try again." })
    }

  } catch (error) {
    res.status(400).send({ message: error.message, status: 400 })
  }
}


/**
 * Get specific token by id
 */


const getTokenByid = async (req, res) => {

  const { id } = req.params
  console.log(id)

  try {
    const getToken = await TokenModel.find({ _id: id })
    res.status(200).send(getToken)

  } catch (error) {
    res.status(400).send({ message: error.message, status: 400 })

  }
}


const tokenStatusUpdate = (req, res) => {
  try {
    TokenModel.findOneAndUpdate({ _id: req.body.tokenid }, { status: req.body.status }).then(async (user) => {
      if (user) {
        TokenModel.find({ _id: req.body.tokenid }).then((result) => {
          if (result) {
            res.send({ status: 200, data: result })
          }
        }).catch((err) => {
          res.send({ status: 500, data: err });
        })
      }
    }).catch((error) => {
      res.send({ status: 500, data: error });
    })
  } catch (error) {
    res.send({ status: 500, data: error });
  }

}

module.exports = {
  createTokenList,
  getAllTokens,
  getTokenByid,
  updateToken,
  tokenStatusUpdate,
}