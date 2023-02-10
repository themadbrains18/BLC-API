var express =require('express'); 
const {getAllOrder } = require('../../controllers/Dashboard/ordersController') 


const ordersRoutes = express.Router();

ordersRoutes.get('/all',getAllOrder)
module.exports = {
  ordersRoutes
  }