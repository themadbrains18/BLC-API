const { TokenModel } = require('../models/token');
const { DepositModel } = require('../models/deposit');
const { userColl } = require('../models/user');
const { UserAssetsModel } = require('../models/userAssets');
const { createDepositData, createTRC20DepositData, createTRXDepositData } = require('../common/deposit');

/**createDepositData
 * Save Transaction To Deposit By Address
 * @param {*} req 
 * @param {*} res 
 */
const saveTransaction = async (req, res) => {
  try {
    let { userId } = req.body

    let chainids = JSON.parse(process.env.CHAINIDS);

    let address = await userColl.findOne({ _id: userId }).then((result) => {
      if (result) {
        return result.bep20Address;
      }
    })

    //Get existing token list
    let coinList = await TokenModel.find().then((result) => {
      let list = [];
      if (result) {
        result.map((item) => {
          list.push(item.coinName);
        })
        return list;
      }
    })

    let saveRecord = [];

    //Get token transaction record using chain_id and address
    for (const cid of chainids) {
      // console.log("https://api.covalenthq.com/v1/" + cid + "/address/" + address + "/transactions_v2/?quote-currency=USD&format=JSON&block-signed-at-asc=false&no-logs=false&key=ckey_1263655595e54742b4456f86a37");
      await fetch("https://api.covalenthq.com/v1/" + cid + "/address/" + address + "/transactions_v2/?quote-currency=USD&format=JSON&block-signed-at-asc=false&no-logs=false&key=ckey_1263655595e54742b4456f86a37")
        .then(response => response.text())
        .then(async (result) => {
          // console.log(JSON.parse(result).data.items,'data from block chain')
          if (result) {
            let data = JSON.parse(result).data.items;
            if (data.length > 0) {
              let trxHistory = await createDepositData(cid, data, address, coinList, res); //Filter transaction data that deposit only
              // console.log(trxHistory,'trx History')
              if (trxHistory.length > 0) {
                await saveDepositRecord(trxHistory, address, userId, res) //save DB
              }
            }
            saveRecord.push(cid);

          }
        })
        .catch(error => console.log('error', error));
    }
    if (chainids.length === saveRecord.length) {
      return res.send({ status: 200, data: 'Record Save successfully!' });
    }

  } catch (error) {
    console.log(error);
  }
}

/**
 * Save TRX transaction using address
 * @param {*} req 
 * @param {*} res 
 */
const saveTRXTransaction = async (req, res) => {
  try {
    let { userId } = req.body
    let address = await userColl.findOne({ _id: userId }).then((result) => {
      if (result) {
        return result.trc20Address;
      }
    })

    //Get existing token list
    let coinList = await TokenModel.find().then((result) => {
      let list = [];
      if (result) {
        result.map((item) => {
          list.push(item.coinName);
        })
        return list;
      }
    })

    //Get TRX transaction record using address
    let apiUrl = process.env.TRONAPIURL
    await fetch(apiUrl + address + '/transactions/?limit=200')
      .then(response => response.text())
      .then(async (result) => {
        
        if (result) {
          let data = JSON.parse(result).data;
          if (data.length > 0) {
            let trxHistory = await createTRXDepositData(data, address); //Filter transaction data that deposit only
            if (trxHistory.length > 0) {
              let saveRecord = await saveDepositRecord(trxHistory, address, userId, res) //save DB
              if (saveRecord.length > 0) {
                return res.send({ status: 200, data: 'Tron record save successfully!' })
              }
              else {
                return res.send({ status: 200, data: 'Tron record update successfully!' })
              }
            }
          }
          else{
            return res.send({ status: 200, data: 'No Record Found!' })
          }
        }
        
      })
      .catch(error => console.log('error', error));

  } catch (error) {
    console.log(error);
  }
}

/**
 * Save TRX token transaction TRC20
 * @param {*} req 
 * @param {*} res 
 */
const saveTRC20Transaction = async (req, res) => {
  try {
    let { userId } = req.body
    let address = await userColl.findOne({ _id: userId }).then((result) => {
      if (result) {
        return result.trc20Address;
      }
    })

    //Get existing token list
    let coinList = await TokenModel.find().then((result) => {
      let list = [];
      if (result) {
        result.map((item) => {
          list.push(item.coinName);
        })
        return list;
      }
    })

    //Get TRX transaction record using address
    let apiUrl = process.env.TRONAPIURL
    await fetch(apiUrl + address + '/transactions/trc20?limit=200')
      .then(response => response.text())
      .then(async (result) => {
        if (result) {
          let data = JSON.parse(result).data;
          if (data.length > 0) {
            let trxHistory = await createTRC20DepositData(data, address, coinList); //Filter transaction data that deposit only
            if (trxHistory.length > 0) {
              let saveRecord = await saveDepositRecord(trxHistory, address, userId, res) //save DB
              if (saveRecord.length > 0) {
                return res.send({ status: 200, data: 'Tron record save successfully!' })
              }
              else {
                return res.send({ status: 200, data: 'Tron record update successfully!' })
              }
            }
          }
          else {
            return res.send({ status: 200, data: data })
          }
        }
      })
      .catch(error => console.log('error', error));

  } catch (error) {
    console.log(error);
  }
}


/**
 * save transaction record in DB
 * @param {*} data 
 * @param {*} address 
 * @param {*} res 
 * @returns 
 */
const saveDepositRecord = async (data, address, userId, res) => {
  let save = [];
  let coinList = await TokenModel.find().then((result) => {
    if (result) {
      return result;
    }
  }).catch((error) => {
    console.log(error)
  });

  for (const record of data) {
    await DepositModel.findOne({ address: address, tx_hash: record?.tx_hash }).then(async (findrecord) => {
      // console.log(findrecord, 'Find Record in Deposit DB ');
      if (!findrecord) {
        // console.log('Find Record in Deposit DB 2');
        await DepositModel.create({ address: address, coinName: record?.tokenName, network: record?.network, amount: record?.value, tx_hash: record?.tx_hash, successful: record?.successful, blockHeight: record?.block_height, date: record?.block_signed_at }).then(async (result, index) => {
          // console.log(findrecord, 'create Record in Deposit DB 3');
          if (result) {
            let tokenfilter = coinList.filter((item) => {
              return item.coinName === record?.tokenName
            })
            // console.log(tokenfilter, 'token filter');
            await UserAssetsModel.findOne({ userID: userId, token: record?.tokenName, walletType: 'main_wallet' }).then(async (findAssets) => {
              if (findAssets) {
                let amount = parseFloat(findAssets.balance) + parseFloat(record?.value);
                await UserAssetsModel.findOneAndUpdate({ _id: findAssets._id }, { balance: amount }).then((update) => {
                  if (update) {
                    console.log('update');
                  }
                }).catch((error) => {
                  console.log(error);
                })
              }
              else {
                await UserAssetsModel.create({
                  "userID": userId,
                  "accountType": 'Main Account',
                  "token": record?.tokenName,
                  "token_id": tokenfilter[0]._id,
                  "network": record?.network,
                  "balance": record?.value,
                  "walletType": 'main_wallet',
                }).then((result) => {
                  console.log('create');
                }).catch((error) => {
                  console.log(error);
                })
              }
            })

            save.push(result)
          }
        }).catch((err) => {
          console.log(err)
          return res.send({ status: 500, data: err });
        })
      }
    }).catch((error) => {
      return res.send({ status: 500, error: error });
    })
  }
  return save;

}

/**
 * Get Deposit Transaction History
 * @param {*} req 
 * @param {*} res 
 */
const getTransaction = async (req, res) => {
  let { userId } = req.body
  let user = await userColl.findOne({ _id: userId }).then((result) => {
    if (result) {
      return result;
    }
  })

  DepositModel.find({ address: user.bep20Address }).then((result) => {
    if (result.length > 0) {
      res.send({ status: 200, data: result })
    }
    else {
      DepositModel.find({ address: user.trc20Address }).then((result2) => {
        if (result2.length > 0) {
          res.send({ status: 200, data: result2 })
        }
        else {
          res.send({ status: 200, data: [] })
        }
      })
    }
  }).catch((error) => {
    res.send({ status: 500, error })
  })
}


module.exports = {
  saveTransaction,
  saveTRXTransaction,
  saveTRC20Transaction,
  getTransaction
}