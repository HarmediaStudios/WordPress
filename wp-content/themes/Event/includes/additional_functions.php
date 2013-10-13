<?php

/* Meta boxes */

function event_settings(){
	add_meta_box("et_post_meta", "ET Settings", "et_event_options", "post", "normal", "high");
}
add_action("admin_init", "event_settings");

function et_event_options() {
	global $post;

	$temp_array = array();

	$temp_array = get_post_meta($post->ID,'et_event_settings',true) ? maybe_unserialize(get_post_meta($post->ID,'et_event_settings',true)) : '';

	$et_event_bookings = isset( $temp_array['et_event_bookings'] ) ? $temp_array['et_event_bookings'] : '';
	$et_event_ages = isset( $temp_array['et_event_ages'] ) ? $temp_array['et_event_ages'] : '';
	$et_event_price = isset( $temp_array['et_event_price'] ) ? $temp_array['et_event_price'] : '';
	$et_event_type = isset( $temp_array['et_event_type'] ) ? $temp_array['et_event_type'] : '';
	$et_event_location = isset( $temp_array['et_event_location'] ) ? $temp_array['et_event_location'] : '';
	$et_event_show_gmap = isset( $temp_array['et_event_show_gmap'] ) ? (bool) $temp_array['et_event_show_gmap'] : false;
	$et_event_sold_out = isset( $temp_array['et_event_sold_out'] ) ? (bool) $temp_array['et_event_sold_out'] : false;

	wp_nonce_field( basename( __FILE__ ), 'et_settings_nonce' );
?>

	<div id="et_custom_settings" style="margin: 13px 0 17px 4px;">
		<label class="selectit" for="et_event_show_gmap" style="font-weight: bold;">
			<input type="checkbox" name="et_event_show_gmap" id="et_event_show_gmap" value=""<?php checked( $et_event_show_gmap ); ?> /> Show Google Map</label><br/><br/>
		<label class="selectit" for="et_event_sold_out" style="font-weight: bold;">
			<input type="checkbox" name="et_event_sold_out" id="et_event_sold_out" value=""<?php checked( $et_event_sold_out ); ?> /> Sold Out</label><br/>

		<div id="et_settings_featured_options" style="margin-top: 12px;">
			<div class="et_fs_setting" style="margin: 13px 0 26px 4px;">
				<label for="et_event_ages" style="color: #000; font-weight: bold;"> Ages: </label>
				<input type="text" style="width: 30em;" value="<?php echo esc_attr($et_event_ages); ?>" id="et_event_ages" name="et_event_ages" size="67" />
				<br />
				<small style="position: relative; top: 8px;">ex: <code>21+</code></small>
			</div>

			<div class="et_fs_setting" style="margin: 13px 0 26px 4px;">
				<label for="et_event_price" style="color: #000; font-weight: bold;"> Price: </label>
				<input type="text" style="width: 30em;" value="<?php echo esc_attr($et_event_price); ?>" id="et_event_price" name="et_event_price" size="67" />
				<br />
				<small style="position: relative; top: 8px;">ex: <code>$39</code></small>
			</div>

			<div class="et_fs_setting" style="margin: 13px 0 26px 4px;">
				<label for="et_event_type" style="color: #000; font-weight: bold;"> Type: </label>
				<input type="text" style="width: 30em;" value="<?php echo esc_attr($et_event_type); ?>" id="et_event_type" name="et_event_type" size="67" />
				<br />
				<small style="position: relative; top: 8px;">ex: <code>Rock And Roll</code></small>
			</div>

			<div class="et_fs_setting" style="margin: 13px 0 26px 4px;">
				<label for="et_event_location" style="color: #000; font-weight: bold;"> Location: </label>
				<input type="text" style="width: 30em;" value="<?php echo esc_attr($et_event_location); ?>" id="et_event_location" name="et_event_location" size="67" />
				<br />
				<small style="position: relative; top: 8px;">ex: <code>1232 SUNNY ST, SAN FRANCISCO CA</code></small>
			</div>

			<div class="et_fs_setting" style="margin: 13px 0 26px 4px;">
				<label for="et_event_bookings" style="color: #000; font-weight: bold;"> Bookings Url: </label>
				<input type="text" style="width: 30em;" value="<?php echo esc_url($et_event_bookings); ?>" id="et_event_bookings" name="et_event_bookings" size="67" />
				<br />
				<small style="position: relative; top: 8px;">ex: <code>http://myevent.com</code></small>
			</div>
		</div> <!-- #et_settings_featured_options -->
	</div> <!-- #et_custom_settings -->

	<?php
}

add_action( 'save_post', 'event_save_details', 10, 2 );
function event_save_details( $post_id, $post ){
	global $pagenow;

	if ($post->post_type == 'event') {
		if ( 'post.php' != $pagenow ) return $post_id;

		if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE )
			return $post_id;

		$post_type = get_post_type_object( $post->post_type );
		if ( ! current_user_can( $post_type->cap->edit_post, $post_id ) )
			return $post_id;

		if ( !isset( $_POST['et_settings_nonce'] ) || ! wp_verify_nonce( $_POST['et_settings_nonce'], basename( __FILE__ ) ) )
	        return $post_id;

		$temp_array = array();

		$temp_array['et_event_show_gmap'] = isset( $_POST["et_event_show_gmap"] ) ? 1 : 0;
		$temp_array['et_event_sold_out'] = isset( $_POST["et_event_sold_out"] ) ? 1 : 0;
		$temp_array['et_event_ages'] = isset($_POST["et_event_ages"]) ? sanitize_text_field($_POST["et_event_ages"]) : '';
		$temp_array['et_event_price'] = isset($_POST["et_event_price"]) ? sanitize_text_field($_POST["et_event_price"]) : '';
		$temp_array['et_event_type'] = isset($_POST["et_event_type"]) ? sanitize_text_field($_POST["et_event_type"]) : '';
		$temp_array['et_event_location'] = isset($_POST["et_event_location"]) ? sanitize_text_field($_POST["et_event_location"]) : '';
		$temp_array['et_event_bookings'] = isset($_POST["et_event_bookings"]) ? esc_url_raw($_POST["et_event_bookings"]) : '';

		update_post_meta( $post_id, "et_event_settings", $temp_array );
	}
}