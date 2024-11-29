import { execSync } from 'child_process';
import { PERFORMANCE_CONFIG } from '../src/config/performance';

async function optimizeSystem() {
  try {
    console.log('Starting system optimization...');

    // Optimize WordPress
    console.log('\nOptimizing WordPress...');
    execSync('wp cache flush');
    execSync('wp rewrite flush');
    execSync('wp transient delete --all');
    execSync('wp db optimize');

    // Optimize images
    console.log('\nOptimizing images...');
    execSync('wp media regenerate --yes');

    // Configure caching
    console.log('\nConfiguring caching...');
    execSync('wp litespeed-option set cache_browser true');
    execSync('wp litespeed-option set cache_mobile true');
    execSync('wp litespeed-option set css_minify true');
    execSync('wp litespeed-option set js_minify true');

    // Update performance settings
    console.log('\nUpdating performance settings...');
    execSync('wp config set WP_CACHE true --raw');
    execSync(`wp config set WP_MEMORY_LIMIT ${PERFORMANCE_CONFIG.resourceLimits.maxMemory} --raw`);

    console.log('\nSystem optimization completed successfully!');
  } catch (error) {
    console.error('Error optimizing system:', error);
    process.exit(1);
  }
}

optimizeSystem();