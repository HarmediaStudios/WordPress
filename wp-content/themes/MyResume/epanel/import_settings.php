<?php
add_action( 'admin_enqueue_scripts', 'import_epanel_javascript' );
function import_epanel_javascript( $hook_suffix ) {
	if ( 'admin.php' == $hook_suffix && isset( $_GET['import'] ) && isset( $_GET['step'] ) && 'wordpress' == $_GET['import'] && '1' == $_GET['step'] )
		add_action( 'admin_head', 'admin_headhook' );
}

function admin_headhook(){ ?>
	<script type="text/javascript">
		jQuery(document).ready(function($){
			$("p.submit").before("<p><input type='checkbox' id='importepanel' name='importepanel' value='1' style='margin-right: 5px;'><label for='importepanel'>Replace ePanel settings with sample data values</label></p>");
		});
	</script>
<?php }

add_action('import_end','importend');
function importend(){
	global $wpdb, $shortname;

	#make custom fields image paths point to sampledata/sample_images folder
	$sample_images_postmeta = $wpdb->get_results(
		$wpdb->prepare( "SELECT meta_id, meta_value FROM $wpdb->postmeta WHERE meta_value REGEXP %s", 'http://et_sample_images.com' )
	);
	if ( $sample_images_postmeta ) {
		foreach ( $sample_images_postmeta as $postmeta ){
			$template_dir = get_template_directory_uri();
			if ( is_multisite() ){
				switch_to_blog(1);
				$main_siteurl = site_url();
				restore_current_blog();

				$template_dir = $main_siteurl . '/wp-content/themes/' . get_template();
			}
			preg_match( '/http:\/\/et_sample_images.com\/([^.]+).jpg/', $postmeta->meta_value, $matches );
			$image_path = $matches[1];

			$local_image = preg_replace( '/http:\/\/et_sample_images.com\/([^.]+).jpg/', $template_dir . '/sampledata/sample_images/$1.jpg', $postmeta->meta_value );

			$local_image = preg_replace( '/s:55:/', 's:' . strlen( $template_dir . '/sampledata/sample_images/' . $image_path . '.jpg' ) . ':', $local_image );

			$wpdb->update( $wpdb->postmeta, array( 'meta_value' => esc_url_raw( $local_image ) ), array( 'meta_id' => $postmeta->meta_id ), array( '%s' ) );
		}
	}

	if ( !isset($_POST['importepanel']) )
		return;

	$importOptions = 'YTo1Mjp7czowOiIiO047czoxMzoibXlyZXN1bWVfbG9nbyI7czowOiIiO3M6MTY6Im15cmVzdW1lX2Zhdmljb24iO3M6MDoiIjtzOjIxOiJteXJlc3VtZV9jb2xvcl9zY2hlbWUiO3M6NjoiV29vZGVuIjtzOjIzOiJteXJlc3VtZV9lbmhhbmNlX2pxdWVyeSI7czoyOiJvbiI7czoyMjoibXlyZXN1bWVfZXhjbHVkZV9wYWdlcyI7YTozOntpOjA7czozOiI3MjQiO2k6MTtzOjM6IjIzNSI7aToyO3M6MzoiNjY4Ijt9czoxOToibXlyZXN1bWVfc29ydF9wYWdlcyI7czoxMDoicG9zdF90aXRsZSI7czoxOToibXlyZXN1bWVfb3JkZXJfcGFnZSI7czozOiJhc2MiO3M6MTU6Im15cmVzdW1lX2F2YXRhciI7czo2MzoiaHR0cDovL2Zhcm01LnN0YXRpYy5mbGlja3IuY29tLzQxNTQvNTA0MDMxMjMyOV80ZTQ4MWJjMGUwX20uanBnIjtzOjE0OiJteXJlc3VtZV9lbWFpbCI7czowOiIiO3M6MTQ6Im15cmVzdW1lX3Bob25lIjtzOjA6IiI7czoyNjoibXlyZXN1bWVfbmF2X2V4Y2x1ZGVfcGFnZXMiO2E6Mjp7aTowO3M6MzoiMTY0IjtpOjE7czozOiIyMzUiO31zOjIzOiJteXJlc3VtZV9uYXZfc29ydF9wYWdlcyI7czoxMDoicG9zdF90aXRsZSI7czoyMzoibXlyZXN1bWVfbmF2X29yZGVyX3BhZ2UiO3M6MzoiYXNjIjtzOjIyOiJteXJlc3VtZV9jdXN0b21fY29sb3JzIjtOO3M6MTg6Im15cmVzdW1lX2NoaWxkX2NzcyI7TjtzOjIxOiJteXJlc3VtZV9jaGlsZF9jc3N1cmwiO3M6MDoiIjtzOjIzOiJteXJlc3VtZV9jb2xvcl9tYWluZm9udCI7czowOiIiO3M6MjM6Im15cmVzdW1lX2NvbG9yX21haW5saW5rIjtzOjA6IiI7czoyOToibXlyZXN1bWVfY29sb3JfbWFpbmxpbmtfaG92ZXIiO3M6MDoiIjtzOjIzOiJteXJlc3VtZV9jb2xvcl9wYWdlbGluayI7czowOiIiO3M6Mjk6Im15cmVzdW1lX2NvbG9yX3BhZ2VsaW5rX2hvdmVyIjtzOjA6IiI7czozMDoibXlyZXN1bWVfY29sb3JfcGFnZWxpbmtfYWN0aXZlIjtzOjA6IiI7czoyMzoibXlyZXN1bWVfY29sb3JfaGVhZGluZ3MiO3M6MDoiIjtzOjI2OiJteXJlc3VtZV9jb2xvcl9mb290ZXJfdGV4dCI7czowOiIiO3M6MTk6Im15cmVzdW1lX2NvbG9yX2xpc3QiO3M6MDoiIjtzOjIzOiJteXJlc3VtZV9zZW9faG9tZV90aXRsZSI7TjtzOjI5OiJteXJlc3VtZV9zZW9faG9tZV9kZXNjcmlwdGlvbiI7TjtzOjI2OiJteXJlc3VtZV9zZW9faG9tZV9rZXl3b3JkcyI7TjtzOjI3OiJteXJlc3VtZV9zZW9faG9tZV9jYW5vbmljYWwiO047czoyNzoibXlyZXN1bWVfc2VvX2hvbWVfdGl0bGV0ZXh0IjtzOjA6IiI7czozMzoibXlyZXN1bWVfc2VvX2hvbWVfZGVzY3JpcHRpb250ZXh0IjtzOjA6IiI7czozMDoibXlyZXN1bWVfc2VvX2hvbWVfa2V5d29yZHN0ZXh0IjtzOjA6IiI7czoyMjoibXlyZXN1bWVfc2VvX2hvbWVfdHlwZSI7czoyNzoiQmxvZ05hbWUgfCBCbG9nIGRlc2NyaXB0aW9uIjtzOjI2OiJteXJlc3VtZV9zZW9faG9tZV9zZXBhcmF0ZSI7czozOiIgfCAiO3M6MjU6Im15cmVzdW1lX3Nlb19zaW5nbGVfdGl0bGUiO047czozMToibXlyZXN1bWVfc2VvX3NpbmdsZV9kZXNjcmlwdGlvbiI7TjtzOjI4OiJteXJlc3VtZV9zZW9fc2luZ2xlX2tleXdvcmRzIjtOO3M6Mjk6Im15cmVzdW1lX3Nlb19zaW5nbGVfY2Fub25pY2FsIjtOO3M6MzE6Im15cmVzdW1lX3Nlb19zaW5nbGVfZmllbGRfdGl0bGUiO3M6OToic2VvX3RpdGxlIjtzOjM3OiJteXJlc3VtZV9zZW9fc2luZ2xlX2ZpZWxkX2Rlc2NyaXB0aW9uIjtzOjE1OiJzZW9fZGVzY3JpcHRpb24iO3M6MzQ6Im15cmVzdW1lX3Nlb19zaW5nbGVfZmllbGRfa2V5d29yZHMiO3M6MTI6InNlb19rZXl3b3JkcyI7czoyNDoibXlyZXN1bWVfc2VvX3NpbmdsZV90eXBlIjtzOjIxOiJQb3N0IHRpdGxlIHwgQmxvZ05hbWUiO3M6Mjg6Im15cmVzdW1lX3Nlb19zaW5nbGVfc2VwYXJhdGUiO3M6MzoiIHwgIjtzOjI4OiJteXJlc3VtZV9zZW9faW5kZXhfY2Fub25pY2FsIjtOO3M6MzA6Im15cmVzdW1lX3Nlb19pbmRleF9kZXNjcmlwdGlvbiI7TjtzOjIzOiJteXJlc3VtZV9zZW9faW5kZXhfdHlwZSI7czoyNDoiQ2F0ZWdvcnkgbmFtZSB8IEJsb2dOYW1lIjtzOjI3OiJteXJlc3VtZV9zZW9faW5kZXhfc2VwYXJhdGUiO3M6MzoiIHwgIjtzOjMyOiJteXJlc3VtZV9pbnRlZ3JhdGVfaGVhZGVyX2VuYWJsZSI7czoyOiJvbiI7czozMDoibXlyZXN1bWVfaW50ZWdyYXRlX2JvZHlfZW5hYmxlIjtzOjI6Im9uIjtzOjI1OiJteXJlc3VtZV9pbnRlZ3JhdGlvbl9oZWFkIjtzOjA6IiI7czoyNToibXlyZXN1bWVfaW50ZWdyYXRpb25fYm9keSI7czowOiIiO30=';

	/*global $options;

	foreach ($options as $value) {
		if( isset( $value['id'] ) ) {
			update_option( $value['id'], $value['std'] );
		}
	}*/

	$importedOptions = unserialize(base64_decode($importOptions));

	foreach ($importedOptions as $key=>$value) {
		if ($value != '') update_option( $key, $value );
	}
} ?>