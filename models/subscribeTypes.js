const SubscribeTypesEnum = require('./../Enums/SubscribeTypesEnum');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');

const subscribeTypesSchema = new mongoose.Schema({
    name: String,
    reference: Number,
    bcryptRef: String,
    numberDates: {
        type: Number,
        min: 1
    }
});

const SubscribeType = mongoose.model('SubscribeType', subscribeTypesSchema);

async function createDefaultSubscribeTypes() {
    console.log(' ');
    for (const key in SubscribeTypesEnum) {

        let types = SubscribeTypesEnum[key];

        let result = await SubscribeType.findOne({ reference: types.reference });

        if (!result || result == null) {

            const salt = await bcrypt.genSalt(10);

            let bcryptRef = await bcrypt.hash(types.reference.toString(), salt);

            let subscribeType = new SubscribeType({
                name: types.name,
                reference: types.reference,
                bcryptRef: bcryptRef,
                numberDates: types.numberDates
            });

            subscribeType.save();
        }
    }
}

createDefaultSubscribeTypes();

exports.SubscribeType = SubscribeType;
exports.subscribeTypesSchema = subscribeTypesSchema;