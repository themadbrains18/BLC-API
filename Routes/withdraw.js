var express =require('express'); 

let {auth} = require('../middleware/index.js')

const {getCoin, saveNewDepositRequest, withdrawByToken,getWithDrawHistory }  = require('../controllers/withdrawController')


const withdrawRoutes = express.Router();

//*******************************************************//
// all routes here!
//*******************************************************//

withdrawRoutes.get('/getTokenBalance/:token/:userid',getCoin)
withdrawRoutes.post('/add-withdraw-request/',auth,saveNewDepositRequest)
withdrawRoutes.get('/add-withdraw-request/:token',auth,withdrawByToken)
withdrawRoutes.get('/getwithdrawhistory',auth,getWithDrawHistory)


//*******************************************************//
// all routes here!
//*******************************************************//



module.exports = {
    withdrawRoutes
}