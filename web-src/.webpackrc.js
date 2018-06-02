const path = require('path');

export default {
  entry: 'src/index.js',
  extraBabelPlugins: [
    ['import', { libraryName: 'antd', libraryDirectory: 'es', style: true }],
  ],
  env: {
    development: {
      extraBabelPlugins: ['dva-hmr'],
    },
  },
  alias: {
    components: path.resolve(__dirname, 'src/components/'),
  },
  ignoreMomentLocale: true,
  theme: './src/theme.js',
  html: {
    template: './src/index.ejs',
  },
  disableDynamicImport: true,
  publicPath: '/',
  hash: true,
  /*
  modifyVars: { 
    // 修改整体主题颜色
    // "@primary-color": "#1DA57A",  
    // 修改图标库为本地离线，而不是阿里云CDN上的图标资源 
    "@icon-url": '"/iconfont/iconfont"' 
  }, */
  /*proxy: {
    "/api": {
    "target": "http://localhost:80/",
    //"target": "http://172.16.0.80:80/",
    "changeOrigin": true,
    //"pathRewrite": { "^/api" : "" }
    }
  }, */
 


};
