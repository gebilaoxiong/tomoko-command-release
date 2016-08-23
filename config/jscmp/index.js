/**
 * @authors       gebilaoxiong
 * @email         gebilaoxiong@gmail.com
 * @date          2016-08-10 16:50:25
 * @description   部署配置
 */


module.exports = {

  /**
   * 编译打包配置
   * @type {Object}
   */
  build: require('./build'),

  /**
   * 项目
   * @type {Object}
   */
  project: {
    
    /**
     * 项目包含的文件
     * @type {Array}
     */
    include: [],

    /**
     * 例外
     * @type {Array}
     */
    exclude: [
      // git data
      /\/.git/
    ],
  },


  /**
   * 路径处理
   * @type {Object}
   */
  roadmap: {

    /**
     * 文件后缀映射
     * @type {Object}
     */
    ext: {
      // less -> css
      less: 'css',
      // yml -> json
      yml: 'json'
    },

    /**
     * 路径映射
     * @type {Array}
     */
    path: [

      // dist目录 & 接口定义目录 & 示例目录 & 文档目录
      {
        reg: /^\/(dist|api|examples|doc)\/(.+)$/,
        release: '/[group]/[name]/[version]/$1/$2'
      },

      // 依赖的组件
      {
        reg: /^\/components\/([^\/]+)\/([^\/]+)\/([^\/]+)\/(dist|api|examples|doc)\/(.+)$/,
        release: '/$1/$2/$3/$4/$5'
      }
    ]
  },


  /**
   * 插件配置
   * @type {Object}
   */
  modules: {

    /**
     * 解析
     * @type {Object}
     */
    parser: {
      // 将yml文件编译成json
      yml: 'yml',

      // less解析
      less: 'less'
    },

    /**
     * 处理后
     * @type {Object}
     */
    postprocessor: {
      // 将js文件中的commonjs格式 转换为seajs
      js: 'cmdwrap'
    }
  },


  deploy: {}

};