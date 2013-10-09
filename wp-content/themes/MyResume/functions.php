<?php
add_action( 'after_setup_theme', 'et_setup_theme' );
if ( ! function_exists( 'et_setup_theme' ) ){
	function et_setup_theme(){
		global $themename, $shortname, $default_colorscheme;
		$themename = "MyResume";
		$shortname = "myresume";
		$default_colorscheme = "Grey";

		$template_dir = get_template_directory();

		require_once($template_dir . '/epanel/custom_functions.php');

		require_once($template_dir . '/includes/functions/sidebars.php');

		require_once($template_dir . '/epanel/core_functions.php');

		require_once($template_dir . '/epanel/post_thumbnails_myresume.php');

		include($template_dir . '/includes/widgets.php');
	}
}

if ( ! function_exists( 'portImage' ) ){
	function portImage($atts, $content = null) {
		return '<a class="gallery-item" href="'. et_new_thumb_resize( et_multisite_thumbnail(esc_attr($content)), 600, 500, '', true ) .'" rel="'.et_new_thumb_resize( et_multisite_thumbnail(esc_attr($content)), 388, 222, '', true ).'"><img src="'.et_new_thumb_resize( et_multisite_thumbnail(esc_attr($content)), 59, 59, '', true ).'" alt="" /></a>';
	};
}
add_shortcode("portfolio", "portImage");

if ( ! function_exists( 'et_list_pings' ) ){
	function et_list_pings($comment, $args, $depth) {
		$GLOBALS['comment'] = $comment; ?>
		<li id="comment-<?php comment_ID(); ?>"><?php comment_author_link(); ?> - <?php comment_excerpt(); ?>
	<?php }
}

function et_epanel_custom_colors_css(){
	global $shortname; ?>

	<style type="text/css">
		body { color: #<?php echo esc_html(get_option($shortname.'_color_mainfont')); ?>; }
		#inside a { color: #<?php echo esc_html(get_option($shortname.'_color_mainlink')); ?>; }
		#inside a:hover { color: #<?php echo esc_html(get_option($shortname.'_color_mainlink_hover')); ?>; }
		#header ul li a { color: #<?php echo esc_html(get_option($shortname.'_color_pagelink')); ?>; }
		#header ul li a:hover { color: #<?php echo esc_html(get_option($shortname.'_color_pagelink_hover')); ?>; }
		#header ul li.active a { color: #<?php echo esc_html(get_option($shortname.'_color_pagelink_active')); ?>; }
		h2 { color: #<?php echo esc_html(get_option($shortname.'_color_headings')); ?>; }
		#footer, #footer a {color: #<?php echo esc_html(get_option($shortname.'_footer_text')); ?>; }
		.entry ul li { color: #<?php echo esc_html(get_option($shortname.'_color_list')); ?>; }
	</style>

<?php }