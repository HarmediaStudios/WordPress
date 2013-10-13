<?php get_header(); ?>

	<?php get_template_part('includes/breadcrumbs'); ?>

	<div id="left-area">
	<?php if ( have_posts() ) : while ( have_posts() ) : the_post(); ?>
		<div class="big-box">
			<div class="big-box-top">
				<div class="big-box-content">
					<div class="post clearfix single">
						<?php if (get_option('event_page_thumbnails') == 'on') { ?>
							<?php
								$thumb = '';
								$width = 188;
								$height = 188;
								$classtext = 'post-thumb';
								$titletext = get_the_title();

								$thumbnail = get_thumbnail($width,$height,$classtext,$titletext,$titletext,false,'Entry');
								$thumb = $thumbnail["thumb"];
							?>
							<?php if($thumb <> '') { ?>
								<div class="post-thumbnail">
									<?php print_thumbnail($thumb, $thumbnail["use_timthumb"], $titletext, $width, $height, $classtext); ?>
									<span class="post-overlay"></span>
								</div> 	<!-- end .post-thumbnail -->
							<?php } ?>
						<?php } ?>

						<h1 class="title"><?php the_title(); ?></h1>

						<?php the_content(); ?>
						<?php wp_link_pages(array('before' => '<p><strong>'.esc_html__('Pages','Event').':</strong> ', 'after' => '</p>', 'next_or_number' => 'number')); ?>
						<?php edit_post_link(esc_html__('Edit this page','Event')); ?>
					</div> 	<!-- end .post-->
				</div> 	<!-- end .big-box-content-->
			</div> 	<!-- end .big-box-top-->
		</div> 	<!-- end .big-box-->

		<?php if (get_option('event_show_pagescomments') == 'on') comments_template('', true); ?>
	<?php endwhile; endif; ?>
	</div> 	<!-- end #left-area -->

	<?php get_sidebar(); ?>

<?php get_footer(); ?>