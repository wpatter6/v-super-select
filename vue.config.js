const typings = process.env.TYPE_DEFINITIONS === 'true'

module.exports = {
  pages: {
    demo: {
      // entry for the page
      entry: 'demo/main.ts',
      // the source template
      template: 'public/index.html',
      // output as dist/index.html
      filename: 'index.html',
    },
  },
  css: {
    extract: false,
  },
  configureWebpack: {
    output: {
      libraryExport: 'default',
    },
  },
  parallel: !typings,
  chainWebpack: config => {
    typings &&
      config.module
        .rule('ts')
        .use('ts-loader')
        .loader('ts-loader')
        .tap(opts => {
          opts.transpileOnly = false
          opts.happyPackMode = false
          return opts
        })
  },
}
