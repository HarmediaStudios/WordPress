<?php
// Exit if accessed directly
if ( !defined('ABSPATH')) exit;

/**
 * For displaying post archives
 *
 * @file           archive.php
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
				<header class="archive-header">
					<h1 class="archive-title"><?php
						if ( is_day() ) :
							printf( __( 'Daily Archives: %s', 'preference' ), '<span>' . get_the_date() . '</span>' );
						elseif ( is_month() ) :
							printf( __( 'Monthly Archives: %s', 'preference' ), '<span>' . get_the_date( _x( 'F Y', 'monthly archives date format', 'preference' ) ) . '</span>' );
						elseif ( is_year() ) :
							printf( __( 'Yearly Archives: %s', 'preference' ), '<span>' . get_the_date( _x( 'Y', 'yearly archives date format', 'preference' ) ) . '</span>' );
						else :
							_e( 'Archives', 'preference' );
						endif;
					?></h1>
				</header><!-- .archive-header -->

				<?php
				/* Start the Loop */
				while ( have_posts() ) : the_post();

					/* Include the post format-specific template for the content. If you want to
					 * this in a child theme then include a file called called content-___.php
					 * (where ___ is the post format) and that will be used instead.
					 */
					get_template_part( 'content', get_post_format() );

				endwhile;

				preference_content_nav( 'nav-below' );
				?>

			<?php else : ?>
				<?php get_template_part( 'content', 'none' ); ?>
			<?php endif; ?>
			
			</div><!-- #component -->
			
			<aside id="right-column" class="span4">
				<?php get_sidebar(); ?>
			</aside>
			
		</div><!-- .row -->
	</section><!-- section -->


<?php get_footer(); ?>