<?php
// Custom WordPress Configuration

// Database settings
define('DB_NAME', 'writersroom_prod');
define('DB_USER', 'your_database_user');
define('DB_PASSWORD', 'your_database_password');
define('DB_HOST', 'localhost');
define('DB_CHARSET', 'utf8mb4');
define('DB_COLLATE', '');

// Security settings
define('AUTH_KEY',         'your-unique-key-1');
define('SECURE_AUTH_KEY',  'your-unique-key-2');
define('LOGGED_IN_KEY',    'your-unique-key-3');
define('NONCE_KEY',        'your-unique-key-4');
define('AUTH_SALT',        'your-unique-salt-1');
define('SECURE_AUTH_SALT', 'your-unique-salt-2');
define('LOGGED_IN_SALT',   'your-unique-salt-3');
define('NONCE_SALT',       'your-unique-salt-4');

// Performance settings
define('WP_CACHE', true);
define('WP_MEMORY_LIMIT', '256M');
define('WP_MAX_MEMORY_LIMIT', '512M');

// Custom content directory
define('WP_CONTENT_DIR', dirname(__FILE__) . '/wp-content');
define('WP_CONTENT_URL', 'https://thewritersroom.app/wp-content');

// Debug settings
define('WP_DEBUG', false);
define('WP_DEBUG_LOG', false);
define('WP_DEBUG_DISPLAY', false);

// Security hardening
define('DISALLOW_FILE_EDIT', true);
define('FORCE_SSL_ADMIN', true);
define('WP_AUTO_UPDATE_CORE', true);

// Custom table prefix
$table_prefix = 'wr_';

// Limit revisions
define('WP_POST_REVISIONS', 5);

// Automatic updates
define('AUTOMATIC_UPDATER_DISABLED', false);
define('WP_AUTO_UPDATE_CORE', 'minor');

// Multi-site settings (if needed later)
// define('WP_ALLOW_MULTISITE', true);

/* That's all, stop editing! Happy publishing. */