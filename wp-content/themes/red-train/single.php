<?php get_header(); ?>
<?php get_sidebar(); ?>

    <div id="content">

        <?php if (have_posts()) : while (have_posts()) : the_post(); ?>

        <div class="date"><?php the_date(); ?></div>

        <h2 id="post-<?php the_ID(); ?>"><a href="<?php the_permalink() ?>" rel="bookmark" title="Permanent Link: <?php the_title(); ?>"><?php the_title(); ?></a></h2>

        <div class="meta"><?php _e("Category:"); ?> <?php the_category(',') ?> &#8212; <?php if (function_exists('the_tags')) { the_tags('Tags: ', ', ', ' &ndash; '); } ?><?php the_author() ?> @ <?php the_time() ?> <?php edit_post_link(); ?></div>

        <div class="storycontent">
            <?php the_content(__('(more...)')); ?>
        </div>

        <div class="feedback">
            <?php wp_link_pages(); ?>
        </div>

    	<!--
    	<?php trackback_rdf(); ?>
    	-->

        <div class="pagination"><?php previous_post_link(); ?>&nbsp;&ndash;&nbsp;<?php next_post_link(); ?></div>

        <?php comments_template(); ?>

        <?php endwhile; else: ?>
        <p><?php _e('Sorry, no posts matched your criteria.'); ?></p>
        <?php endif; ?>

<?php get_footer(); ?>