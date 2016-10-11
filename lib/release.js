/**
 * @authors     xiongyang (xiongyang@gmail.com)
 * @date        2016-08-10 14:42:41
 * @description release
 */

var project = tomoko.project,

  util = tomoko.util,

  deploy = require('./deploy.js');



var total = {};
var lastModified = {};
var collection = {};



/**
 * release
 */
module.exports = function(options) {
  var cmpInfo = project.readJSON('/component.json'),
    // 通过component.json中的entry识别组件的类型
    entryFile = util.pathinfo(cmpInfo.entry);

  // pipe: 构建
  util.pipe('build' + entryFile.ext, function(processor, settings, key) {

    processor(options).then(compileHandler);

  });

  function compileHandler() {
    // 编译
    release(options);
  }
}


/**
 * 执行
 */
function release(options) {
  var start = Date.now();

  // 部署完成后计算花费的时间
  deploy.done = function() {

    var timespan = Date.now() - start;

    process.stdout.write(('\n δ ' + timespan + ' ms \n\n').green.bold);
  }

  try {

    util.extend(options, {
      beforeCompile: beforeCompile,
      afterCompile: afterCompile
    });

    compileSouce(options, callback);

  } catch (e) {
    tomoko.log.error(e);
  }


  /**
   * 文件编译前
   * @param  {File}                   file                        文件
   */
  function beforeCompile(file) {
    total[file.subpath] = file;
  }

  /**
   * 文件编译后
   * @param  {File}                   file                        文件
   */
  function afterCompile(file) {
    var mtime = file.getMtime().getTime();
    if (file.release && lastModified[file.subpath] !== mtime) {
      lastModified[file.subpath] = mtime;
      collection[file.subpath] = file;
    }
  }

  /**
   * 回调
   */
  function callback(files) {
    var changed = false;

    util.each(collection, function(file, subpath) {
      //get newest file from src
      collection[subpath] = files[subpath] || file;
      changed = true;
    });

    if (!changed) {
      return;
    }

    // 部署
    deploy(options, collection, total);

    collection = {};
    total = {};
  }
};


/**
 * 编译
 */
function compileSouce(options, callback) {
  var files = tomoko.project.getSource();

  // 编译yml等资源
  tomoko.util.each(files, function(file, subpath) {

    // beforeEach
    if (options.beforeCompile) {
      options.beforeCompile(file, files);
    }

    // 编译
    file = tomoko.compile(file);

    // afterEach
    if (options.afterCompile) {
      options.afterCompile(file, files);
    }

  });

  if (callback) {
    callback(files);
  }
}