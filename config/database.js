/* eslint-disable no-console */
const mongoose = require('mongoose');

const envFiles = {
    development: '.env',
    test: '.env.test',
    production: '.env.prod'
};

require('dotenv').config({ path: envFiles[process.env.NODE_ENV] });

const connect = async () => {
    const mongoConnectionString = process.env.MONGO_URI;
    try {
        const opts = {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        };
        await mongoose.connect(mongoConnectionString, opts);
        console.log(`Successfully conected to ${mongoConnectionString}`);
    } catch (err) {
        console.log(`Fail to connect with database ${mongoConnectionString}`);
    }
};
module.exports = { connect };