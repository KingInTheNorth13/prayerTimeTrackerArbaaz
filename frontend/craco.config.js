const path = require('path');

module.exports = {
  style: {
    postcssOptions: {
      plugins: [
        require('tailwindcss'),
        require('autoprefixer'),
      ],
    },
  },
  devServer: (devServerConfig) => {
    // Send API requests on localhost to API server get around CORS.
    devServerConfig.proxy = {
      '/api': {
        target: 'https://localhost:7056',
      },
    };
    devServerConfig.hot = true;
    return devServerConfig;
  },
  webpack: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
};