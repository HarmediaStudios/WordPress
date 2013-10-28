<?php
// Exit if accessed directly
if ( !defined('ABSPATH')) exit;

/**
 * Sidebar template for pages with a right column
 *
 * @file           sidebar-pageright.php
 * @package        SpringChic
 * @author         Color Splash Studio
 * @copyright      http://www.colorsplashstudio.com
 * @license        license.txt
 * @version        Release: 1.0
 * @since          available since Release 1.0
 */
?>

<?php if ( is_active_sidebar( 'sidebar-pageright' ) ) : ?>
	<div id="secondary" class="widget-area" role="complementary">	
		<?php dynamic_sidebar( 'sidebar-pageright' ); ?>
	</div><!-- #secondary -->
<?php endif; ?>