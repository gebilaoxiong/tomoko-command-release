/**
 * @authors       gebilaoxiong
 * @email         gebilaoxiong@gmail.com
 * @date          2016-06-21 11:38:06
 * @description   js组件编译配置基类
 */
var pth = require('path'),

  project = tomoko.project,

  seajsLibraryTargetPlugin = require('seajs-webpack-plugin'),

  loaderFallback;


// alias无法传递query
// root又是个残疾人
// 只好用Fallback了
loaderFallback = [
  pth.join(require.resolve('less-loader'), '../../'),
  pth.join(require.resolve('css-loader'), '../../'),
  pth.join(require.resolve('style-loader'), '../../'),
  pth.join(require.resolve('baidu-template-loader'), '../../'),
  pth.join(require.resolve('tomoko-api-loader'), '../../')
];



module.exports = {

  // 报错停止运行
  bail: true,

  // 入口
  entry: {
    'index': project.getProjectPath('/src/index')
  },

  // 输出
  output: {
    path: project.getProjectPath('/dist'),

    filename: '[name].js',

    libraryTarget: 'seajs'
  },

  module: {

    loaders: [{
      // 百度模板引擎解析
      test: /\.tmpl$/,
      loader: 'baidu-template'
    }, {
      // 数据接口api
      test: /\.js$/,
      loader: 'tomoko-api'
    }, {
      // less 解析
      test: /\.less$/,
      loader: 'style!css!less'
    }]

  },

  // 插件
  plugins: [
    new seajsLibraryTargetPlugin()
  ],

  // 非打包资源
  externals: [
    /^(arale|common:components|components)/
  ],

  resolveLoader: {
    fallback: loaderFallback
  }

};