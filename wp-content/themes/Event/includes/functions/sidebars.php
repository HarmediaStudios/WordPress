<?php
if ( function_exists('register_sidebar') )
    register_sidebar(array(
		'name' => 'Sidebar',
		'before_widget' => '<div id="%1$s" class="widget %2$s"><div class="widget-top">',
		'after_widget' => '</div> <!-- end .widget-content--></div> <!-- end .widget-top--></div> <!-- end .widget -->',
		'before_title' => '<div class="widget-content"><h4 class="widgettitle">',
		'after_title' => '</h4>',
    ));

if ( function_exists('register_sidebar') )
    register_sidebar(array(
		'name' => 'Footer',
		'before_widget' => '<div id="%1$s" class="footer-widget %2$s">',
		'after_widget' => '</div> <!-- end .widget -->',
		'before_title' => '<h4 class="widgettitle">',
		'after_title' => '</h4>',
    ));
?>