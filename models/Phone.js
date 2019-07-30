const mongoose = require('mongoose');

const phoneSchema = mongoose.Schema({
    user_id: String,
    owner_name: {type: String, default: null},
    brand: {type: String, require: true},
    model_number: {type: String, require: true},
    imei_number: {type: String, default: null}, 
    contact_number: {type: String, require: true},
    notes: {type: String, default: null},
    created_at: {type: Date, default: Date.now},
});

module.exports = mongoose.model('phones', phoneSchema);