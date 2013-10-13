<?php get_header(); ?>
<?php get_sidebar(); ?>

    <div id="content">

        <?php if (have_posts()) : while (have_posts()) : the_post(); ?>

        <h2 id="post-<?php the_ID(); ?>" title="Permanent Link: <?php the_title(); ?>"><?php the_title(); ?></h2>

        <div class="storycontent">
            <?php the_content(__('(more...)')); ?>
        </div>

        <?php endwhile; else: ?>
        <p><?php _e('Sorry, no posts matched your criteria.'); ?></p>
        <?php endif; ?>

<?php get_footer(); ?>