<?php
/**
 * Plugin Name: StakeborgDao.xyz NFT Badges
 * Version: 1.0.0
 */

define( 'SBORG_BADGES_VERSION', '1.0.0' );
define( 'SBORG_BADGES_ASSETS_URL', trailingslashit( plugin_dir_url( __FILE__ ) ) );
define( 'SBORG_BADGES_URL', trailingslashit( plugin_dir_url( __FILE__ ) ) . 'wp/' );
define( 'SBORG_BADGES_PATH', trailingslashit( plugin_dir_path( __FILE__ ) ) . 'wp/' );

require_once 'wp/bootstrap.php';
\Stakeborgdao\Badges\Plugin::instance();
