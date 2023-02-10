var express =require('express'); 
let multer = require('multer');

let {auth} = require('../middleware/index.js')
const { add_payment_method , pmGetByRegison, save_user_pm, saved_user_pm_list, enabledanddisabled, delete_payment_method}  = require('../controllers/paymentController')

let upload = multer();


const paymentsRoutes = express.Router();


//*******************************************************//
// all routes here!
//*******************************************************//

paymentsRoutes.post('/save',add_payment_method)
paymentsRoutes.get('/pm_methods',pmGetByRegison)
paymentsRoutes.get('/saved_user_pm_list',auth,saved_user_pm_list)


paymentsRoutes.post('/save_user_pm',auth,save_user_pm)
paymentsRoutes.patch('/enabledanddisabled',auth,enabledanddisabled)
paymentsRoutes.delete('/delete_payment_method/:id',auth,delete_payment_method)






//*******************************************************//
// all routes here!
//*******************************************************//


module.exports = {
    paymentsRoutes
}