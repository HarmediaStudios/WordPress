<?php

// Exit if accessed directly
if ( !defined('ABSPATH')) exit;

/**
 * Single Posts Template
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

				<?php get_template_part( 'content', 'single' ); ?>
						
						<nav class="nav-single clearfix">
							<h3 class="assistive-text"><?php _e( 'Post navigation', 'preference' ); ?></h3>
							<span class="nav-previous"><?php previous_post_link( '%link', '<span class="meta-nav">' . _x( '&larr;', 'Previous post link', 'preference' ) . '</span> %title' ); ?>  </span>
							<span class="nav-next"><?php next_post_link( '%link', '%title <span class="meta-nav">' . _x( '&rarr;', 'Next post link', 'preference' ) . '</span>' ); ?></span>
						</nav><!-- .nav-single -->

						<?php comments_template( '', true ); ?>

					<?php endwhile; // end of the loop. ?>

				</div><!-- #component -->
				
				<aside id="right-column" class="span4">
					<?php get_sidebar( '' ); ?>
				</aside>
				
			</div>
		</div>

<?php get_footer(); ?>