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
		add_action( 'wp_enqueue_scripts', array( $this, 'enqueue_assets' ) );
		add_action( 'rest_api_init', array( $this, 'add_users_api_route' ) );

		// Enable application passwords for api.
		add_filter( 'wp_is_application_passwords_available', '__return_true' );

	}

	public function init_actions() {
		add_shortcode( 'stakeborg_badges', array( $this, 'badges_shortcode' ) );
	}

	public function enqueue_assets() {
		wp_register_style( 'stakeborg-badges', SBORG_BADGES_ASSETS_URL . 'build/main.css', array(), SBORG_BADGES_VERSION, 'all' );
		wp_register_script( 'stakeborg-badges', SBORG_BADGES_ASSETS_URL . 'build/main.js', array(), SBORG_BADGES_VERSION, true );
	}

	public function add_users_api_route() {
		register_rest_route(
			'badges/v1',
			'/users',
			array(
				'methods'             => 'GET',
				'callback'            => array( $this, 'get_users_data' ),
				'permission_callback' => function () {
					return current_user_can( 'edit_others_posts' ); // editor.
				},
			)
		);
	}

	public function get_users_data() {

		if ( ! function_exists( 'xprofile_get_field_data' ) ) {
			return array();
		}

		$data  = array();
		$users = get_users();
		if ( ! empty( $users ) ) {
			foreach ( $users as $user ) {

				$erc20 = xprofile_get_field_data( 'ERC20 Address', $user->ID );

				if ( ! $erc20 ) {
					continue;
				}

				$data[ $user->ID ] = array(
					'username' => $user->user_login,
					'name'     => $user->display_name,
					'email'    => $user->user_email,
					'erc20'    => $erc20,
				);
			}
		}

		return $data;
	}

	/**
	 * Create badges shortcode
	 *
	 * @param array  $atts shortcode attributes.
	 * @param string $content shortcode content.
	 * @return string
	 */
	public function badges_shortcode( $atts, $content = '' ) {

		add_action(
			'wp_footer',
			function() {
				wp_enqueue_script( 'stakeborg-badges' );
				wp_print_styles( array( 'stakeborg-badges' ) );
			}
		);

		$data = '<div id="stakeborg-badges"></div>';

		return $data;
	}
}
