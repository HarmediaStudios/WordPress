<?php 
/*
  Plugin Name: Publish Anonymous Posts
  Plugin URI: http://wordpresslivro.com/publish-anonymous-posts
  Description: Allow guests of your blog create posts without signup
  Version: 1.0
  Author: Anderson Makiyama
  Author URI: http://wordpresslivro.com
*/

/**
 * Publish Anonymous Posts
 * 
 * @author Anderson Makiyama <wordpresslivro.com@gmail.com>
 * @package publish-anonymous-posts
 *
 */

function display_pap($atts=array(),$content=""){
	$url = site_url() . '/wp-content/plugins/publish-anonymous-posts/post-form.php';
	return "<iframe src='$url' frameborder='0' class='sourceView' noresize='noresize' style='height:425px;width:100%;z-index:10;-webkit-box-sizing: border-box;'></iframe>";
}
add_shortcode('showform','display_pap');

function your_plugin_settings_link($links) { 
  $settings_link = '<a href="options-general.php?page=publish-anonymous-posts/publish-anonymous-posts.php">Settings</a>'; 
  array_unshift($links, $settings_link); 
  return $links; 
}

$plugin = plugin_basename(__FILE__); 
add_filter("plugin_action_links_$plugin", 'your_plugin_settings_link' );

function pap_menu() {
  global $user_level;
  get_currentuserinfo();
  if ($user_level < 10) {
    return;
  }

  if (function_exists('add_options_page')) {
    add_options_page(__('Publish Anomymous Posts'), __('Publish Anomymous Posts'), 1, __FILE__, 'pap_page');
  }
}

function pap_page() {
  $pap_status = isset($_POST["sl_pap_status"])?$_POST["sl_pap_status"]:"pending";
  $pap_user = isset($_POST["txt_pap_user"])?(0==((int)$_POST["txt_pap_user"])?1:(int)$_POST["txt_pap_user"]):1;
  $pap_category = isset($_POST["txt_pap_category"])?(0==((int)$_POST["txt_pap_category"])?1:(int)$_POST["txt_pap_category"]):1;
  $pap_limit = isset($_POST["txt_pap_limit"])?(0==((int)$_POST["txt_pap_limit"])?-1:(int)$_POST["txt_pap_limit"]):-1;
  
  $update = isset($_POST["submit"])?$_POST["submit"]:"";
  if (!empty($update)) {

    update_option('pap_status', $pap_status);
	update_option('pap_user',$pap_user);
	update_option('pap_category',$pap_category);
	update_option('pap_limit',$pap_limit);
	
    echo '<div class="updated"><p>' . __('Options saved') . '</p></div>';
  }
  
  include 'templates/options.tpl.php';
}

add_action('admin_menu', 'pap_menu'); 

function is_selected($x,$y){
	if($x==$y) return ' selected="selected" ';
	return "";
}