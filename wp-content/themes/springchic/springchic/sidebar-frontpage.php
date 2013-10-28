<?php
// Exit if accessed directly
if ( !defined('ABSPATH')) exit;

/**
 * Sidebar for the front page
 *
 * @file           sidebar-frontpage.php
 * @package        SpringChic
 * @author         Color Splash Studio
 * @copyright      http://www.colorsplashstudio.com
 * @license        license.txt
 * @version        Release: 1.0
 * @since          available since Release 1.0
 */
 
if (   ! is_active_sidebar( 'sidebar-bottom1'  )
	&& ! is_active_sidebar( 'sidebar-bottom2' )
	&& ! is_active_sidebar( 'sidebar-bottom3'  )
	&& ! is_active_sidebar( 'sidebar-bottom4'  )		
		
	)

		return;
	// If we get this far, we have widgets. Let do this.
?>

	<div class="row">
		<aside id="bottom-wrapper">
			<?php if ( is_active_sidebar( 'sidebar-bottom1' ) ) : ?>
				<div id="bottom1" <?php bottomgroup_sidebar_class(); ?> role="complementary">
					<?php dynamic_sidebar( 'sidebar-bottom1' ); ?>
				</div><!-- #bottom1 -->
			<?php endif; ?>
			
			<?php if ( is_active_sidebar( 'sidebar-bottom2' ) ) : ?>
				<div id="bottom2" <?php bottomgroup_sidebar_class(); ?> role="complementary">
					<?php dynamic_sidebar( 'sidebar-bottom2' ); ?>
				</div><!-- #bottom2 -->
			<?php endif; ?>
			
			<?php if ( is_active_sidebar( 'sidebar-bottom3' ) ) : ?>
				<div id="bottom3" <?php bottomgroup_sidebar_class(); ?> role="complementary">
					<?php dynamic_sidebar( 'sidebar-bottom3' ); ?>
				</div><!-- #bottom3 -->
			<?php endif; ?>
				
			<?php if ( is_active_sidebar( 'sidebar-bottom4' ) ) : ?>
				<div id="bottom4" <?php bottomgroup_sidebar_class(); ?> role="complementary">
					<?php dynamic_sidebar( 'sidebar-bottom4' ); ?>
				</div><!-- #bottom4 -->
			<?php endif; ?>
		</aside>			
	</div>