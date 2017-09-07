const url = require("url");
const ALLOWED_DOMAINS = ['www.cbd.int','chm.cbd.int','absch.cbd.int','bch.cbd.int'];

module.exports = {
    beforePhantomRequest: function(req, res, next) {
        var parsed = url.parse(req.prerender.url);

        if(~ALLOWED_DOMAINS.indexOf(parsed.hostname)) {
            next();
        } else {
            res.send(404);
        }
    }
}