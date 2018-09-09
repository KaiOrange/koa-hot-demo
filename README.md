# koa-hot-demo
#### 使用koa2实现react热部署的demo（脚手架）。

### 使用到的技术：
* koa 2*
* react 16*
* babel 7*
* webpack 4*
* webpack-dev-middleware
* webpack-hot-middleware
* ...

### 如何实现热部署
1. 生成koa目录
   ```sh
   npm install -g koa2-generator
   koa2 koa-hot-demo
   ```
2. 使用webpack热部署中间件
   
   这个过程中本来想找一些koa相关的webpack热部署中间件，后来发现这些中间件并不怎么好使，于是就使用比较成熟的*webpack-dev-middleware*和*webpack-hot-middleware*这两个中间件，但是他们是属于*Express*的中间件，所以需要做一下适配：

   `/middleware/webpackMiddleware.js`
   ```JavaScript
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
   ```

   `app.js`
   ```JavaScript
   //...其他代码

   if (process.env.NODE_ENV === "development") {
        //开发环境
        let webpackDevConfig = require('./webpack.config.dev.js');
        let webpackMiddleware = require('./middleware/webpackMiddleware.js');
        webpackMiddleware(app,webpackDevConfig,{
            serverSideRender: true,
            noInfo: true,
            hot: true,
            stats: {
                colors: true
            }
        });
    } else {
        //生产环境
        app.use(require('koa-static')(__dirname + '/public'))
    }

    //...其他代码
   ```

3. webpack.config.dev.js中引入插件
   
    ```JavaScript
        plugins: [
            webpack.optimize.OccurrenceOrderPlugin(),
            new webpack.HotModuleReplacementPlugin()
    　　]
    ```

4. 代码支持热替换
   
   `src/index.js`
   ```JavaScript
    //...其他代码

    //开启热替换
    if (module.hot) {
        module.hot.accept();
    }
   ```

5. 遇到一个坑
   
    上述代码整完以后已经可以热替换了，但是这里有一个问题如果使用了*nodemon*来加载*node*代码，那么每次*node*代码修改以后都会重新加载，那么*webpack热替换模块*会失去连接。

    这里需要做2个处理：

    * 让*nodemon*忽略前端相关的代码变动
  
        `nodemon.json`

        ```JSON
        {
            "verbose": true,
            "restartable": "rs",
            "ignore": [
                "*.test.js", 
                "/src/",
                "/public/",
                ".git",
                ".svn",
                "node_modules/**/node_modules"]
        }
        ```

    * 如过node代码改动后，则重新刷新页面
  
        我们最常用的*reload*模块是提供给*Express*使用的，并不适合*koa*，我试了好几种模块，最后发现比较好使的是[koa-reload](https://github.com/ZhangYunP/koa-reload "查看koa-reload").

        `/bin/www`
        ```JavaScript
        //...其他代码
        var reload = require('koa-reload');

        var reloadObj = reload(server);
        app.use(reloadObj.Reloadrouter.routes(), reloadObj.Reloadrouter.allowedMethods());
        //...其他代码
        ```

        `src/index.html`
        ```HTML
        <script src="/reload/reload.js"></script>
        ```

通过上面5个步骤已经大功告成了，感兴趣的可以克隆（或者下载）这个代码，以便自己运行一下。

最后的效果图:

![预览](./preview.gif '最终效果')
