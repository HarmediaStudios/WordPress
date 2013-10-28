<?php
// Exit if accessed directly
if ( !defined('ABSPATH')) exit;

/**
 * Custom Front Page Template
 *
   Template Name: Front Page Template + Right Sidebar
 *
 * @file           single.php
 * @package        SpringChic
 * @author         Color Splash Studio
 * @copyright      http://www.colorsplashstudio.com
 * @license        license.txt
 * @version        Release: 1.0
 * @since          available since Release 1.0
 */
 
get_header(); ?>

	<!-- Main Content -->			
		<div class="container">
			<div class="row">
				<div id="component" class="site-content span8" role="main">

					<?php while ( have_posts() ) : the_post(); ?>
						<?php get_template_part( 'content', 'page' ); ?>
						<?php //comments_template( '', true ); ?>
					<?php endwhile; // end of the loop. ?>

				</div><!-- #component -->
				
				<aside id="right-column" class="span4">
					<?php get_sidebar( 'pageright' ); ?>
				</aside>
				
			</div>
		
				<?php get_sidebar( 'frontpage' ); ?>
				
		</div>
		
<?php get_footer(); ?>