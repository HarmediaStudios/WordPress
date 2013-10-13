<?php get_header(); ?>

	<div id="content">

		<?php if ( have_posts() ) : while ( have_posts() ) : the_post(); ?>

		<div <?php post_class() ?> id="post-<?php the_ID(); ?>">

			<h1><a href="<?php the_permalink() ?>" rel="bookmark" title="Permanent Link to <?php the_title_attribute(); ?>"><?php the_title(); ?></a></h1>

			<?php the_content('Read More'); ?>

			<p class="postmetadata"><?php the_tags('Tags: ', ', ', '<br />'); ?> Posted in <?php the_category(', ') ?> | <?php edit_post_link('Edit', '', ' | '); ?>  <?php comments_popup_link('No Comments', '1 Comment', '% Comments'); ?></p>
		</div>

		<?php endwhile; ?>

		<div class="navigation">
			<div class="left"><?php next_posts_link('Older') ?></div>
			<div class="right"><?php previous_posts_link('Newer') ?></div>
		</div>

	</div>

		<?php else : ?>

	<div class="post">
		<h1>Whoops</h1>
		<p>Your search for "<?php echo wp_specialchars($s); ?>" returned no results.</p>
	</div>
	</div>

		<?php endif; ?>

<?php get_sidebar(); ?>

<br class="clear" />

<?php get_footer(); ?>