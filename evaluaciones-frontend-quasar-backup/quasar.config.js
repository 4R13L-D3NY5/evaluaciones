const { configure } = require('quasar/wrappers');

module.exports = configure(function (/* ctx */) {
  return {
    boot: [
      'pinia'
    ],
    css: [
      'app.css'
    ],
    extras: [
      'roboto-font',
      'material-icons',
      'fontawesome-v6'
    ],
    build: {
      target: {
        browser: [ 'es2019', 'edge88', 'firefox78', 'chrome87', 'safari13.1' ],
        node: 'node16'
      },
      vueRouterMode: 'hash'
    },
    devServer: {
      port: 8095,
      open: false
    },
    framework: {
      config: {
        brand: {
          primary: '#1e3a8a',
          secondary: '#0d9488',
          accent: '#7c3aed',
          dark: '#0f172a',
          positive: '#10b981',
          negative: '#ef4444',
          info: '#3b82f6',
          warning: '#f59e0b'
        }
      },
      plugins: [
        'Notify',
        'Dialog',
        'Loading'
      ]
    }
  }
});
