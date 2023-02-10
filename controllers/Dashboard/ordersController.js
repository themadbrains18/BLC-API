
const { orderModel } = require('../../models/orderModel');


/**
 * Get Deposit Transaction History
 * @param {*} req 
 * @param {*} res 
 */
const getAllOrder = async (req, res) => {
  try {
    orderModel.find({}).then((result) => {
      if (result.length > 0) {
        res.send({ status: 200, data: result })
      }
      else {
        res.send({ status: 200, data: [] })
      }
    }).catch((error) => {
      res.send({ status: 500, error })
    })
  }
  catch (error) {
    res.send({ status: 500, error })

  }

}

module.exports = {
  getAllOrder
}