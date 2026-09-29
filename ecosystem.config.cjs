module.exports = {
  apps: [
    {
      name: 'pp-backend',
      script: './scripts/daemons/pp-backend.cjs',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PP_BACKEND_PORT: 4001,
      },
    },
    {
      name: 'pp-frontend',
      script: './scripts/daemons/pp-frontend.cjs',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
    },
    {
      name: 'pp-wyrm',
      script: './scripts/daemons/pp-wyrm.cjs',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
      },
    },
    {
      name: 'pp-narrative',
      script: './scripts/daemons/pp-narrative.cjs',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
      },
    },
    {
      name: 'pp-arcm',
      script: './scripts/daemons/pp-arcm.cjs',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
      },
    },
    {
      name: 'pp-storymatrix',
      script: './scripts/daemons/pp-storymatrix.cjs',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '800M',
      env: {
        NODE_ENV: 'production',
      },
    },
    {
      name: 'pp-validator',
      script: './scripts/daemons/pp-validator.cjs',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
