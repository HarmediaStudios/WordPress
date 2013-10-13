<?php get_header(); ?>



	<div id="content">



		<?php if ( have_posts() ) : while ( have_posts() ) : the_post(); ?>



		<div <?php post_class() ?> id="post-<?php the_ID(); ?>">

			<h1><?php the_title(); ?></h1>



			<?php the_content('Read the rest of this entry &raquo;'); ?>



			<p class="postmetadata"><?php the_tags('Tags: ', ', ', '<br />'); ?> Posted in <?php the_category(', ') ?> | <?php edit_post_link('Edit', '', ''); ?></p>

		</div>



		<?php comments_template(); ?>



		<?php endwhile; ?>



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