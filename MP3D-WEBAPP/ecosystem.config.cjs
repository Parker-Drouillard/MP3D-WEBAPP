module.exports = {
  apps: [
    {
      name: 'mp3d-web',
      script: 'build/index.js',
      instances: 1,
      autorestart: true,
      watch: false,
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000
      }
    },
    {
      name: 'mp3d-worker',
      script: 'worker.js',
      instances: 1,
      autorestart: true,
      watch: false,
      env_production: {
        NODE_ENV: 'production'
      }
    }
  ]
};