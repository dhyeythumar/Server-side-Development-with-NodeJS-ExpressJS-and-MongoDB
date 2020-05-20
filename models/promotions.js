const mongoose = require('mongoose');
require('mongoose-currency').loadType(mongoose);
const Currency = mongoose.Types.Currency;

const Schema = mongoose.Schema;

// Document Schema.
const promoSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    label: {
        type: String,
        default: ''
    },
    price: {
        type: Currency,
        required: true,
        min: 0
    },
    featured: {
        type: Boolean,
        default: false      
    }
}, {
    timestamps: true
});

// This automatically creates the collection (table) named as "Promotions" if it doesn't find it. 
var Promotions = mongoose.model('Promotion', promoSchema);

module.exports = Promotions;