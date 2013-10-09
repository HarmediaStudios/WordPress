<?php get_header(); ?>
					<?php
						$et_featured_pages_args = array(
							'post_type' => 'page',
							'orderby' => get_option('myresume_sort_pages'),
							'order' => get_option('myresume_order_page'),
						);

						if ( is_array( et_get_option( 'myresume_exclude_pages', '', 'page' ) ) )
							$et_featured_pages_args['post__in'] = (array) array_map( 'intval', et_get_option( 'myresume_exclude_pages', '', 'page' ) );

						query_posts( $et_featured_pages_args );
					?>
							<?php if (have_posts()) : while (have_posts()) : the_post()?>
							<div class="page-content">
								<div class="entry">
								<?php the_content('') ?>
								</div>
								<h2><?php the_title() ?></h2>
							</div>
						<?php endwhile; endif; wp_reset_query(); ?>


<?php get_footer(); ?>
