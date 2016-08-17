/**
 * @authors       gebilaoxiong
 * @email         gebilaoxiong@gmail.com
 * @description   静态资源编译
 */
var util = tomoko.util,

  log = tomoko.log,

  colors = tomoko.colors,

  webpack = require('webpack'),

  ProgressPlugin = webpack.ProgressPlugin;


/**
 * 初始化
 * @param  {Object}               options               编译选项
 */
exports.init = function(options) {
  var me = this;

  // 最小化
  if (options.optimize) {
    setupOptimize();
  }

  // source map
  if (!options.devtool) {
    options.devtool = 'source-map';
  }

  tomoko.config.set('build.devtool', 'source-map');

  // 环境变量
  addEnvPlugin();

  // 进度显示
  addProcessPlugin();

  return me;
};


/**
 * 执行
 */
exports.run = function(options) {
  var promise;

  promise = new Promise(runHandler);

  promise.then(printState, tomoko.log.error);

  return promise;
};



/**
 * 添加环境变量插件
 */
function addEnvPlugin() {
  var plugin;

  // 环境变量
  plugin = new webpack.DefinePlugin({
    'process.env': {
      NODE_ENV: '"dev"'
    }
  });

  tomoko.config
    .get('build.plugins')
    .push(plugin);
}



/**
 * run handler
 */
function runHandler(resolve, reject) {
  var options = tomoko.config.get('build'),
    ompiler;

  // 执行
  compiler = webpack(options);

  // 执行
  compiler.run(callback);


  /**
   * webpack回调
   * @param  {Error}                          error                           异常信息
   * @param  {Object}                         status                          状态信息
   */
  function callback(error, status) {
    if (error) {
      reject(error);
      return;
    }

    resolve(status);
  }
};


/**
 * 添加显示过程插件
 */
function addProcessPlugin() {
  var plugin,
    pre;

  // 进度显示插件
  plugin = new ProgressPlugin(function(percentage, msg) {
    var stderr = process.stderr,
      msg, perc;

    if (percentage == 0) {
      stderr.write('\n Ω compile '.green.bold);
      stderr.write('[ '.bold);
      pre = 0;
      return;
    }

    perc = Math.floor(percentage * 35);


    msg = [
      Array(perc).join('■'),
      Array(35 - perc).join('※'),
      ' ] ',
      Math.floor(percentage * 100),
      '%'
    ]


    stderr.write(Array(pre + 1).join("\b \b"));

    pre = msg.join('').length;

    msg.splice(1, 1, msg[1].gray);
    msg.splice(2, 1, msg[2].bold);
    stderr.write(msg.join(''));

    if (percentage === 1) {
      stderr.write('\n\n');
    }
  });



  tomoko.config
    .get('build.plugins')
    .push(plugin);
}


/**
 * 打印编译的状态
 * @param  {Object}                       status                         状态信息  
 */
function printState(status) {
  status = status.toJson({
    assets: true,
    modules: true
  }, true);


  // 打印编译的module
  util.each(status.modules, function(module) {
    var msg = module.name + ' ',
      tags = [];

    util.each({
      "cacheable": "[not cacheable]".blue.bold,
      "optional": "[optional]".yellow.bold,
      "built": "[built]".green.bold,
      "prefetched": "[prefetched]".magenta.bold,
      "failed": "[failed]".red.bold,
      "warnings": "[warning]".yellow.bold,
      "errors": "[error]".red.bold
    }, function(tag, prop) {
      if (!module[prop]) {
        return;
      }

      tags.push(tag);
    });

    log.debug( msg + tags.join(' '));
  });


  // 打印assets
  util.each(status.assets, function printAssetInfo(asset) {
    var size = '[' + util.formatSize(asset.size) + ']',
      emitted = asset.emitted ? "[emitted]" : "";

    log.debug([
      asset.name,
      size.yellow.bold,
      emitted.blue.bold
    ].join(' '));
  });
}



/**
 * 设置压缩
 */
function setupOptimize() {
  var plugin;

  // js压缩
  plugin = new webpack.optimize.UglifyJsPlugin({
    compress: {
      warnings: true, // 显示警告信息
    },
    output: {
      comments: false, // 过滤掉注释
    },
  });

  tomoko.config.get('build.plugins').push(plugin);
}