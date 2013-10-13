    <div id="navi">
        <div id="navi-innen">
        <?php if ( !function_exists('dynamic_sidebar') || !dynamic_sidebar() ) : ?>
            <h2><?php _e('Pages'); ?></h2>
            <ul>
                <li><a href="<?php bloginfo('url'); ?>">Home</a></li>
                <?php wp_list_pages('sort_column=menu_order&title_li='); ?>
            </ul>

            <h2><?php _e('Categories'); ?></h2>
            <ul>
                <?php if (function_exists('wp_list_cats')) {
                 wp_list_cats('sort_column=name&optioncount=1');
                 }
                 else {
                wp_list_categories('sort_column=name&show_count=1&title_li');
                } ?>
            </ul>

            <h2><?php _e('Archives'); ?></h2>
            <ul>
                <?php wp_get_archives('type=monthly&show_post_count=1'); ?>
            </ul>

            <h2><label for="s"><?php _e('Search:'); ?></label></h2>
                <form id="searchform" method="get" action="<?php echo $PHP_SELF; ?>">
                    <div>
                        <input type="text" name="s" id="s" size="17" class="navi-search" /><br />
                        <input type="submit" name="submit" value="<?php _e('Search'); ?>" class="search-button" />
                    </div>
                </form>

            <h2>RSS-Feeds</h2>
            <ul>
                <li><a href="<?php bloginfo('rss2_url'); ?>" title="<?php _e('Syndicate this site using RSS'); ?>"><?php _e('<abbr title="Really Simple Syndication">RSS</abbr>'); ?></a></li>
                <li><a href="<?php bloginfo('comments_rss2_url'); ?>" title="<?php _e('The latest comments to all posts in RSS'); ?>"><?php _e('Comments <abbr title="Really Simple Syndication">RSS</abbr>'); ?></a></li>
            </ul>

            <h2>Blogroll</h2>
            <ul>
                <?php wp_list_bookmarks('categorize=0&title_li=0'); ?>
            </ul>

            <?php endif; ?>

            <h2><?php _e('Meta'); ?></h2>
            <ul>
                <?php wp_register(); ?>
                <li><?php wp_loginout(); ?></li>
                <?php wp_meta(); ?>
            </ul>

            <?php if (function_exists('wp_theme_switcher')) { ?>
            <h2>Styleswitcher</h2>
            <?php wp_theme_switcher(); ?>
            <?php } ?>

        </div>
    </div>

    <hr />