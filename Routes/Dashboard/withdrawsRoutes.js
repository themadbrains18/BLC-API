var express =require('express'); 
const {getAllWithdraw } = require('../../controllers/Dashboard/withdrawsController') 
const {auth} = require('../../middleware/index');

const withdrawsRoutes = express.Router();

withdrawsRoutes.get('/all',auth,getAllWithdraw)
module.exports = {
    withdrawsRoutes
  }