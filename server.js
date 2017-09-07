const prerender 	    = require('prerender');
const forwardHeaders 	= require('./forwardHeaders');
const stripHtml 	    = require('./stripHtml');
const healthcheck 		= require('./healthcheck');
const fs      			= require('fs');
const s3 				= require('./s3.js');
const whitelist 		= require('./whitelist');

let file;
if(fs.existsSync(process.env.CONFIG_FILE))
    file = process.env.CONFIG_FILE;

let config = file ? require(file) : '';

if(config)
	config.AWS                   = config.awsAccessKeys ? config.awsAccessKeys.global : '';

if(config.AWS){
	process.env.AWS_ACCESS_KEY_ID= config.AWS.accessKeyId;
	process.env.AWS_SECRET_ACCESS_KEY= config.AWS.secretAccessKey;
}


const options = {
	workers : process.env.PRERENDER_NUM_WORKERS || 1,
	iterations : process.env.PRERENDER_NUM_ITERATIONS || 25,
	softIterations : process.env.PRERENDER_NUM_SOFT_ITERATIONS || 10,
	jsTimeout : process.env.JS_TIMEOUT || 30000,
	jsCheckTimeout : 10000,
	resourceDownloadTimeout: 20000,
	waitAfterLastRequest: 2000,
	resourceDownloadTimeout: 20000,
	waitAfterLastRequest: 2000,
	logRequests: false,
    port:8000
};

console.log('Starting with options:', options);

const server = prerender(options);

server.use(healthcheck('_health'));
server.use(forwardHeaders);
server.use(prerender.sendPrerenderHeader());
server.use(whitelist);
server.use(prerender.removeScriptTags());
server.use(prerender.httpHeaders());
server.use(stripHtml);
server.use(s3);

server.start();

const shutdown = () => {
	console.log('Shutdown initiated');
	server.exit();
	// At this point prerender has started killing its phantom workers already.
	// We give it 5 seconds to quickly do so, and then halt the process. This
	// will ensure relatively rapid redeploys (prerender no longer accepts new
	// requests at this point
	setTimeout(() => {
		console.log('Prerender has shut down');
		process.exit();
	}, 5000);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
