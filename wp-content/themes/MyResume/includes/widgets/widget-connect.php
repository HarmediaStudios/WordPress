<?php class ConnectWidget extends WP_Widget
{
    function ConnectWidget(){
		$widget_ops = array('description' => 'Input social media outlets');
		$control_ops = array('width' => 400, 'height' => 300);
		parent::WP_Widget(false,$name='ET Connect Widget',$widget_ops,$control_ops);
    }

  /* Displays the Widget in the front-end */
    function widget($args, $instance){
		extract($args);
		$imagePath = empty($instance['imagePath']) ? '' : esc_attr($instance['imagePath']);
		$URL = empty($instance['URL']) ? '' : esc_url($instance['URL']);
		$ConnectTitle = empty($instance['aboutText']) ? '' : $instance['aboutText'];
?>

                                    <span>
                                        <a href="<?php echo esc_url($URL); ?>" style="background: url(<?php echo esc_url($imagePath); ?>) no-repeat 13px 13px;"><?php echo esc_html($ConnectTitle)?></a>
                                        <img src="<?php echo get_template_directory_uri(); ?>/images/connect-bg.gif" class="connect-bg" alt="" />
                                    </span>

<?php
	}

  /*Saves the settings. */
    function update($new_instance, $old_instance){
		$instance = $old_instance;
		$instance['imagePath'] = sanitize_text_field($new_instance['imagePath']);
		$instance['URL'] = esc_url_raw($new_instance['URL']);
		$instance['aboutText'] = stripslashes($new_instance['aboutText']);

		return $instance;
	}

  /*Creates the form for the widget in the back-end. */
    function form($instance){
		//Defaults
		$imagePath = $instance['imagePath'];
		$URL = $instance['URL'];
		$ConnectTitle = $instance['aboutText'];

		# Image
		echo '<p><label for="' . $this->get_field_id('imagePath') . '">' . 'Image:' . '</label><textarea cols="20" rows="2" class="widefat" id="' . $this->get_field_id('imagePath') . '" name="' . $this->get_field_name('imagePath') . '" >'. esc_url($imagePath) .'</textarea></p>';

		# URL
		echo '<p><label for="' . $this->get_field_id('URL') . '">' . 'URL:' . '</label><textarea cols="20" rows="2" class="widefat" id="' . $this->get_field_id('URL') . '" name="' . $this->get_field_name('URL') . '" >'. esc_textarea($URL) .'</textarea></p>';

		# Connect Title
		echo '<p><label for="' . $this->get_field_id('aboutText') . '">' . 'Text:' . '</label><textarea cols="20" rows="5" class="widefat" id="' . $this->get_field_id('aboutText') . '" name="' . $this->get_field_name('aboutText') . '" >'. esc_textarea($ConnectTitle) .'</textarea></p>';
	}

}// end Connect Widget class

function ConnectWidgetInit() {
  register_widget('ConnectWidget');
}

add_action('widgets_init', 'ConnectWidgetInit');