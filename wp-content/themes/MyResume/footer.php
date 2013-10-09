</div>
					<?php
						$et_featured_pages_args = array(
							'post_type' => 'page',
							'orderby' => get_option('myresume_nav_sort_pages'),
							'order' => get_option('myresume_nav_order_page'),
						);

						if ( is_array( et_get_option( 'myresume_nav_exclude_pages', '', 'page' ) ) )
							$et_featured_pages_args['post__not_in'] = (array) array_map( 'intval', et_get_option( 'myresume_nav_exclude_pages', '', 'page' ) );

						query_posts( $et_featured_pages_args );
					?>
						<?php if (have_posts()) : while (have_posts()) : the_post()?>
						<div class="<?php echo esc_attr( $post->post_name ); ?> slide">
							<div class="page-content">
							<?php $connect = get_post_meta(get_the_ID(), 'Type', $single = true); ?>
								<div class="entry <?php if ($connect == 'Connect') { ?>connect-div<?php }; ?>">
								<?php the_content('') ?>
							  <?php if ($connect == 'Connect') { ?>
								<?php if ( !function_exists('dynamic_sidebar') || !dynamic_sidebar('Connect') ) : ?>
								<?php endif; ?>
<?php }; ?>
								</div>
								<h2><?php the_title() ?></h2>
							</div>
						</div>
						<?php endwhile; endif; wp_reset_query(); ?>

					</div>
				</div>
			</div>
		</div>
		<br class="clear" />
	</div>
	<div id="footer">Designed by <a href="http://www.elegantthemes.com">Elegant WordPress Themes</a></div>
</div>

<?php wp_footer(); ?>

<?php get_template_part('includes/scripts'); ?>

</body>
</html>