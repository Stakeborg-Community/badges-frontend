<?php

namespace Stakeborgdao\Badges;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Class Plugin
 *
 * @package Stakeborgdao\Badges
 */
class Plugin extends Singleton {

	/**
	 * Plugin constructor
	 *
	 * @param array $data
	 */
	public function __construct( array $data = array() ) {

		parent::__construct();

		add_action( 'init', array( $this, 'init_actions' ) );
	}

	public function init_actions() {
	
		add_shortcode( 'stakeborg_badges', array( $this, 'badges_shortcode' ) );
	}

	/**
	 * Create badges shortcode
	 *
	 * @param array $atts shortcode attributes.
	 * @param string $content shortcode content.
	 * @return string
	 */
	public function badges_shortcode( $atts, $content = '' ) {
		return '--badges will go here--';
	}
}
