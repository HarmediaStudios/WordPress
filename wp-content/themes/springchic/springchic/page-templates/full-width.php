<?php
// Exit if accessed directly
if ( !defined('ABSPATH')) exit;

/**
 * Full width Template
 *
   Template Name: Full-width Page Template
 *
 * @file           full-width.php
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
				<div id="component" class="site-content span12" role="main">

					<?php while ( have_posts() ) : the_post(); ?>
						<?php get_template_part( 'content', 'page' ); ?>
						<?php //comments_template( '', true ); ?>
					<?php endwhile; // end of the loop. ?>

				</div><!-- #component -->
			</div>
			
			<?php get_sidebar( 'frontpage' ); ?>
			
		</div>
<?php get_footer(); ?>