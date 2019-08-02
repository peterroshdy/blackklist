var express = require('express');
var router = express.Router();
var { checkAuth } = require('../middlewares/isAuth');
const Phone = require('../models/Phone');
var moment = require('moment');

/* GET dashboard page. */
router.get('/dashboard', checkAuth, (req, res) => {
    
    Phone.find({}).sort( { created_at: -1 } ).limit(25).then(phones => {
        checkLang(req, res, 'dashboard/index', {phones, moment: moment});
    }).catch((err) => console.log(err));
    
});

/* GET phone info page. */
router.get('/phone/:id', checkAuth, (req, res) => {
    
    Phone.findById(req.params.id).then(phone => {
        if(phone){
            checkLang(req, res, 'dashboard/phone', {phone, moment: moment});
        }else{
            res.redirect("/dashboard");
        }
        
    }).catch((err) => console.log(err));
    
});

/* GET Add new phone page. */
router.get('/add_new_phone', checkAuth, (req, res) =>{
    checkLang(req, res, 'dashboard/add_new_phone');
});

/* POST Add new phone page. */
router.post('/add_new_phone', checkAuth, (req, res) =>{
    var { user_id,  owner_name, contact_number, brand, model_number, imei_number, notes} = req.body;
    bad_msgs = [];

    // Check if any of the required fields are empty
    if(!owner_name || !contact_number || !brand || !model_number){
        bad_msgs.push({msg: "يجب عدم ترك أيًا من الحقول التالية فارغ : أسم المالك، رقم التواصل، ماركة الهاتف، رقم الموديل"});
        checkLang(req, res, 'dashboard/add_new_phone', {bad_msgs, owner_name, contact_number, brand, model_number, imei_number, notes});
    }

    // Check if any of the entries got more than a 100 char- 
    if(owner_name.length > 100 || contact_number.length > 100 || brand.length > 100 || model_number.length > 100){
        bad_msgs.push({msg: "يجب ألا تزيد عدد الأحرف في الحقول التالية عن 100 حرف : أسم المالك، رقم التواصل، ماركة الهاتف، رقم الموديل"});
        checkLang(req, res, 'dashboard/add_new_phone', {bad_msgs, owner_name, contact_number, brand, model_number, imei_number, notes});
    }

    // Check if IMEI number is 15 letters
    if(imei_number && imei_number.length != 15){
        bad_msgs.push({msg: "مكون من 15 حرف IMEI رقم"});
        checkLang(req, res, 'dashboard/add_new_phone', {bad_msgs, owner_name, contact_number, brand, model_number, imei_number, notes});
    }

    // Check if notes is not over 500 letters
    if(notes.length > 500){
        bad_msgs.push({msg: "يجب ألا تزيد الملاحظات عن 500 حرف"});
        checkLang(req, res, 'dashboard/add_new_phone', {bad_msgs, owner_name, contact_number, brand, model_number, imei_number, notes});
    }

    // Add to DB
    brand = brand.toUpperCase();
    model_number = model_number.toUpperCase();
    imei_number = imei_number.toUpperCase();
    var phone = new Phone({
        user_id,
        owner_name,
        brand, 
        model_number,
        imei_number,
        contact_number,
        notes,
    });

    phone.save((err) => {
        if(err) throw err;
        req.flash("success_msg", "تم أضافة الهاتف بنجاح");
        res.redirect("/dashboard");
    });
});

/* Search . */
router.post("/search", (req, res) => {
    // Search by the phone brand
    const {query} = req.body;
    Phone.find({brand: query.toUpperCase()}).sort( { created_at: -1 } ).then(phones => {
        if(phones != ''){
            checkLang(req, res, 'dashboard/search', {phones, moment});
            
        }else{
            // Search by the phone model number
            Phone.find({model_number: query.toUpperCase()}).sort( { created_at: -1 } ).then(phones => {
                // Search by the IMEI 
                if(phones != ''){
                    checkLang(req, res, 'dashboard/search', {phones, moment});
                }else{
                    Phone.find({imei_number: query.toUpperCase()}).sort( { created_at: -1 } ).then(phones => {
                        checkLang(req, res, 'dashboard/search', {phones, moment});
                    }).catch((err) => console.log(err))
                }
            }).catch((err) => console.log(err));
        }
        
    }).catch((err) => console.log(err));
});

router.get('/search', (req, res) => {
    res.redirect('/dashboard');
});

router.get('/remove/:id', (req, res) => {
    Phone.findById(req.params.id).then(phone => {
        if (phone.user_id == req.user.id) {
            Phone.findByIdAndDelete(req.params.id).then(pphone => {
                res.redirect('/dashboard');
            });
        }else{
            console.log("you are not the user");
            res.redirect('/dashboard');
        }
    }).catch((err) => console.log(err));
    
});


module.exports = router;