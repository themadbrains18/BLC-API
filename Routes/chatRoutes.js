var express =require('express'); 
const {auth} = require('../middleware/index.js');
const {saveChat,getChat, getNotification, changeNotificationStatus } = require('../controllers/chatController')

const chatRoute = express.Router();

//*******************************************************//
// all routes here!
//*******************************************************//

chatRoute.post('/save', auth, saveChat);
chatRoute.get('/chat', getChat);
chatRoute.get('/notification',auth, getNotification);
chatRoute.post('/notification/update', changeNotificationStatus);

//*******************************************************//
// all routes here!
//*******************************************************//

module.exports = {
  chatRoute
}