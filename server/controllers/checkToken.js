let jwt = require('express-jwt');

module.exports.checkToken = jwt({
    secret: process.env.token_secret
});
