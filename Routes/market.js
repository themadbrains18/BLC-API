var express =require('express'); 
const { getAllCoins, cancelOrders, websocketTokenOrderController } = require('../controllers/marketController') 
// import auth from '../middleware/index.js'


const marketRoutes = express.Router();

//*******************************************************//
// all routes here!
//*******************************************************//

marketRoutes.get('/coin',getAllCoins);
marketRoutes.post('/cancel', cancelOrders);
marketRoutes.get('/chartData', websocketTokenOrderController);


//*******************************************************//
// all routes here!
//*******************************************************//

module.exports = {
  marketRoutes
}