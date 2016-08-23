/**
 * @authors       gebilaoxiong
 * @email         gebilaoxiong@gmail.com
 * @date          2016-06-21 11:29:05
 * @description   智子，打包发布
 *                整个release分为两部分 
 *                一部分是资源编译
 *                一部分是部署
 */
var release = exports,

  util = tomoko.util,

  project = tomoko.project,

  config = tomoko.config,

  log = tomoko.log;


// 命名名称
release.name = 'release';

// 用例
release.usage = '[options]';

// 描述
release.description = 'build and deploy your project';

/**
 * 注册命令
 * @param  {Commander}                    commander                   命令配置
 */
release.register = function(commander) {

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

  // 读取组件信息
  config.merge(project.readJSON('/component.json'));

  // 合并配置
  config.merge(importModule('config', config.get('type')));


  cmd = importModule('command', config.get('type'));

  cmd.build.init(options);
  cmd.deploy.init(options);


  // 加载项目配置
  if (project.exists(options.file)) {
    project.require(options.file);
  }

  // 清理缓存
  if (options.clean) {
    tomoko.Cache.clean('compile');
  }

  promise = cmd.build.run(options);

  // 执行部署
  promise.then(function() {
    return cmd.deploy.run(options);
  });
}


/**
 * 加载模块
 * @param  {String}                     moduleName                    模块名称
 * @param  {String}                     cmpType                       组件类型
 */
function importModule(moduleName, cmpType) {
  var path, ret;

  path = ['.', moduleName, cmpType].join('/');

  try {
    ret = require(path);
  } catch (e) {
    log.error(e);
  }

  return ret;
}