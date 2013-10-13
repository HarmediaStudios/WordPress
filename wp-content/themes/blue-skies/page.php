<?php get_header(); ?>



	<div id="content">



		<?php if ( have_posts() ) : while ( have_posts() ) : the_post(); ?>



		<div class="post">

			<h1><?php the_title(); ?></h1>



			<?php the_content('Read the rest of this entry &raquo;'); ?>

		</div>



		<?php endwhile; ?>

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