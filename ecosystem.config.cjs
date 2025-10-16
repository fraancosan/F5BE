module.exports = {
  apps: [
    {
      name: 'rodo',
      script: 'app.js',
      instances: 'max',
      exec_mode: 'cluster',
      watch: false,
      env_file: '.env',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
