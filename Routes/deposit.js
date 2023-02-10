var express =require('express'); 
const {saveTransaction ,getTransaction, saveTRXTransaction,saveTRC20Transaction} = require('../controllers/depositController')

const depositRoutes = express.Router();

//*******************************************************//
// all routes here!
//*******************************************************//

depositRoutes.post('/save', saveTransaction)
depositRoutes.post('/saveTrx',saveTRXTransaction)
depositRoutes.post('/saveTrc20',saveTRC20Transaction)
depositRoutes.post('/transaction', getTransaction)

//*******************************************************//
// all routes here!
//*******************************************************//

module.exports = {
  depositRoutes
}