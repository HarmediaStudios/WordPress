<div id="featured" class="clearfix">

	<?php
	$arr = array();
	$i=1;

	$width = 705;
	$height = 382;

	$featured_cat = get_option('event_feat_cat');
	$featured_num = (int) get_option('event_featured_num');

	if (get_option('event_use_pages') == 'false') {
		query_posts("posts_per_page=$featured_num&cat=".get_catId($featured_cat));
	} else {
		global $pages_number;

		if ($featured_num > 5) $featured_num = 5;

		$et_featured_pages_args = array(
			'post_type' => 'event',
			'orderby' => 'menu_order',
			'order' => 'ASC',
			'posts_per_page' => (int) $featured_num,
		);

		if ( is_array( et_get_option( 'event_feat_pages', '', 'event' ) ) ) {
			$et_featured_pages_args['post__in'] = (array) array_map( 'intval', et_get_option( 'event_feat_pages', '', 'event' ) );
		}

		$query = new WP_Query( $et_featured_pages_args );
	}
	foreach ($query->posts as $key => $post) {
		$et_event_settings = maybe_unserialize( get_post_meta($post->ID,'et_event_settings',true) );

		$arr[$i]["title"] = truncate_title(15,false);
		$arr[$i]["fulltitle"] = truncate_title(250,false);

		$arr[$i]["excerpt"] = truncate_post(850,false);

		$arr[$i]["permalink"] = get_permalink();
		$et_event_location = isset( $et_event_settings['et_event_location'] ) ? esc_html($et_event_settings['et_event_location']) : '';
		$arr[$i]["postinfo"] = get_the_time(get_option('event_date_format')) . ' <span>' . $et_event_location . '</span>';

		$arr[$i]["thumbnail"] = get_thumbnail($width,$height,'',$arr[$i]["fulltitle"],$arr[$i]["fulltitle"],false,'Slider');
		$arr[$i]["thumb"] = $arr[$i]["thumbnail"]["thumb"];
		$arr[$i]["use_timthumb"] = $arr[$i]["thumbnail"]["use_timthumb"];

		$arr[$i]['post_id'] = (int) get_the_ID();

		$i++;
	}
	//wp_reset_query();	
	?>

	<div id="featured-nav">
		<ul>
			<?php
			for ($i = 1; $i <= $featured_num; $i++) { ?>
				<li>
					<a href="#">
						<span class="featured-title"><?php echo htmlspecialchars_decode($arr[$i]["title"]); ?></span>
						<span class="featured-info"><?php echo $arr[$i]["postinfo"]; ?></span>
					</a>
				</li>
			<?php } ?>
		</ul>
	</div> <!-- end #featured-nav -->

	<div id="slides">
		<?php for ($i = 1; $i <= $featured_num; $i++) { ?>
			<div class="slide" style="background: url(<?php print_thumbnail( array(
	'thumbnail' 	=> $arr[$i]["thumbnail"]["thumb"],
	'use_timthumb' 	=> $arr[$i]["thumbnail"]["use_timthumb"],
	'alttext'		=> $arr[$i]["fulltitle"],
	'width'			=> (int) $width,
	'height'		=> (int) $height,
	'echoout'		=> true,
	'forstyle'		=> true,
	'et_post_id'	=> $arr[$i]['post_id'],
) ); ?>) no-repeat;">
				<div class="info-overlay">
					<h2 class="slider-title"><a href="<?php echo esc_url($arr[$i]["permalink"]); ?>"><?php echo esc_html($arr[$i]["fulltitle"]); ?></a></h2>
					<p><?php echo $arr[$i]["excerpt"]; ?></p>
					<a href="<?php echo esc_url($arr[$i]["permalink"]); ?>" class="readmore"><span><?php esc_html_e('More Info','Event'); ?></span></a>
				</div> <!-- end .info-overlay -->
			</div> <!-- end .slide -->
		<?php } ?>
	</div> <!-- end #slides -->
</div> <!-- end #featured -->