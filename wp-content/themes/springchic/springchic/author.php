<?php
// Exit if accessed directly
if ( !defined('ABSPATH')) exit;

/**
 * Displays posts from an author
 *
 * @file           author.php
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
					<?php
						/* Queue the first post, that way we know
						 * what author we're dealing with (if that is the case).
						 *
						 * We reset this later so we can run the loop
						 * properly with a call to rewind_posts().
						 */
						the_post();
					?>

					<header class="archive-header">
						<h1 class="archive-title"><?php printf( __( 'Author Archives: %s', 'preference' ), '<span class="vcard"><a class="url fn n" href="' . esc_url( get_author_posts_url( get_the_author_meta( "ID" ) ) ) . '" title="' . esc_attr( get_the_author() ) . '" rel="me">' . get_the_author() . '</a></span>' ); ?></h1>
					</header><!-- .archive-header -->

					<?php
						/* Since we called the_post() above, we need to
						 * rewind the loop back to the beginning that way
						 * we can run the loop properly, in full.
						 */
						rewind_posts();
					?>

					<?php preference_content_nav( 'nav-above' ); ?>

					<?php
					// If a user has filled out their description, show a bio on their entries.
					if ( get_the_author_meta( 'description' ) ) : ?>
					<div class="author-info">
						<div class="author-avatar">
							<?php echo get_avatar( get_the_author_meta( 'user_email' ), apply_filters( 'preference_author_bio_avatar_size', 60 ) ); ?>
						</div><!-- .author-avatar -->
						<div class="author-description">
							<h2><?php printf( __( 'About %s', 'preference' ), get_the_author() ); ?></h2>
							<p><?php the_author_meta( 'description' ); ?></p>
						</div><!-- .author-description	-->
					</div><!-- .author-info -->
					<?php endif; ?>

					<?php /* Start the Loop */ ?>
					<?php while ( have_posts() ) : the_post(); ?>
						<?php get_template_part( 'content', get_post_format() ); ?>
					<?php endwhile; ?>

					<?php preference_content_nav( 'nav-below' ); ?>

				<?php else : ?>
					<?php get_template_part( 'content', 'none' ); ?>
				<?php endif; ?>
		</div>
				<aside id="right-column" class="span4">
					<?php get_sidebar(); ?>
				</aside>
	</div><!-- #content -->
</section><!-- #primary -->


<?php get_footer(); ?>