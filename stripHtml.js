const minify = require('html-minifier').minify;
const cherio = require('cherio');

const COMPRESSION_HEADER = 'X-Prerender-Compression-Ratio';
const options = {
	minifyCSS : true,
	minifyJS : true,
	removeComments : true,
	collapseWhitespace : true,
	preserveLineBreaks : true,
	removeEmptyAttributes : false,
	removeEmptyElements : false,
	html5:true
};

module.exports = {
	beforeSend(req, res, next) {
		if (!req.prerender.documentHTML) {
			return next();
		}
		var $ = cheerio.load(req.prerender.documentHTML);

		var as = $('a');
    var links = $('link');
    var imgs = $('img');

		$(links).each(function(i, link){
			 var href = $(this).attr('href');
			 href=req.get('Host')+href;
			 $(this).attr('href',href);
		   console.log($(this).attr('href'));
  	});
		$(as).each(function(i, link){
			 var href = $(this).attr('href');
			 href=req.get('Host')+href;
			 $(this).attr('href',href);
		   console.log($(this).attr('href'));
  	});
		$(imgs).each(function(i, link){
			 var href = $(this).attr('src');
			 href=req.get('Host')+href;
			 $(this).attr('src',href);
		   console.log($(this).attr('src'));
  	});
		var doc = $.html();
		const sizeBefore = doc.toString().length;
		req.prerender.documentHTML = minify(doc.toString(), options);
		const sizeAfter = req.prerender.documentHTML.toString().length;

		res.setHeader(COMPRESSION_HEADER, ((sizeBefore - sizeAfter) / sizeBefore).toFixed(4));
		next();
	}
};
