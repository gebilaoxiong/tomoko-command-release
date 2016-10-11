/**
 * @authors       gebilaoxiong
 * @email         gebilaoxiong@gmail.com
 * @date          2016-08-15 17:13:16
 * @description   部署 (这里的代码 有些是直接拿过来的)
 */
var util = tomoko.util,

  async = require('async'),

  DEFAULT_DEPLOY_KEY = 'deploy.default',

  processors = {};



exports = module.exports = function(options, collection, total) {
  var root = tomoko.project.getProjectPath();


  settings = tomoko.config.get('deploy') || {};


  //downward compatibility
  tomoko.util.each(settings, function(deployItem, name) {
    bindConfInfo(deployItem, DEFAULT_DEPLOY_KEY, name, false);
  });

  //add default deploy module
  if (!tomoko.config.get('modules.deploy')) {
    tomoko.config.set('modules.deploy', 'default');
  }


  //merge deploy config with settings.deploy
  tomoko.util.pipe('deploy', function(processor, pluginSettings, key) {
    processors[key] = processor;

    tomoko.util.each(pluginSettings, function(config, name) {
      bindConfInfo(config, key, name, !!processor.fullpack);
    });

    tomoko.util.extend(settings, pluginSettings);
  });


  var packDeployConfs = {};
  var deployConfs = {};

  options.dest.split(/,/g).forEach(function(destName) {
    var dest, target;

    if (!destName) {
      return false;
    }

    dest = settings[destName] || {};

    if (!dest.type) {
      dest.type = DEFAULT_DEPLOY_KEY;
    }

    if (dest.fullpack) {
      target = packDeployConfs[destName] = packDeployConfs[destName] || [];
    } else {
      target = deployConfs[destName] = deployConfs[destName] || [];
    }

    if (util.isArray(dest)) {
      dest.forEach(function(deployItem) {
        target.push(factory(deployItem, options, root));
      });
    }
    // object
    else {
      //only used when deploy type is default or none
      if (!dest.to && dest.type == DEFAULT_DEPLOY_KEY) {
        if (
          //release to preivew
          destName !== 'preview' &&
          //release to output
          !/^(?:\.|output\b)/.test(destName)
        ) {
          tomoko.log.error('invalid deploy destination options [' + destName + ']');
        }

        dest.to = destName;
        dest.type = DEFAULT_DEPLOY_KEY;
      }

      target.push(factory(dest, options, root));
    }
  });


  // 创建部署任务
  var tasks = createDeployTasks(deployConfs, collection, true);


  doTask(tasks, exports.done);
}



// 部署文件的最大值
exports.MAX_TASK_SIZE = 5;

exports.done = function(){}


/**
 * 构建配置信息
 * @param  {Object|Array}               conf                  部署配置
 * @param  {String}                     type                  处理插件类型
 * @param  {String}                     name                  配置名称
 * @param  {[type]}                     fullpack              [description]
 */
function bindConfInfo(conf, type, name, fullpack) {
  if (util.isArray(conf)) {
    conf.forEach(function(item) {
      item.type = type;
      item.name = name;
      item.fullpack = fullpack;
    });
  }
  conf.type = type;
  conf.name = name;
  conf.fullpack = fullpack;
}



function factory(deployConfigItem, options, root) {
  var ret;

  ret = tomoko.util.extend({}, deployConfigItem);
  ret.options = options;
  ret.root = ret.root || root;
  ret.from = normilize(ret.from);

  return ret;
}

function normilize(str) {
  str = str || '';
  str = str.trim();

  if (str[0] !== '/') {
    str = '/' + str;
  }

  return str.replace(/\/$/, '') + '/';
}


function createDeployTasks(depolyConfs, files, flatten) {
  var tasks = flatten ? [] : {};

  util.each(files, function(file, subpath) {
    util.each(depolyConfs, function(config, name) {

      var target = tasks;

      if (!flatten) {
        tasks[name] = tasks[name] || []
      }


      config.forEach(function(item) {

        if (
          file.release &&
          file.release.indexOf(item.from) === 0 && //relate to replaceFrom
          util.filter(file.release, item.include, item.exclude)
        ) {
          target.push({
            dest: item,
            file: file
          });
        }

      });

    });
  });

  return tasks;
}


function doTask(tasks, done) {
  var asyncTasks = [];

  tasks.forEach(function(task) {
    asyncTasks.push(function(callback) {
      prepareDeploy(task.dest, task.file, function(processor, dest, release, file, content, settings){
        processor({to: dest.to, release: release}, file, content, dest, function() {
            setTimeout(function() {
                if(callback){
                  callback();
                }
            }, 0);
        });
      })
    })
  });

  async.parallelLimit(asyncTasks, exports.MAX_TASK_SIZE, done);
}


function prepareDeploy(dest, file, callback) {
  if (!file.release) {
    log.error('unreleasable file [' + file.realpath + ']');
  }

  var release = replaceFrom(file.release, dest.from, dest.subOnly);
  var content = file.getContent();

  if (callback) {
    callback(processors[dest.type], dest, release, file, content, settings[dest._name]);
  }
}


function replaceFrom(path, from, subOnly) {
  if (path.indexOf(from) === 0) {
    from = from.replace(/\/$/, '');

    if (subOnly) {
      return path.substring(from.length);
    } else {
      var index = from.lastIndexOf('/');
      if (index < 1) {
        return path;
      } else {
        return path.substring(index);
      }
    }
  }

  return path;
}