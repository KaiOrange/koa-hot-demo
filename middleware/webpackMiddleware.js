const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');
const PassThrough = require('stream').PassThrough;
const webpack = require('webpack');

/**
 * 添加hot必要的entry
 */
function addEntry(webpackDevConfig){
    let publicPath = webpackDevConfig.output.publicPath || "/";
    let abPublicPath = 'http://localhost:' + (process.env.PORT || 3000 ) + publicPath;
    let hotMiddlewareScript = 'webpack-hot-middleware/client?' + abPublicPath;
    let hotDevServer = 'webpack/hot/dev-server';
    if (typeof webpackDevConfig.entry === 'string') {
        webpackDevConfig.entry = [hotMiddlewareScript, hotDevServer, webpackDevConfig.entry];
    } else if (typeof webpackDevConfig.entry === 'object') {
        for (var k in webpackDevConfig.entry) {
            var main = webpackDevConfig.entry[k];
            webpackDevConfig.entry[k] = [hotMiddlewareScript, hotDevServer].concat(main)
        }
    }
}

/**
 * 转换为dev的middleware
 * @param {*} compiler 
 * @param {*} opts 
 */
const devMiddleware = (compiler, opts) => {
    const middleware = webpackDevMiddleware(compiler, opts)
    return async (ctx, next) => {
        await middleware(ctx.req, {
            end: (content) => {
                ctx.body = content
            },
            setHeader: (name, value) => {
                ctx.set(name, value)
            }
        }, next)
    }
}

/**
 * 转换为hot的middleware
 * @param {*} compiler 
 * @param {*} opts 
 */
const hotMiddleware = (compiler, opts) => {
    const middleware = webpackHotMiddleware(compiler, opts);
    return async (ctx, next) => {
        let stream = new PassThrough()
        ctx.body = stream
        await middleware(ctx.req, {
            write: stream.write.bind(stream),
            writeHead: (status, headers) => {
                ctx.status = status
                ctx.set(headers)
            }
        }, next)
    }
}


module.exports = function (app,webpackDevConfig,devOpt,hotOpt){
    addEntry(webpackDevConfig);
    var compiler = webpack(webpackDevConfig);
    var devOpt = Object.assign({},devOpt.publicPath,{
        publicPath : (webpackDevConfig.output.publicPath || "/")
    });
    
    app.use(devMiddleware(compiler, devOpt));
    app.use(hotMiddleware(compiler,hotOpt));
}
