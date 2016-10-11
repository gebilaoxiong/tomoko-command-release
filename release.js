/**
 * @authors       gebilaoxiong
 * @email         gebilaoxiong@gmail.com
 * @date          2016-06-21 11:29:05
 * @description   智子，打包发布
 *                整个release分为两部分 
 *                一部分是构建(通过管道处理)
 *                一部分是部署
 */
var util = tomoko.util,

  project = tomoko.project,

  config = tomoko.config,

  log = tomoko.log,

  release = require('./lib/release'),

  watch = require('./lib/watch');


// 命名名称
exports.name = 'release';

// 用例
exports.usage = '[options]';

// 描述
exports.description = 'build and deploy your component';

/**
 * 注册命令
 * @param  {Commander}                    commander                   命令配置
 */
exports.register = function(commander) {

  commander
    // 清理编译缓存
    .option('-c, --clean', 'clean compile cache')
    // 压缩
    .option('-o, --optimize', 'with optimizing')
    // 资源监控
    .option('-w, --watch', 'monitor the changes of project')
    // 配置文件
    .option('-f, --file <filename>', 'set tomoko.config file', String, '/tomoko.config.js')
    // 部署路径
    .option('-d, --dest <names>', 'release output destination', String, 'preview')
    // 项目路径
    .option('-r, --root <names>', 'set project root', String, process.cwd())
    // 打印日志明细
    .option('--verbose', 'enable verbose output')
    // 解析回调
    .action(commanderAction);

};


/**
 * commander回调
 */
function commanderAction() {
  var options = arguments[arguments.length - 1],
    promise, cmd;

  // 输出日志
  if (options.verbose) {
    log.level = log.L_ALL;
  }

  // 初始化项目路径
  project.setProjectRoot(options.root);


  // 合并配置
  config.merge(require('./config'));

  // 加载项目配置文件
  // tomoko.config.js
  if (project.exists(options.file)) {
    project.require(options.file);
  }

  // 清理缓存
  if (options.clean) {
    tomoko.Cache.clean('compile');
  }

  if (options.watch) {
    watch(options);
  } else {
    release(options);
  }
}

