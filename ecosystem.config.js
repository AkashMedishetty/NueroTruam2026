// PM2 ecosystem configuration for production deployment
module.exports = {
  apps: [
    {
      name: 'neurotrauma-2026',
      script: './server.js',
      cwd: './',
      instances: 'max', // Use all available CPU cores
      exec_mode: 'cluster',
      
      // Environment variables
      env: {
        NODE_ENV: 'development',
        PORT: 3000
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000
      },

      // Logging
      log_file: './logs/combined.log',
      out_file: './logs/out.log',
      error_file: './logs/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      
      // Process management
      max_memory_restart: '1G',
      min_uptime: '10s',
      max_restarts: 10,
      
      // Graceful shutdown
      kill_timeout: 3000,
      listen_timeout: 8000,
      
      // Health monitoring
      health_check_url: 'http://localhost:3000/api/health',
      health_check_grace_period: 3000,
      
      // Auto restart on file changes (disable in production)
      watch: false,
      ignore_watch: [
        'node_modules',
        'logs',
        '.git',
        '.next'
      ],

      // Cron jobs for maintenance
      cron_restart: '0 4 * * *', // Restart daily at 4 AM
      
      // Source map support
      source_map_support: true,
      
      // Additional PM2 features
      merge_logs: true,
      time: true
    }
  ],

  // Deployment configuration
  deploy: {
    production: {
      user: 'ubuntu',
      host: ['your-server-ip'], // Replace with your server IP
      ref: 'origin/main',
      repo: 'https://github.com/your-username/neurotrauma-2026.git', // Replace with your repo
      path: '/var/www/neurotrauma-2026',
      'pre-deploy-local': '',
      'post-deploy':
        'npm install && npm run build && pm2 reload ecosystem.config.js --env production',
      'pre-setup': '',
      env: {
        NODE_ENV: 'production'
      }
    },
    
    staging: {
      user: 'ubuntu',
      host: ['staging-server-ip'], // Replace with staging server IP
      ref: 'origin/develop',
      repo: 'https://github.com/your-username/neurotrauma-2026.git',
      path: '/var/www/neurotrauma-2026-staging',
      'post-deploy':
        'npm install && npm run build && pm2 reload ecosystem.config.js --env staging',
      env: {
        NODE_ENV: 'staging'
      }
    }
  }
}