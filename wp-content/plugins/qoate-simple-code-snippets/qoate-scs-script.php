<?php
add_action('wp_print_styles','add_qoate_scs_style');
remove_filter('the_content','wpautop');
add_filter('the_content','wpautop',99);
add_shortcode('code', 'qoate_replace_code');
add_filter('the_excerpt_rss','qoate_strip_shortcodes');
add_filter('the_content_rss','qoate_strip_shortcodes');
add_filter('the_excerpt','qoate_strip_shortcodes',1);
add_filter('the_content','qoate_strip_shortcodes',99);

function add_qoate_scs_style(){
	wp_enqueue_style('qoate_scs_style', WP_CONTENT_URL . '/plugins/' . plugin_basename(dirname(__FILE__)). '/qoate-scs-style.css');
}

function qoate_replace_code($atts,$content) {
	if(version_compare(PHP_VERSION,'5.2.3')== -1) {
		$content ='<pre class="qoate-code">'.htmlspecialchars($content,ENT_NOQUOTES,'UTF-8').'</pre>';
	} else {
		$content ='<pre class="qoate-code">'.htmlspecialchars($content,ENT_NOQUOTES,'UTF-8',false).'</pre>';
	}
	return $content;
}

function qoate_strip_shortcodes($content){
	$content=str_replace('[code]','<pre>',$content);
	$content=str_replace('[/code]','</pre>',$content);
return $content;
}

?>