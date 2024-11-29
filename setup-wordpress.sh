#!/bin/bash

# WordPress Setup Script for Writers' Room
echo "Setting up WordPress for Writers' Room..."

# Install required plugins
wp plugin install \
  wordfence \
  wp-2fa \
  litespeed-cache \
  wp-smushit \
  wordpress-seo \
  wp-mail-smtp \
  --activate

# Configure Wordfence
wp option update wordfence_scan_include_extra true
wp option update wordfence_scheduledScan true
wp option update wordfence_loginSec_strongPasswds_enabled true
wp option update wordfence_loginSec_maxFailures 5
wp option update wordfence_loginSec_maxForgotPasswd 3

# Configure LiteSpeed Cache
wp litespeed-option set cache_browser true
wp litespeed-option set cache_mobile true
wp litespeed-option set css_minify true
wp litespeed-option set js_minify true
wp litespeed-option set optm_css_min true
wp litespeed-option set optm_js_min true
wp litespeed-option set media_lazy true

# Configure Yoast SEO
wp yoast index --reindex
wp option update wpseo_xml_sitemap_enabled true
wp option update wpseo_enable_xml_sitemap true

# Configure WP Mail SMTP
wp option update wp_mail_smtp_mail_key "your-mail-key"
wp option update wp_mail_smtp_mail_from "support@thewritersroom.app"
wp option update wp_mail_smtp_mail_from_name "Writers' Room"

# Create custom post types
wp scaffold post-type writers_room_stories \
  --label="Stories" \
  --textdomain="writers-room" \
  --dashicon="book-alt"

wp scaffold post-type writers_room_courses \
  --label="Courses" \
  --textdomain="writers-room" \
  --dashicon="welcome-learn-more"

# Set up taxonomies
wp scaffold taxonomy genre \
  --post_types=writers_room_stories \
  --label="Genres"

wp scaffold taxonomy writing_style \
  --post_types=writers_room_stories \
  --label="Writing Styles"

wp scaffold taxonomy course_category \
  --post_types=writers_room_courses \
  --label="Course Categories"

# Update permalink structure
wp rewrite structure '/%postname%/'

# Configure security settings
wp config set DISALLOW_FILE_EDIT true
wp config set WP_DEBUG false
wp config set FORCE_SSL_ADMIN true

echo "WordPress setup complete!"