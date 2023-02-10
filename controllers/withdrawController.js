const { UserAssetsModel } = require('../models/userAssets.js')
const { withdrwaModel } = require('../models/withdraw.js')

const { UserOtpModel } = require('../models/otpModel.js')


const { tron_tx } = require('../core/core-withdraw.js')
/**
 *  get coin existing value
 */

const getCoin = async (req, res) => {
    const { userid, token } = req.params
    try {
        let assests = await UserAssetsModel.find({ userID: userid, token: token })
        // get user token total balance

        let total = await UserAssetsModel.aggregate([
            {
                "$match": {
                    "userID": userid,
                    "token": token
                }
            },
            {
                $group: {
                    _id: null,
                    totalBalance: { $sum: "$balance" }
                }
            }
        ])

        res.status(200).send({ status: 200, data: { result: assests, balance: total } })

    } catch (error) {
        res.status(400).send({ messagesd: error })
    }
}



//=======================================================//
// save withdraw request
//=======================================================//
var EPSILON = 0.000001;

function fp_less_than(A, B, Epsilon) {
    Epsilon = Epsilon || EPSILON;
    return (A - B < Epsilon) && (Math.abs(A - B) > Epsilon);
};

function fp_greater_than(A, B, Epsilon) {
    Epsilon = Epsilon || EPSILON;
    return (A - B > Epsilon) && (Math.abs(A - B) > Epsilon);
};


const saveNewDepositRequest = async (req, res) => {
    const { networkList, networkName, tokekAmount, walletAddress, otp, time, userName } = req.body

    try {

        //========================================//
        // Check OTP is valid or not 
        //========================================//

        UserOtpModel.findOne({ "username": userName, "otp": otp }).then(async (result) => {
            console.log('i am here')
            if (result) {
                let addMin = 2;
                if (new Date(result.createdAt).getTime() + addMin * 60000 > new Date(time).getTime()) {
                    console.log('Here Data Find')
                    //========================================//
                    // Check requested Balance is valid 
                    //========================================//

                    let userAssets = await UserAssetsModel.find({ userID: req.user._id, token: networkList[0]?.CoinName })

                    let mainBalance = userAssets.filter((e) => { return e.walletType === 'main_wallet' })
                    let trading_wallet = userAssets.filter((e) => { return e.walletType === 'trading_wallet' })
                    let funding_account = userAssets.filter((e) => { return e.walletType === 'funding_account' })

                    mainBalance = parseFloat(mainBalance[0]?.balance) > 0 ? parseFloat(mainBalance[0]?.balance) : 0
                    trading_wallet = parseFloat(trading_wallet[0]?.balance) > 0 ? parseFloat(trading_wallet[0]?.balance) : 0
                    funding_account = parseFloat(funding_account[0]?.balance) > 0 ? parseFloat(funding_account[0]?.balance) : 0

                    let tokenAmount = parseFloat(tokekAmount);
                    let fees = parseFloat(networkList[0]?.fee)

                    let fundFlag = false;
                    let flagTag = false;

                    //****************************************//
                    // if user pass any over amount //
                    //****************************************//

                    let availabeBalances = (mainBalance + trading_wallet + funding_account - fees)

                    if (fp_less_than(availabeBalances, tokenAmount)) {
                        return res.status(400).send({ message: `Your balance is low after fee deduction. Your entred value ${tokenAmount} -- Transaction Fees ${networkList[0]?.fee} --- Available ${(availabeBalances)}` })
                    }

                    //****************************************//
                    // value update in database //
                    //****************************************//

                    if (tokenAmount <= (mainBalance + fees)) {
                        flagTag = 'main' // main means sufficient balance make a request 
                        fundFlag = true
                        await UserAssetsModel.updateOne({ userID: req.user._id, walletType: "main_wallet", token: networkList[0]?.CoinName }, { balance: (mainBalance - (tokenAmount + fees)) })
                    } else if (tokenAmount <= (trading_wallet + trading_wallet - fees)) {
                        flagTag = 'trading' // main means sufficient balance make a request 
                        fundFlag = true

                        await UserAssetsModel.updateOne({ userID: req.user._id, walletType: "main_wallet", token: networkList[0]?.CoinName }, { balance: 0 })
                        await UserAssetsModel.updateOne({ userID: req.user._id, walletType: "trading_wallet", token: networkList[0]?.CoinName }, { balance: ((mainBalance + trading_wallet) - (tokenAmount + fees)) })
                    } else if (tokenAmount <= (trading_wallet + trading_wallet + funding_account + fees)) {
                        flagTag = 'funding' // main means sufficient balance make a request 
                        fundFlag = true
                        await UserAssetsModel.updateOne({ userID: req.user._id, walletType: "main_wallet", token: networkList[0]?.CoinName }, { balance: 0 })
                        await UserAssetsModel.updateOne({ userID: req.user._id, walletType: "trading_wallet", token: networkList[0]?.CoinName }, { balance: 0 })
                        await UserAssetsModel.updateOne({ userID: req.user._id, walletType: "funding_wallet", token: networkList[0]?.CoinName }, { balance: ((mainBalance + trading_wallet + funding_account) - (tokenAmount + fees)) })
                    }

                    //*****************************************************//

                    if (fundFlag) {




                        let dataReq = {
                            tekenRequest: networkList[0]?.id,
                            status: 0,
                            withdraw_wallet: walletAddress,
                            tx_hash: '',
                            tx_type: (networkList[0]?.decimals === 0) ? 'contract' : 'direct',
                            networkName: networkList[0]?.Network,
                            fee: networkList[0]?.fee,
                            requestObj: networkList[0],
                            type: networkList[0]?.type,
                            Symbol: networkList[0]?.CoinName,
                            requestedAmount: tokekAmount,
                            user_id: req.user._id
                        }

                        // new withdraw request add database  (NRW) New withdraw request
                        let nwr = await new withdrwaModel(dataReq)
                        nwr.save()

                        res.status(200).send({ message: 'Withdraw request successfully added in database.' })


                    } else {
                        res.status(400).send({ status: 400, message: 'Opps! something went wrong.' })
                    }
                    //*****************************************************//

                    //******************* reduces balance from user assests **************************//
                }
                else {
                    console.log('OTP expire')
                    res.status(400).send({ status: 400, message: 'Opps! OTP Expired.' })
                }
            }
            else {
                console.log('OTP not matched')
                res.status(400).send({ status: 400, message: 'Opps! OTP not matched.' })
            }
        })



    } catch (error) {
        res.status(400).send({ status: 400, message: error.message })
    }

}


//*************************************************//
// withdraw list get by token name
//*************************************************//

const withdrawByToken = async (req, res) => {
    const { token } = req.params;
    try {
        let userID = req.user._id;
        let data = await withdrwaModel.find({ user_id: userID, Symbol: token })
        res.status(200).send({ status: 200, results: data })
    } catch (error) {
        res.status(404).send({ message: error.message, status: 404 })
    }
}

const getWithDrawHistory= async(req, res)=>{
    try {
        let userID = req.user._id;
        let data = await withdrwaModel.find({ user_id: userID })
        res.status(200).send({ status: 200, results: data })
    } catch (error) {
        res.status(404).send({ message: error.message, status: 404 })
    }
}



module.exports = {
    withdrawByToken,
    saveNewDepositRequest,
    getCoin,
    getWithDrawHistory
}