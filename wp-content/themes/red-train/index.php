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
            <?php comments_popup_link(__('Comments (0)'), __('Comments (1)'), __('Comments (%)')); ?>
        </div>

    	<!--
    	<?php trackback_rdf(); ?>
    	-->

        <?php comments_template(); ?>

        <?php endwhile; else: ?>
        <p><?php _e('Sorry, no posts matched your criteria.'); ?></p>
        <?php endif; ?>

        <?php
        if (function_exists('wp_pagebar')) {
        wp_pagebar(array('before'=>'', 'tooltip_text'=>'Seite', 'next'=>'&raquo;', 'prev'=>'&laquo;'));
        }
        else { ?>
        <div class="center"><?php posts_nav_link('&nbsp;&nbsp;', __('&laquo; Previous Page'), __('Next Page &raquo;')); ?></div>
        <?php } ?>

<?php get_footer(); ?>