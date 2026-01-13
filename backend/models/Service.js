const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String,
        enum: ['equipment', 'beverage', 'referee', 'other'],
        required: true
    }, // Loại dịch vụ: thuê đồ, đồ uống, trọng tài, khác
    description: {
        type: String,
        default: ''
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    unit: {
        type: String,
        default: 'item'
    }, // Đơn vị: item, hour, set, etc.
    image: {
        type: String,
        default: null
    },
    stock: {
        type: Number,
        default: 0
    }, // Số lượng còn lại
    isAvailable: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Service', serviceSchema);
