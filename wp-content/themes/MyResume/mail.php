<?php
$subject = $_REQUEST["subject"];
$message = $_REQUEST["message"];
$from = $_REQUEST["from"];
$message = esc_textarea(stripslashes($message));
$subject = stripslashes($subject);
$from = stripslashes($from);
mail("support@makequick.com", 'Website Inquirry: '.esc_html($subject), $_SERVER['REMOTE_ADDR']."\n\n".$message, "From: $from");
?>

<?php get_header(); ?>

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
							<div class="page-content">
								<div class="entry">
								<?php the_content() ?>
								</div>
								<h2><?php the_title() ?></h2>
							</div>

<?php get_footer(); ?>