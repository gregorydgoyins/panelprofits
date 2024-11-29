import { execSync } from 'child_process';
import { WORDPRESS_CONFIG } from '../src/config/wordpressConfig';
import { WORDPRESS_PLUGINS } from '../src/config/wordpressPlugins';

async function setupWordPress() {
  try {
    console.log('Setting up WordPress...');

    // Install and configure plugins
    for (const [category, plugins] of Object.entries(WORDPRESS_PLUGINS)) {
      console.log(`\nInstalling ${category} plugins...`);
      
      for (const [plugin, config] of Object.entries(plugins)) {
        console.log(`Installing ${plugin}...`);
        execSync(`wp plugin install ${plugin} --activate`);

        // Configure plugin if needed
        if (config.settings) {
          for (const [option, value] of Object.entries(config.settings)) {
            execSync(`wp option update ${plugin}_${option} ${value}`);
          }
        }
      }
    }

    // Create custom post types
    console.log('\nCreating custom post types...');
    for (const postType of WORDPRESS_CONFIG.customPostTypes) {
      execSync(`wp scaffold post-type ${postType.name} --label="${postType.label}" --textdomain="writers-room"`);
    }

    // Configure security settings
    console.log('\nConfiguring security settings...');
    execSync('wp config set DISALLOW_FILE_EDIT true --raw');
    execSync('wp config set FORCE_SSL_ADMIN true --raw');
    execSync('wp config set WP_DEBUG false --raw');

    // Update permalink structure
    console.log('\nUpdating permalink structure...');
    execSync('wp rewrite structure "/%postname%/"');

    console.log('\nWordPress setup completed successfully!');
  } catch (error) {
    console.error('Error setting up WordPress:', error);
    process.exit(1);
  }
}

setupWordPress();