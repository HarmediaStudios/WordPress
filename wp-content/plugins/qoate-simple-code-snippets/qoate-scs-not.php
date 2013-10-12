<?php
add_filter('the_excerpt_rss','qoate_strip_shortcodes');
add_filter('the_content_rss','qoate_strip_shortcodes');
add_filter('the_excerpt','qoate_strip_shortcodes');
add_filter('the_content','qoate_strip_shortcodes');

function qoate_strip_shortcodes($content){
	$content=str_replace('[code]','<pre>',$content);
	$content=str_replace('[/code]','</pre>',$content);
return $content;
}

?>