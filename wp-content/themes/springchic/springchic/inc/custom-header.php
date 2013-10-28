<?php
// Exit if accessed directly
if ( !defined('ABSPATH')) exit;

/**
 * WP Custom Header for our showcase
 *
 * @file           custom-header.php
 * @package        SpringChic
 * @author         Color Splash Studio
 * @copyright      http://www.colorsplashstudio.com
 * @license        license.txt
 * @version        Release: 1.0
 * @since          available since Release 1.0
 */
 
function preference_custom_header_setup() {
	$args = array(
		// Text color and image (empty to use none).
		'default-image'          => '',

		// Set height and width, with a maximum value for the width.
		'height'                 => 400,
		'width'                  => 1200,
		'max-width'              => 1200,

		// Support flexible height and width.
		'flex-height'            => true,
		'flex-width'             => true,

		// Random image rotation off by default.
		'random-default'         => false,
		
		// Text 
		'default-text-color'     => '',
		'header-text'            => false,

		// Callbacks for styling the header and the admin preview.
		'admin-preview-callback' => 'preference_admin_header_image',	
		
	);

	add_theme_support( 'custom-header', $args );
}
add_action( 'after_setup_theme', 'preference_custom_header_setup' );

/**
 * Outputs markup to be displayed on the Appearance > Header admin panel.
 * This callback overrides the default markup displayed there.
 *
 */
function preference_admin_header_image() {
	?>
	<div id="headimg">
		
		<?php $header_image = get_header_image();
		if ( ! empty( $header_image ) ) : ?>
			<img src="<?php echo esc_url( $header_image ); ?>" class="header-image" width="<?php echo get_custom_header()->width; ?>" height="<?php echo get_custom_header()->height; ?>" alt="" />
		<?php endif; ?>
	</div>
<?php }