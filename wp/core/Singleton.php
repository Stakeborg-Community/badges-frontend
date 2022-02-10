<?php

namespace Stakeborgdao\Badges;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Class Singleton
 *
 * @package Stakeborgdao\Badges
 */
class Singleton {

	/**
	 * @var array
	 */
	public static $instances = [];

	/**
	 * Singleton constructor.
	 */
	protected function __construct() {
	}

	/**
	 * Don't allow clone
	 */
	private function __clone() {
	}

	final public function __wakeup() {
	}

	/**
	 * Get instance
	 *
	 * @param boolean $params
	 * @return mixed
	 */
	public static function instance( $params = false ) {
		$class = static::class;

		if ( ! isset( self::$instances[ $class ] ) ) {
			if ( false !== $params ) {
				self::$instances[ $class ] = new $class( $params );
			} else {
				self::$instances[ $class ] = new $class();
			}
		}

		return self::$instances[ $class ];
	}
}
