/**
 * @authors       gebilaoxiong
 * @email         gebilaoxiong@gmail.com
 * @date          2016-08-16 19:49:45
 * @description   资源监控
 */
var chokidar = require('chokidar'),

  release = require('./release');


/**
 * 资源监控
 * @param  {Object}               options               Commander配置
 */
module.exports = function(options) {
  var root = tomoko.project.getProjectPath(),

    timer = -1,

    ignoredReg = /[\/\\](?:dist\b[^\/\\]*([\/\\]|$)|\.|tomoko\.config\.js$)/i,

    safePathReg = /[\\\/][_\-.\s\w]+$/i;


  // watch root
  chokidar
    .watch(root, {
      // 例外
      ignored: ignoreMatcher,
      // 是否开启轮询
      usePolling: tomoko.config.get('project.watch.usePolling'),
      // 守护
      persistent: true
    })
    .on('add', eventHandler)
    .on('change', eventHandler)
    .on('unlink', eventHandler)
    .on('unlinkDir', eventHandler);


  /**
   * 忽略文件匹配
   */
  function ignoreMatcher(filepath) {
    var ignored = ignoredReg.test(filepath),
      rule;

    // 排除非项目文件
    if (rule = tomoko.config.get('project.exclude')) {
      ignored = ignored || tomoko.util.filter(filepath, rule);
    }

    // 排除非监控资源
    if (rule = tomoko.config.get('project.watch.exclude')) {
      ignored = ignored || tomoko.util.filter(filepath, rule);
    }

    return ignored;
  }


  /**
   * eventHandler
   */
  function eventHandler(path) {
    if (!safePathReg.test(path)) {
      return;
    }

    clearTimeout(timer);

    timer = setTimeout(function() {
      release(options);
    }, 500);
  }
}