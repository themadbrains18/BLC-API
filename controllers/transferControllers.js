
const { TransferModel } = require('../models/transfer')

//*************************************************//
// Transfer list get by User id
//*************************************************//

const getTransferHistory= async(req, res)=>{
   
    try {
        let userID = req.user._id;
        let data = await TransferModel.find({ userid: userID })  
        res.status(200).send({ status: 200, results: data })
    } catch (error) {
        res.status(404).send({ message: error.message, status: 404 })
    }
}



module.exports = {
    getTransferHistory
}