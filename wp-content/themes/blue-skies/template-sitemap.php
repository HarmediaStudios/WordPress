<?php

/*

Template Name: Sitemap

*/

?>



<?php get_header(); ?>



		<?php if ( have_posts() ) : while ( have_posts() ) : the_post(); ?>



	<div id="content">



		<div class="post">

			<h1>Sitemap</h1>



			<?php the_content('Read the rest of this entry &raquo;'); ?>

			<h2>Pages</h2>

			<ul>

				<?php wp_list_pages('title_li=' ); ?>

			</ul>



			<h2>Categories</h2>

			<ul>

				<?php wp_list_categories('show_count=1&title_li='); ?>

			</ul>



			<h2>Archives</h2>

			<ul>

				<?php wp_get_archives('type=monthly'); ?>

			</ul>

		</div>



		<?php endwhile; ?>



		<div class="navigation">

			<div class="alignleft"><?php next_posts_link('Older') ?></div>

			<div class="alignright"><?php previous_posts_link('Newer') ?></div>

		</div>



	</div>



		<?php else : ?>



	<div id="content">

	<div class="post">

		<h1>No Posts Found</h1>

		<p><small>Error 404. Page Not Found.</small></p>

	</div>

	</div>



		<?php endif; ?>



<?php get_sidebar(); ?>



<br class="clear" />



<?php get_footer(); ?>