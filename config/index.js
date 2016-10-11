/**
 * @authors       gebilaoxiong
 * @email         gebilaoxiong@gmail.com
 * @date          2016-08-10 16:50:25
 * @description   配置文件
 */


module.exports = {

  /**
   * 项目
   * @type {Object}
   */
  project: {

    /**
     * 项目包含的文件
     * @type {Array}
     */
    include: null,

    /**
     * 例外
     * @type {Array}
     */
    exclude: [
      // git data
      /^\/\.git/
    ],


    /**
     * 资源监控
     * @type {Object}
     */
    watch: {

      usePolling: false,

      exclude: []
    }
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

      // component.json
      {
        reg: /^\/component.json$/,
        release: '/[group]/[name]/[version]/component.json'
      },

      // 依赖的组件
      {
        reg: /^\/components\/([^\/]+)\/([^\/]+)\/([^\/]+)\/(dist|api|examples|doc)\/(.+)$/,
        release: '/$1/$2/$3/$4/$5'
      },

      // 依赖组件的component.json
      {
        reg: /^\/components\/([^\/]+)\/([^\/]+)\/([^\/]+)\/component.json$/,
        release: '/$1/$2/$3/component.json'
      }
    ]
  },


  /**
   * 插件配置
   * @type {Object}
   */
  modules: {

    /**
     * 构建
     */
    build: {
      // 将js组件通过tomoko-build-js打包
      js: 'js',
      // 将less组件通过tomoko-build-less打包
      less: 'less'
    },

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
      // js: 'cmdwrap'
    }
  },


  deploy: {}

};