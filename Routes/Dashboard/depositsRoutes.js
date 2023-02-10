var express =require('express'); 
const {getAllTransaction } = require('../../controllers/Dashboard/depositsController') 
const {auth} = require('../../middleware/index');

const depositsRoutes = express.Router();

depositsRoutes.get('/all',auth,getAllTransaction)
module.exports = {
    depositsRoutes
  }