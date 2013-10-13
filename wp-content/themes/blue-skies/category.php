<?php get_header(); ?>





	<div id="content">



		<ul class="post">

			<li id="cat-title"><h1><?php single_cat_title('<span class="subtitle">Currently browsing;</span>'); ?></h1></li>

			<li id="cat-desc"><?php echo category_description(); ?></li>



		<?php if ( have_posts() ) : while ( have_posts() ) : the_post(); ?>



			<li class="cat-listing"><a href="<?php the_permalink() ?>" rel="bookmark" title="Permanent Link to <?php the_title_attribute(); ?>"><?php the_title(); ?></a><br />

			<?php the_excerpt_rss(); ?></li>



		<?php endwhile; ?>



		<li id="cat-end"><br class="clear" />Stay updated on our <?php single_cat_title(''); ?> via our <a href="<?php bloginfo('rss2_url'); ?>" title="Subscribe to our feed">RSS feed</a></li>



		</ul>



		<div class="navigation">

			<div class="left"><?php next_posts_link('Older') ?></div>

			<div class="right"><?php previous_posts_link('Newer') ?></div>

		</div>



	</div>



		<?php else : ?>



	<div class="post">

		<h1>No Posts Found</h1>

		<p><small>Error 404. Page Not Found.</small></p>

	</div>

	</div>



		<?php endif; ?>



<?php get_sidebar(); ?>



<br class="clear" />



<?php get_footer(); ?>