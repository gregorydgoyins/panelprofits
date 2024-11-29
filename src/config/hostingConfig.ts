export const HOSTING_CONFIG = {
  domain: 'thewritersroom.app',
  provider: 'hostinger',
  wordpress: {
    version: '6.7.1',
    adminPath: '/wp-admin',
    database: {
      name: 'writersroom_prod',
      prefix: 'wr_'
    },
    security: {
      adminUser: 'admin',
      tablePrefix: 'wr_',
      disableFileEdit: true,
      limitLoginAttempts: true
    }
  }
};