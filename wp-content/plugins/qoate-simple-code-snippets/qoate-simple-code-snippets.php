<?php
/*
Plugin Name: Qoate Simple Code Snippets
Plugin URI: http://qoate.com/wordpress-plugins/simple-code-snippets/
Description: Add code snippets to your posts easily, WordPress codex style.
Version: 2.0
Author: Danny van Kooten
Author URI: http://qoate.com
License: GPL2
*/

/*  Copyright 2010  Danny van Kooten  (email : danny@qoate.com)

    This program is free software; you can redistribute it and/or modify
    it under the terms of the GNU General Public License, version 2, as 
    published by the Free Software Foundation.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program; if not, write to the Free Software
    Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA  02110-1301  USA
*/

include('qoate-scs-script.php');


// Add settings link on plugin page
function qoate_scs_settings_link($links) { 
  $settings_link = '<a target="_blank" href="http://qoate.com/">Qoate.com</a>'; 
  array_unshift($links, $settings_link); 
  return $links; 
}
$plugin = plugin_basename(__FILE__); 
add_filter("plugin_action_links_$plugin", 'qoate_scs_settings_link' );
?>