const { orderModel } = require('../models/orderModel');
const { UserOtpModel } = require('../models/otpModel');
const { postModel } = require('../models/postModel');
const { UserAssetsModel } = require('../models/userAssets');
const { userPaymentModel } = require('../models/usersPaymentModel');

// ========================================================
/**
 * Save order when user Buy any currency
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
// ========================================================
const saveOrder = (req, res) => {
  try {
    const { postid, sell_userid, buy_userid, spend_currency, spend_amount, receive_amount, price, receive_currency, p_method, type } = req.body;
    let obj = { postid, buy_userid, sell_userid, currency: spend_currency, spend_currency, order_amount: spend_amount, spend_amount, quantity: receive_amount, receive_amount, price, token: receive_currency, receive_currency, p_method, type };
    orderModel.create(obj).then(async (result) => {
      if (result) {
        let postData = [];
        await postModel.findOne({ _id: postid }).then(async (post) => {
          if (post) {
            for (const d of JSON.parse(post.p_method)) {
              await userPaymentModel.findOne({ _id: d.id }).then((pmethod) => {
                if (pmethod) {
                  postData.push(pmethod)
                }
              })
            }
            let orderlist = [];
            orderlist.push({ orderData: result, p_method: postData });
            return res.send({ status: 200, data: orderlist });

          }
        })

      }
    }).catch((error) => {
      console.log(error)
      return res.send({ status: 500, error });
    })
  } catch (error) {
    console.log(error)
    return res.send({ status: 500, error });
  }
}

// ===============================================
/**
 * Cancle order by user id
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
// ===============================================
const cancelOrder = (req, res) => {
  try {
    const { postid, orderid } = req.body;
    orderModel.findOneAndUpdate({ _id: orderid }, { isCanceled: true, inProcess: false }).then(async (order) => {
      if (order) {
        await postModel.findOne({ _id: postid }).then((post) => {
          if (post) {
          }
        }).catch((err) => {
          console.log(err);
        })
        order.isCanceled = true;
        order.inProcess = false;
        order.isComplete = false;
        order.isReleased = false;
        return res.send({ status: 200, data: order, message: 'record update successfully!' });
        // return res.send({ status: 200, data: 'record update successfully!' });
      }
    }).catch((error) => {
      console.log(error);
    })

  } catch (error) {
    console.log(error)
    return res.send({ status: 500, error });
  }
}

// ===============================================
/**
 * Update order when user select payment and add screen shot
 * @param {*} req 
 * @param {*} res 
 */
// ===============================================

const updateOrder = async (req, res) => {
  try {
    const { orderid, p_method } = req.body;
    orderModel.findOneAndUpdate({ _id: orderid }, { p_method, inProcess: false, isComplete: true }).then(async (result) => {
      if (result) {
        result.isComplete = true;
        result.inProcess = false;
        result.p_method = p_method;
        res.send({ status: 200, data: result, message: 'Payment complete successfully' });
      }
    }).catch((error) => {
      console.log(error);
      res.send({ status: 500, error })
    })
  } catch (error) {
    console.log(error);
    res.send({ status: 500, error })
  }
}

const releaseOrder = async (req, res) => {
  const { orderid, number, otp, time } = req.body;
  try {
    UserOtpModel.findOne({ "username": number, "otp": otp }).then(async (otpResult) => {
      if (otpResult) {
        let addMin = 1;
        if (new Date(otpResult.createdAt).getTime() + addMin * 60000 > new Date(time).getTime()) {
          orderModel.findOneAndUpdate({ _id: orderid }, { isReleased: true }).then(async (result) => {
            if (result) {
              await postModel.findOne({ _id: result.postid }).then(async (post) => {
                if (post) {
                  let qty = post.quantity - parseFloat(result.receive_amount);
                  await postModel.findOneAndUpdate({ _id: result.postid }, { quantity: qty }).then((postUpdate) => {
                    if (postUpdate) {
                      console.log('update record');
                    }
                  })

                  await UserAssetsModel.findOne({ userID: result.buy_userid, walletType: "main_wallet", token: result.token }).then(async (asset) => {
                    if (asset) {
                      await UserAssetsModel.updateOne({ userID: result.buy_userid, walletType: "main_wallet", token: result.token }, { balance: asset.balance + result.receive_amount }).then((updateAsset) => {
                        if (updateAsset) {
                          console.log('update buyer assets')
                        }
                      }).catch((error) => {
                        return res.send({ status: 500, error })
                      })
                    }
                    else{
                      UserAssetsModel.create({
                        "userID": result.buy_userid,
                        "accountType": 'Main Account',
                        "token": result.receive_currency,
                        "token_id": post.token,
                        "network": "BEP20",
                        "balance": result.receive_amount,
                        "walletType": "main_wallet",
                      }).then((record) => {
                        if (record) {
                          console.log('user assets create')
                        }
                      }).catch((err) => {
                        console.log(err)
                        return res.send({ status: 500, error: err })
                      })
                    }
                  }).catch((error) => {
                    return res.send({ status: 500, error })
                  })
                  result.isReleased = true;
                  return res.send({ status: 200, data: result, message: 'Record Update Successfully!' });
                }
              }).catch((error) => {
                return res.send({ status: 500, error })
              })
              
            }
          }).catch((error) => {
            return res.send({ status: 500, error })
          })
        }
        else {
          console.log('OTP Expire')
          return res.send({ status: 404, message: 'OTP Expired' })
        }
      }
      else {
        console.log('OTP Not Matched')
        return res.send({ status: 404, message: 'OTP Not Matched' })
      }
    }).catch((error) => {
      return res.send({ status: 500, error })
    })

  } catch (error) {
    return res.send({ status: 500, error })
  }
}

// ==============================================
/**
 * Get Order list against user id
 * @param {*} req 
 * @param {*} res 
 */
// ==============================================

const getOrderList = async (req, res) => {
  try {
    let orderlist = [];
    // { buy_userid: req.user._id }
    await orderModel.find({ $or: [{ buy_userid: req.user._id }, { sell_userid: req.user._id }] }).then(async (result) => {
      if (result) {
        for (const order of result) {
          let postData = [];
          await postModel.findOne({ _id: order.postid }).then(async (post) => {
            if (post) {
              for (const d of JSON.parse(post.p_method)) {
                await userPaymentModel.findOne({ _id: d._id }).then((pmethod) => {
                  if (pmethod) {
                    postData.push(pmethod)
                  }
                })
              }
              orderlist.push({ orderData: order, p_method: postData });
            }
          })
        }
      }
      res.send({ status: 200, data: orderlist });
    }).catch((error) => {
      console.log(error);
      res.send({ status: 500, error });
    })

  } catch (error) {
    console.log(error);
    res.send({ status: 500, error });
  }
}

// ==============================================
/**
 * Get Sell Assets Order list against user id
 * @param {*} req 
 * @param {*} res 
 */
// ==============================================

const getSellAssetsList = async (req, res) => {
  try {
    let orderlist = [];
    await orderModel.find({ sell_userid: req.user._id }).then(async (result) => {
      if (result) {
        for (const order of result) {
          let postData = [];
          await postModel.findOne({ _id: order.postid }).then(async (post) => {
            if (post) {
              for (const d of JSON.parse(post.p_method)) {
                await userPaymentModel.findOne({ _id: d.id }).then((pmethod) => {
                  if (pmethod) {
                    postData.push(pmethod)
                  }
                })
              }
              orderlist.push({ orderData: order, p_method: postData });
            }
          })
        }
      }
      res.send({ status: 200, data: orderlist });
    }).catch((error) => {
      console.log(error);
      res.send({ status: 500, error });
    })

  } catch (error) {
    console.log(error);
    res.send({ status: 500, error });
  }
}

const getOrderById = async (req, res) => {
  try {
    const { orderid } = req.query;
    let orderlist = [];
    // { buy_userid: req.user._id }
    await orderModel.find({ _id: orderid }).then(async (result) => {
      if (result) {
        for (const order of result) {
          let postData = [];
          await postModel.findOne({ _id: order.postid }).then(async (post) => {
            if (post) {
              for (const d of JSON.parse(post.p_method)) {
                await userPaymentModel.findOne({ _id: d._id }).then((pmethod) => {
                  if (pmethod) {
                    postData.push(pmethod)
                  }
                })
              }
              orderlist.push({ orderData: order, p_method: postData });
            }
          })
        }
      }
      res.send({ status: 200, data: orderlist });
    }).catch((error) => {
      console.log(error);
      res.send({ status: 500, error });
    })

  } catch (error) {
    console.log(error);
    res.send({ status: 500, error });
  }
}

const sendOrderNotificationWs = (wss, ws, body) => {
  try {
    wss.clients.forEach(function e(client) {
      client.send(JSON.stringify({ status: 200, data: body, type: 'order' }));
    })
  } catch (error) {
    ws.send(JSON.stringify({ status: 500, data: error }))
  }
}

module.exports = {
  saveOrder,
  cancelOrder,
  updateOrder,
  getOrderList,
  getSellAssetsList,
  getOrderById,
  releaseOrder,
  sendOrderNotificationWs
}