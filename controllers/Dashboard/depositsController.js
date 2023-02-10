
const { DepositModel } = require('../../models/deposit');


/**
 * Get Deposit Transaction History
 * @param {*} req 
 * @param {*} res 
 */
const getAllTransaction = async (req, res) => {

try{

  DepositModel.find({}).then((result) => {
    if (result.length > 0) {
      res.send({ status: 200, data: result })
    }
    else {
      res.send({ status: 200, data: [] })
    }
  }).catch((error) => {
    return res.send({ status: 500, error })
  })
} catch (error) {
  return res.send({ status: 500, error })
}
  
}


module.exports = {
  getAllTransaction
}