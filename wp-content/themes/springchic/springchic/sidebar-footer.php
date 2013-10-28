<?php
// Exit if accessed directly
if ( !defined('ABSPATH')) exit;

/**
 * Sidebar for the footer
 *
 * @file           sidebar-footer.php
 * @package        SpringChic
 * @author         Color Splash Studio
 * @copyright      http://www.colorsplashstudio.com
 * @license        license.txt
 * @version        Release: 1.0
 * @since          available since Release 1.0
 */
 
if (   ! is_active_sidebar( 'sidebar-footer1'  )
	&& ! is_active_sidebar( 'sidebar-footer2' )
	&& ! is_active_sidebar( 'sidebar-footer3'  )
	&& ! is_active_sidebar( 'sidebar-footer4'  )		
		
	)

		return;
	// If we get this far, we have widgets. Let do this.
?>


<aside id="sidebar-footer">
	
	<?php if ( is_active_sidebar( 'sidebar-footer1' ) ) : ?>
		<div id="footer1" <?php footergroup_sidebar_class(); ?> role="complementary">
			<?php dynamic_sidebar( 'sidebar-footer1' ); ?>
		</div><!-- #footer1 -->
	<?php endif; ?>
	
	<?php if ( is_active_sidebar( 'sidebar-footer2' ) ) : ?>
		<div id="footer2" <?php footergroup_sidebar_class(); ?> role="complementary">
			<?php dynamic_sidebar( 'sidebar-footer2' ); ?>
		</div><!-- #footer2 -->
	<?php endif; ?>
	
	<?php if ( is_active_sidebar( 'sidebar-footer3' ) ) : ?>
		<div id="footer3" <?php footergroup_sidebar_class(); ?> role="complementary">
			<?php dynamic_sidebar( 'sidebar-footer3' ); ?>
		</div><!-- #footer3 -->
	<?php endif; ?>
		
	<?php if ( is_active_sidebar( 'sidebar-footer4' ) ) : ?>
		<div id="footer4" <?php footergroup_sidebar_class(); ?> role="complementary">
			<?php dynamic_sidebar( 'sidebar-footer4' ); ?>
		</div><!-- #bottom4 -->
	<?php endif; ?>
	
</aside>			