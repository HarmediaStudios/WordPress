<?php
// Exit if accessed directly
if ( !defined('ABSPATH')) exit;

/**
 * Custom 404 error page
 *
 * @file           404.php
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

			<article id="post-0" class="post error404 no-results not-found span12">
				<header class="entry-header">
					<h1 class="entry-title"><?php _e( 'This is somewhat embarrassing, isn&rsquo;t it?', 'preference' ); ?></h1>
				</header>

				<div class="entry-content">
					<p><?php _e( 'It seems we can&rsquo;t find what you&rsquo;re looking for. Perhaps searching can help.', 'preference' ); ?></p>
					<?php get_search_form(); ?>
				</div><!-- .entry-content -->
			</article><!-- #post-0 -->

		</div><!-- .row -->
	</section><!-- section -->

<?php get_footer(); ?>