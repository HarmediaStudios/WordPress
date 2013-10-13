<?php
/*
Template Name: Sitemap Page
*/
?>
<?php
$et_ptemplate_settings = array();
$et_ptemplate_settings = maybe_unserialize( get_post_meta(get_the_ID(),'et_ptemplate_settings',true) );

$fullwidth = isset( $et_ptemplate_settings['et_fullwidthpage'] ) ? (bool) $et_ptemplate_settings['et_fullwidthpage'] : false;
?>

<?php get_header(); ?>
	<div id="main-area">
	<?php if ( have_posts() ) : while ( have_posts() ) : the_post(); ?>
		<?php if (get_option('memoir_integration_single_top') <> '' && get_option('memoir_integrate_singletop_enable') == 'on') echo(get_option('memoir_integration_single_top')); ?>

		<div class="entry clearfix post">
			<h1 class="title"><?php the_title(); ?></h1>

			<?php $thumb = '';
			$width = 135;
			$height = 135;
			$classtext = '';
			$titletext = get_the_title();
			$thumbnail = get_thumbnail($width,$height,$classtext,$titletext,$titletext,false,'Entry');
			$thumb = $thumbnail["thumb"]; ?>

			<?php if($thumb <> '' && get_option('memoir_page_thumbnails') == 'on') { ?>
				<div class="post-thumbnail alignleft">
					<?php print_thumbnail($thumb, $thumbnail["use_timthumb"], $titletext, $width, $height, $classtext); ?>
					<span class="post-overlay"></span>
				</div> 	<!-- end .post-thumbnail -->
			<?php } ?>

			<?php
				echo apply_filters('the_content',et_create_dropcaps(get_the_content()));
			?>
			<?php wp_link_pages(array('before' => '<p><strong>'.esc_html__('Pages','Memoir').':</strong> ', 'after' => '</p>', 'next_or_number' => 'number')); ?>

			<div id="sitemap">
				<div class="sitemap-col">
					<h2><?php esc_html_e('Pages','Memoir'); ?></h2>
					<ul id="sitemap-pages"><?php wp_list_pages('title_li='); ?></ul>
				</div> <!-- end .sitemap-col -->

				<div class="sitemap-col">
					<h2><?php esc_html_e('Categories','Memoir'); ?></h2>
					<ul id="sitemap-categories"><?php wp_list_categories('title_li='); ?></ul>
				</div> <!-- end .sitemap-col -->

				<div class="sitemap-col<?php if (!$fullwidth) echo ' last'; ?>">
					<h2><?php esc_html_e('Tags','Memoir'); ?></h2>
					<ul id="sitemap-tags">
						<?php $tags = get_tags();
						if ($tags) {
							foreach ($tags as $tag) {
								echo '<li><a href="' . esc_url( get_tag_link( $tag->term_id ) ) . '">' . esc_html( $tag->name ) . '</a></li> ';
							}
						} ?>
					</ul>
				</div> <!-- end .sitemap-col -->

				<?php if (!$fullwidth) { ?>
					<div class="clear"></div>
				<?php } ?>

				<div class="sitemap-col<?php if ($fullwidth) echo ' last'; ?>">
					<h2><?php esc_html_e('Authors','Memoir'); ?></h2>
					<ul id="sitemap-authors" ><?php wp_list_authors('show_fullname=1&optioncount=1&exclude_admin=0'); ?></ul>
				</div> <!-- end .sitemap-col -->
			</div> <!-- end #sitemap -->

			<div class="clear"></div>

			<?php edit_post_link(esc_html__('Edit this page','Memoir')); ?>

		</div> <!-- end .entry -->

		<?php if (get_option('memoir_integration_single_bottom') <> '' && get_option('memoir_integrate_singlebottom_enable') == 'on') echo(get_option('memoir_integration_single_bottom')); ?>
	<?php endwhile; endif; ?>
	</div> <!-- end #main-area -->
	<?php if (!$fullwidth) get_sidebar(); ?>
<?php get_footer(); ?>