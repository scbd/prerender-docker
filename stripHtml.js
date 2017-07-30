const minify = require('html-minifier').minify;
const cheerio = require('cheerio');
const urlParse = require('url-parse');

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
		//console.log(req);
		var $ = cheerio.load(req.prerender.documentHTML);

		var host = urlParse(req.prerender.url).protocol+'/'+ urlParse(req.prerender.url).host;

		var as = $('a');
    var links = $('link');
    var imgs = $('img');
		//
		$(links).each(function(i, link){

			 var href = $(this).attr('href');
			console.log(urlParse(href).host);
			 if(!urlParse(href).host){
					 href=host+href;
					 $(this).attr('href',href);
		 		}
		  //  console.log($(this).attr('href'));
  	});

		$(as).each(function(i, link){

			 var href = $(this).attr('href');

			 if(!urlParse(href).host){
					 href=host+href;
					 $(this).attr('href',href);
		 		}
		  //  console.log($(this).attr('href'));
  	});

		$(imgs).each(function(i, link){

			 var href = $(this).attr('src');

			 if(!urlParse(href).host){
					 href=host+'/'+href;
					 $(this).attr('src',href);
				}
		  //  console.log($(this).attr('src'));
  	});
		$(imgs).each(function(i, link){

			 var href = $(this).attr('ng-src');

			 if(!urlParse(href).host){
					 href=host+'/'+href;
					 $(this).attr('ng-src',href);
				}
		  //  console.log($(this).attr('src'));
  	});
		var doc = $.html();
		const sizeBefore = doc.toString().length;
		req.prerender.documentHTML = minify(doc.toString(), options);
		const sizeAfter = req.prerender.documentHTML.toString().length;

		res.setHeader(COMPRESSION_HEADER, ((sizeBefore - sizeAfter) / sizeBefore).toFixed(4));
		next();
	}
};
