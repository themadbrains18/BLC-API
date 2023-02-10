var express =require('express'); 
const {auth} = require('../middleware/index.js');
const {saveOrder , cancelOrder ,updateOrder, getOrderList, getSellAssetsList, getOrderById, releaseOrder} = require('../controllers/orderController')

const orderRoute = express.Router();

//*******************************************************//
// all routes here!
//*******************************************************//

orderRoute.post('/save', auth, saveOrder);
orderRoute.post('/cancel', auth, cancelOrder);
orderRoute.post('/update', auth, updateOrder);
orderRoute.get('/all', auth, getOrderList);
orderRoute.get('/sell', auth, getSellAssetsList);
orderRoute.get('/order', getOrderById);
orderRoute.post('/release',releaseOrder);

//*******************************************************//
// all routes here!
//*******************************************************//

module.exports = {
  orderRoute
}