const { paymentModel } = require('../models/paymentModel.js')
const { userPaymentModel } = require('../models/usersPaymentModel.js')
const { userColl } = require('../models/user.js')
const bcrypt = require('bcryptjs')

const fs = require("fs");
//************************************************************//
// add_payment_method
//************************************************************//

const add_payment_method = async (req, res) => {
    const { payment_method, icon, region, fields } = req.body
    try {
        //  await uploadFile(req, res); icon is pending part 
        //  get existing payment method list 
        $existingList = await paymentModel.findOne({ payment_method: payment_method })
        if ($existingList) return res.status(404).send({ status: 404, message: 'Payment method already register.' })

        // if new request then proceed

        let $data = await new paymentModel(req.body)

        $data.save()
        res.status(200).send({ status: 200, message: 'Payment method successfully submitted.' })


    } catch (error) {
        res.status(400).send({ "status": 400, "message": error.message })
    }
}


//************************************************************//
// payment method  get by rigion
//************************************************************//

const pmGetByRegison = async (req, res) => {
    const { region } = req.params

    try {

        let pmList = await paymentModel.find({})

        res.status(200).send({ status: 200, result: pmList })

    } catch (error) {
        res.status(400).send({ status: 400, message: error.message })
    }
}


//************************************************************//
// save user payment method list
//************************************************************//

const save_user_pm = async (req, res) => {
    const { pm_name, pmid, tradingPassword, editID, qr_code } = req.body

    console.log(req.body, 'req.body')
    if (qr_code !== '' && qr_code !== undefined) {
        let ext = qr_code.split(';')[0].split('/')[1];
        console.log(ext, '==========ext')

        let base64 = qr_code.split(',')[1]
        console.log(base64, '==========base64')

        //=================remove from directory
        // await fs.unlink(('./assets/document/' + req.user._id + "_qr." + ext), function (err) {
        //     if (err) console.log(err);
        //     console.log('file deleted successfully');
        // });

        //=================convert base64 to buffer
        const buffer = await Buffer.from(base64, "base64");

        //=================write file in directory
        let pathRoot = req.user._id+"_"+ Date.now() + "_qr." + ext;
        await fs.writeFileSync(('./assets/document/' + pathRoot), buffer);

        req.body.qr_code = pathRoot;
    }

    console.log(req.body, 'req.body')

    try {
        userColl.findOne({ _id: req.user._id }).then(async (user) => {
            if (user) {
                console.log(user.tradingPassword, 'DB password')
                console.log(tradingPassword, 'request password')

                await bcrypt.compare(tradingPassword, user.tradingPassword, async function (err, response) {
                    console.log(response)
                    if (err) {
                        // handle error
                        console.log('password not match')
                    }
                    if (response) {
                        // Send JWT
                        let result;
                        // add payment method
                        if (editID === "") {
                            result = await userPaymentModel.create({
                                pm_name: pm_name,
                                pmid: pmid,
                                pmObject: req.body,
                                user_id: req.user._id

                            })
                            res.status(200).send({ "status": 200, "message": "Payment method successfully added.", result: result })
                        }
                        // Edit payment method
                        else {
                            await userPaymentModel.findOne({ _id: editID }).then(async (response) => {
                                if (response) {
                                    console.log(response);
                                    if (response.pmObject.qr_code !== undefined && response.pmObject.qr_code !== '') {
                                        if(req.body.qr_code === ''){
                                            req.body.qr_code = response.pmObject.qr_code
                                        }
                                    }
                                }
                            }).catch((err) => {
                                console.log(err)
                            })
                            result = await userPaymentModel.findOneAndUpdate({ _id: editID }, { pmObject: req.body }).then((editresut) => {
                                if (editresut) {
                                    console.log('edit successfully')
                                    userPaymentModel.findOne({ _id: editID }).then(async (response) => {
                                        if (response) {
                                            // console.log(response);
                                            // if (response.pmObject.qr_code !== undefined && response.pmObject.qr_code !== '') {
                                            //     let extenstion = response.pmObject.qr_code.split('.')[1];
                                            //     let path = './assets/document/' + response.pmObject.qr_code;
                                            //     const contents = await fs.readFileSync(path,(error)=>{
                                            //         if(error) console.log(error);
                                            //     });
                                            //     const b64 = contents.toString('base64')
                                            //     let record = `data:image/${extenstion};base64,${b64}`;
                                            //     res.status(200).send({ "status": 200, "message": "Payment method successfully updated.", result: response, attachment : record })
                                            // }
                                            // else{
                                                
                                            // }
                                            res.status(200).send({ "status": 200, "message": "Payment method successfully updated.", result: response })
                                        }
                                    }).catch((err) => {
                                        console.log(err)
                                    })
                                }
                            }).catch((error) => {
                                console.log(error);
                            })
                        }


                    }
                    else {
                        res.status(404).send({ "status": 404, "message": "Trading Password Not Matched.", result: {} })
                    }
                });
            }
        })

    } catch (error) {
        res.status(404).send({ status: 404, message: error.message })
    }
}



//************************************************************//
// get saved_user_pm_list
//************************************************************//


const saved_user_pm_list = async (req, res) => {
    try {
        const getPmlist = await userPaymentModel.find({ user_id: req?.user._id })
        res.status(200).send({ status: 200, result: getPmlist })
    } catch (error) {
        res.status(404).send({ status: 404, message: error.message })
    }
}


//************************************************************//
// upadte enabledanddisabled
//************************************************************//

const enabledanddisabled = async (req, res) => {
    try {
        const updateData = await userPaymentModel.updateOne({ _id: req.body.id }, { $set: { status: req.body.status } })
        const getData = await userPaymentModel.find({ _id: req.body.id })

        res.status(200).send({
            status: 200,
            message: "Payment Method status successfully updated",
            result: getData
        })
    } catch (error) {
        res.status(404).send({ status: 404, message: error.message })
    }
}



//************************************************************//
// delete payment method 
//************************************************************//

const delete_payment_method = async (req, res) => {
    const { id } = req.params
    try {
        const deletePM = await userPaymentModel.deleteOne({ _id: id, user_id: req.user._id })
        res.status(200).send({ status: 200, message: 'Payment method successfully deleted', result: deletePM })
    } catch (error) {
        res.status(404).send({ status: 404, message: error.message })
    }
}

module.exports = {
    add_payment_method,
    enabledanddisabled,
    pmGetByRegison,
    save_user_pm,
    saved_user_pm_list,
    delete_payment_method
}