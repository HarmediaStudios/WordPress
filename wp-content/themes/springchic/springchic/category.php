<?php
// Exit if accessed directly
if ( !defined('ABSPATH')) exit;

/**
 * For displaying posts within a category
 *
 * @file           category.php
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
		
			<!-- Component -->
			<div id="component" class="span8" role="main">

				<?php if ( have_posts() ) : ?>
					<header class="archive-header category-description">
						<h1 class="archive-title"><?php printf( __( '%s', 'preference' ), '<span>' . single_cat_title( '', false ) . '</span>' ); ?></h1>

					<?php if ( category_description() ) : // Show an optional category description ?>
						<div class="archive-meta"><?php echo category_description(); ?></div>
					<?php endif; ?>
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
			</div><!-- end component -->
			<aside id="right-column" class="span4">
				<?php get_sidebar(); ?>
			</aside>

		</div><!-- .row -->
	</div><!-- .container -->

<?php get_footer(); ?>