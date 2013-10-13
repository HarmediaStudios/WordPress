<?php get_header(); ?>

	<div class="two_third first">
		<h2 class="custom-title"><?php esc_html_e('reserve spot','Event'); ?></h2>
		<div class="big-box">
			<div class="big-box-top">
				<div class="big-box-content">
					<div class="entry" >
						<?php query_posts('page_id=' . get_pageId(146)); ?>
						<?php if (have_posts()) : while (have_posts()) : the_post(); ?>
							<h4 class="title"><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h4>
							<?php
								global $more;
								$more = 0;
								the_content();
							?>
						<?php endwhile; ?>
						<?php else : ?>
							<?php get_template_part('includes/no-results'); ?>
						<?php endif; wp_reset_query(); ?>
					</div> 	<!-- end .entry-->
				</div> 	<!-- end .small-box-content-->
			</div> 	<!-- end .small-box-top-->
		</div> 	<!-- end .small-box-->
	</div> 	<!-- end .blog-half-->

	<div class="one_third last">
		<h2 class="custom-title"><?php esc_html_e('contact us','Event'); ?></h2>
		<div class="tiny-box">
			<div class="tiny-box-top">
				<div class="tiny-box-content">
                    <div class="entry" >
                        <?php 
                        $location_page = 172;
                        $location_content = get_page($location_page); 
                        ?>
                        <h4 class="title"><a href="/<?php echo $location_content->post_name; ?>/"><?php echo $location_content->post_title; ?></a></h4>
                        <?php
                            global $more;
                            $more = 0;
                            echo $location_content->post_content;
                            ?>
							<a href="/contact-us/" class="readmore" id="read_more_contact"><span><?php esc_html_e('more info','Event'); ?></span></a>
						<br/><br/>
                    </div>  <!-- end .entry-->
				</div> 	<!-- end .small-box-content-->
			</div> 	<!-- end .small-box-top-->
		</div> 	<!-- end .small-box-->
	</div> 	<!-- end .blog-half-->

	<div class="clearfix"></div><br/>

	<h2 class="custom-title"><?php esc_html_e('upcoming events','Event'); ?></h2>
	<div class='fullwidth'>
		<div class='big-box' >
	    	<div class='big-box-top'>
	        	<div class='big-box-content'>
					<?php 
					//et_get_calendar();
					if (class_exists('EM_Calendar')) {
						$args = array();
						echo WP_FullCalendar::calendar($args);
					}
					?>
	        </div>
	    </div>
    </div>
</div>

	<div class="clearfix"></div><br/>

	<?php if ( get_option('event_featured') == 'on' ) { ?>
		<h2 class="custom-title"><?php esc_html_e('featured events','Event'); ?></h2>
		<?php get_template_part('includes/featured'); ?>
	<?php } ?>

	<?php if (get_option('event_blog_style') == 'false') { ?>
		<div class="blog-half">
			<h2 class="custom-title"><?php esc_html_e('the blog','Event'); ?></h2>
			<div class="small-box">
				<div class="small-box-top">
					<div class="small-box-content">
						<?php
							$i=0;
							$blog_postsnum = (int) get_option('event_blog_postsnum');
						?>
						<?php if (have_posts()) : while (have_posts()) : the_post(); ?>
							<?php $i++; ?>
							<div class="entry clearfix<?php if ( $i == $blog_postsnum ) echo ' last'; ?>">
								<?php $thumb = '';
								$width = 61;
								$height = 61;
								$classtext = 'thumb alignleft';
								$titletext = get_the_title();

								$thumbnail = get_thumbnail($width,$height,$classtext,$titletext,$titletext,false,'Blog');
								$thumb = $thumbnail["thumb"]; ?>

								<?php if($thumb <> '' && get_option('event_thumbnails_index') == 'on') { ?>
									<div class="thumbnail">
										<a href="<?php the_permalink(); ?>">
											<?php print_thumbnail($thumb, $thumbnail["use_timthumb"], $titletext, $width, $height, $classtext); ?>
											<span class="overlay"></span>
										</a>
									</div> 	<!-- end .thumbnail -->
								<?php } ?>

								<div class="small_datapanel">
									<h4 class="title"><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h4>
									<p class="meta-info"><?php esc_html_e('Posted by','Event'); ?> <?php the_author_posts_link(); ?> <?php esc_html_e('on','Event'); ?> <?php the_time(get_option('event_date_format')) ?> <?php esc_html_e('in','Event'); ?> <?php the_category(', '); ?></p>
									<p><?php truncate_post(60); ?></p>
								</div> 	<!-- end .small_datapanel-->
							</div> 	<!-- end .entry-->
						<?php endwhile; ?>
						<?php else : ?>
							<?php get_template_part('includes/no-results'); ?>
						<?php endif; ?>
					</div> 	<!-- end .small-box-content-->
				</div> 	<!-- end .small-box-top-->
			</div> 	<!-- end .small-box-->
		</div> 	<!-- end .blog-half-->

		<div class="blog-half" id="about">
			<h2 class="custom-title"><?php esc_html_e('about us','Event'); ?></h2>
			<div class="small-box">
				<div class="small-box-top">
					<div class="small-box-content">
						<div class="entry">
							<?php query_posts('page_id=' . get_pageId(html_entity_decode(get_option('event_home_page')))); ?>
							<?php if (have_posts()) : while (have_posts()) : the_post(); ?>
								<h4 class="title"><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h4>
								<?php
									global $more;
									$more = 0;
									the_content('');
								?>
								<a href="<?php the_permalink(); ?>" class="readmore"><span><?php esc_html_e('more info','Event'); ?></span></a>
							<?php endwhile; ?>
							<?php else : ?>
								<?php get_template_part('includes/no-results'); ?>
							<?php endif; wp_reset_query(); ?>
						</div> 	<!-- end .entry-->
					</div> 	<!-- end .small-box-content-->
				</div> 	<!-- end .small-box-top-->
			</div> 	<!-- end .small-box-->
		</div> 	<!-- end .blog-half-->
	<?php } else { ?>
		<div id="left-area">
			<?php get_template_part('includes/entry','home'); ?>
		</div> 	<!-- end #left-area -->

		<?php get_sidebar(); ?>
	<?php } ?>

<?php get_footer(); ?>