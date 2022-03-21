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

	private $badges = array(
		0 => 'Bootstrapper',
		1 => 'Veteran',
		2 => 'Early Adopter',
		3 => 'Sustainer',
		4 => 'Believer',
	);

	private $external_connection = null;

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
		add_filter( 'wp_is_application_passwords_available', '__return_true', 9999 );

		add_filter( 'bp_get_member_avatar', array( $this, 'nft_on_bp_members_list' ) );
		add_action( 'bp_before_member_header_meta', array( $this, 'nft_on_bp_member_page' ) );
	}

	public function init_actions() {
		add_shortcode( 'stakeborg_badges', array( $this, 'badges_shortcode' ) );
	}

	public function enqueue_assets() {
		wp_register_style( 'stakeborg-badges', SBORG_BADGES_ASSETS_URL . 'build/main.css', array(), SBORG_BADGES_VERSION, 'all' );
		wp_register_script( 'stakeborg-badges', SBORG_BADGES_ASSETS_URL . 'build/main.js', array(), SBORG_BADGES_VERSION, true );
		wp_localize_script(
			'stakeborg-badges',
			'wpApiSettings',
			array(
				'apiRoot' => esc_url_raw( rest_url() ),
				'nonce'   => wp_create_nonce( 'wp_rest' ),
			)
		);
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

	private function get_nft_type_for_user( $user_id ) {

		$address = xprofile_get_field_data( 'ERC20 Address', $user_id );

		if ( ! $address ) {
			return false;
		}

		$externaldb = $this->external_db();

		$data = $externaldb->get_row(
			$externaldb->prepare(
				'SELECT nft_type FROM transfer WHERE address=%s',
				$address
			)
		);

		if ( is_object( $data ) ) {
			return $data->nft_type;
		}

		return false;
	}

	public function nft_on_bp_member_page() {
		$user_id  = bp_displayed_user_id();
		$badge_id = $this->get_nft_type_for_user( $user_id );

		if ( ! $badge_id ) {
			return;
		}

		echo $this->get_badge_html( $badge_id );
	}

	public function nft_on_bp_members_list( $avatar ) {

		global $members_template;

		if ( empty( $members_template->member->id ) ) {
			return $avatar;
		}

		$user_id  = $members_template->member->id;
		$badge_id = $this->get_nft_type_for_user( $user_id );
		if ( ! $badge_id ) {
			return $avatar;
		}

		$details = $this->get_badge_html( $badge_id );

		if ( empty( trim( $details ) ) ) {
			return $avatar;
		}

		return $avatar . '</a>' . $details . '<a>';

	}

	public function get_badge_html( $badge_id ) {
		ob_start();
		?>
		<div class="gamipress-buddypress-user-details gamipress-buddypress-user-details-listing">
			<div class="gamipress-buddypress-achievements">
				<div class="gamipress-buddypress-user-achievements">
					<span class="gamipress-buddypress-achievement gamipress-buddypress-badges">
						<span title="<?php echo esc_attr( $this->badges[ $badge_id ] ); ?>" 
							class="activity gamipress-buddypress-achievement-thumbnail gamipress-buddypress-badges-thumbnail"
							style="box-shadow: none;"	
						>
							<img width="25" height="25" src="<?php echo esc_url( SBORG_BADGES_URL . 'assets/img/' . $badge_id . '.png' ); ?>" class="gamipress-achievement-thumbnail wp-post-image" 
								alt="<?php echo esc_attr( $this->badges[ $badge_id ] ); ?>">
						</span>

						<span class="activity gamipress-buddypress-achievement-title gamipress-buddypress-badges-title">
							<?php echo esc_attr( $this->badges[ $badge_id ] ); ?>
						</span>
					</span>	
				</div>
			</div>
		</div>
		<?php
		return ob_get_clean();
	}

	public function get_users_data() {

		if ( ! function_exists( 'xprofile_get_field_data' ) ) {
			return array( array( 'error' => 'Something went terribly wrong.' ) );
		}

		$format = 'array';
		if ( isset( $_GET['format'] ) && $_GET['format'] === 'csv' ) {
			$format = 'csv';
		}

		 $type_options = array(
			 '0',
			 '100',
			 '250',
			 '500',
			 '1000',
			 'with-erc20',
		 );

		 if ( isset( $_GET['type'] ) && in_array( $_GET['type'], $type_options ) ) {
			 $type = sanitize_text_field( $_GET['type'] );
		 }

		 if ( ! isset( $type ) ) {
			 return array( array( 'error' => 'Missing type param. C\'mon man!' ) );
		 }

		 $data       = array();
		 $query_args = array(
			 'orderby' => 'user_registered',
			 'order'   => 'ASC',
		 );

		 if ( $type === 'with-erc20' ) {
			 $query_args['number'] = -1;
		 } else {
			 $prev                 = $type_options[ array_search( $type, $type_options ) - 1 ];
			 $query_args['number'] = $type - $prev;
			 $query_args['offset'] = $prev;
		 }

		 $users = get_users( $query_args );

		 if ( ! empty( $users ) ) {
			 foreach ( $users as $user ) {

				 $erc20 = xprofile_get_field_data( 'ERC20 Address', $user->ID );

				 // Just with registered ERC20 addresses.
				 if ( ! $erc20 && $type === 'with-erc20' ) {
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

		 if ( $format === 'csv' ) {

			 $csv_data = "ID,username,name,email,erc20\n";
			 foreach ( $data as $id => $datum ) {
				 $csv_data .= $id . ',' . implode( ',', array_values( $datum ) ) . "\n";
			 }
			 header( 'Content-Type: text/plain' );
			 echo $csv_data;
			 exit;
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

	private function external_db() {
		if ( empty( $this->external_connection ) ) {
			$this->external_connection = new \wpdb( 'eth_db_stakeborg', 'dMnagM@dTIybNR%p+K1}063teYLH958l', 'eth_db_stakeborg', 'localhost' );
		}

		return $this->external_connection;
	}
}
