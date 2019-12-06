const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const urlSchema = new Schema(
    {
        originalUrl: String,
        shortUrl: String,
    }
)

const modelClass = mongoose.model('modelUrl', urlSchema);

module.exports = modelClass;