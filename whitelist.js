const url = require("url");
const ALLOWED_DOMAINS = ['.cbd.int'];

module.exports = {
    beforePhantomRequest: function(req, res, next) {
        var parsed = url.parse(req.prerender.url);
console.log('parsed.hostname',parsed.hostname);
        if(ALLOWED_DOMAINS.indexOf(parsed.hostname) > -1) {
            next();
        } else {
            res.send(404);
        }
    }
}