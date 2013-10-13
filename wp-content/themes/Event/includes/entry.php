<?php if (have_posts()) : while (have_posts()) : the_post(); ?>
	<div class="big-box">
		<div class="big-box-top">
			<div class="big-box-content">
				<div class="post clearfix">
					<?php
						$thumb = '';
						$width = 188;
						$height = 188;
						$classtext = 'post-thumb';
						$titletext = get_the_title();

						$thumbnail = get_thumbnail($width,$height,$classtext,$titletext,$titletext,false,'Entry');
						$thumb = $thumbnail["thumb"];
					?>

					<?php if($thumb <> '' && get_option('event_thumbnails_index') == 'on') { ?>
						<div class="post-thumbnail">
							<a href="<?php the_permalink(); ?>">
								<?php print_thumbnail($thumb, $thumbnail["use_timthumb"], $titletext, $width, $height, $classtext); ?>
								<span class="post-overlay"></span>
							</a>
						</div> 	<!-- end .post-thumbnail -->
					<?php } ?>

				<?php if (get_option('event_blog_style') == 'false') { ?>
					<div class="post-panel<?php if ($thumb=='' || get_option('event_thumbnails_index') == 'false') echo ' nothumb'; ?>">
				<?php } ?>
						<h3 class="title"><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h3>

						<?php get_template_part('includes/postinfo'); ?>

						<?php if (get_option('event_blog_style') == 'on') the_content(''); else { ?>
							<p><?php truncate_post(475); ?></p>
						<?php } ?>
				<?php if (get_option('event_blog_style') == 'false') { ?>
					</div> <!-- end .post-panel -->
				<?php } ?>
					<a href="<?php the_permalink(); ?>" class="readmore"><span><?php esc_html_e('more info','Event'); ?></span></a>
				</div> 	<!-- end .post-->
			</div> 	<!-- end .big-box-content-->
		</div> 	<!-- end .big-box-top-->
	</div> 	<!-- end .big-box-->
<?php endwhile; ?>
	<div class="clear"></div>
	<?php if(function_exists('wp_pagenavi')) { wp_pagenavi(); }
	else { ?>
		 <?php get_template_part('includes/navigation'); ?>
	<?php } ?>
<?php else : ?>
	<?php get_template_part('includes/no-results'); ?>
<?php endif; ?>