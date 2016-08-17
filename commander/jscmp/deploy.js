/**
 * @authors     xiongyang (xiongyang@gmail.com)
 * @date        2016-08-10 14:42:41
 * @description 部署
 */
var project = tomoko.project,

  util = tomoko.util,

  deploy = require('../../lib/deploy.js');



/**
 * 初始化
 * @param  {Object}                   options                 编译选项
 */
exports.init = function(options) {
  var me = this;

  return me;
};


var total = {};
var lastModified = {};
var collection = {};


/**
 * 执行
 */
exports.run = function(options) {
  var start = Date.now();

  try {

    util.extend(options, {
      beforeCompile: beforeCompile,
      afterCompile: afterCompile
    });

    tomoko.release(options, callback);

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