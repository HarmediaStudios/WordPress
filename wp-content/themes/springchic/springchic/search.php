<?php
// Exit if accessed directly
if ( !defined('ABSPATH')) exit;

/**
 * Search Template
 *
 * @file           search.php
 * @package        SpringChic
 * @author         Color Splash Studio
 * @copyright      http://www.colorsplashstudio.com
 * @license        license.txt
 * @version        Release: 1.0
 * @since          available since Release 1.0
 */

get_header(); ?>

	<!-- Main Content -->			
		<section class="container">
			<div class="row">		
				<!-- Component -->
					<div id="component" class="span8" role="main">

						<?php if ( have_posts() ) : ?>

							<header class="page-header">
								<h1 class="page-title"><?php printf( __( 'Search Results for: %s', 'preference' ), '<span>' . get_search_query() . '</span>' ); ?></h1>
							</header>

							<?php /* Start the Loop */ ?>
							<?php while ( have_posts() ) : the_post(); ?>
								<?php get_template_part( 'content', get_post_format() ); ?>
							<?php endwhile; ?>

							<?php preference_content_nav( 'nav-below' ); ?>

						<?php else : ?>

							<article id="post-0" class="post no-results not-found">
								<header class="entry-header">
									<h1 class="entry-title"><?php _e( 'Nothing Found', 'preference' ); ?></h1>
								</header>

								<div class="entry-content">
									<p><?php _e( 'Sorry, but nothing matched your search criteria. Please try again with some different keywords.', 'preference' ); ?></p>
									<?php get_search_form(); ?>
								</div><!-- .entry-content -->
							</article><!-- #post-0 -->

						<?php endif; ?>
					</div>
					
					<aside id="right-column" class="span4">
						<?php get_sidebar(); ?>
					</aside>
					
		</div><!-- #content -->
	</section><!-- #primary -->


<?php get_footer(); ?>