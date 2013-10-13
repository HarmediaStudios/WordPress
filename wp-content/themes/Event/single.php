<?php get_header(); ?>

	<?php get_template_part('includes/breadcrumbs'); ?>

	<div id="left-area">
	<?php if ( have_posts() ) : while ( have_posts() ) : the_post(); ?>
		<div class="big-box">
			<div class="big-box-top">
				<div class="big-box-content">
					<div class="post clearfix single">
						<?php
							$et_event_settings = get_post_meta(get_the_ID(),'et_event_settings',true) ? maybe_unserialize( get_post_meta(get_the_ID(),'et_event_settings',true) ) : '' ;
						?>
						<?php if (get_option('event_thumbnails') == 'on') { ?>
							<?php
								$thumb = '';
								$width = 188;
								$height = 188;
								$classtext = 'post-thumb';
								$titletext = get_the_title();

								$thumbnail = get_thumbnail($width,$height,$classtext,$titletext,$titletext,false,'Entry');
								$thumb = $thumbnail["thumb"];
							?>
							<?php if($thumb <> '') { ?>
								<div class="post-thumbnail">
									<?php print_thumbnail($thumb, $thumbnail["use_timthumb"], $titletext, $width, $height, $classtext); ?>
									<span class="post-overlay"></span>
									<?php if ( isset( $et_event_settings['et_event_sold_out'] ) && $et_event_settings['et_event_sold_out'] ) { ?>
										<span class="sold-out"></span>
									<?php } ?>
								</div> 	<!-- end .post-thumbnail -->
							<?php } ?>
						<?php } ?>

						<?php if (get_option('event_integration_single_top') <> '' && get_option('event_integrate_singletop_enable') == 'on') echo(get_option('event_integration_single_top')); ?>

						<?php
							$blogcat = (int) get_catId(get_option('event_blog_cat'));
							$isBlogPage = false;
							$post_categories = get_the_category();
							foreach ($post_categories as $category) {
								if (in_subcat($blogcat, $category->cat_ID)) $isBlogPage = true;
							}
						?>

					<?php if (!$isBlogPage) { ?>
						<div class="post-panel">
					<?php } ?>
							<h1 class="title"><?php the_title(); ?></h1>
							<?php if ($isBlogPage) { ?>
								<?php get_template_part('includes/postinfo'); ?>
							<?php } ?>
					<?php if (!$isBlogPage) { ?>
							<div id="infopanel">
								<!--<div id="info-bar">
									<span class="info-half"><span class="infotitle"><?php esc_html_e('Date','Event'); ?>:</span><?php the_time(get_option('event_date_format')) ?></span>
									<span class="info-half"><span class="infotitle"><?php esc_html_e('Ages','Event'); ?>:</span><?php echo esc_html($et_event_settings['et_event_ages']); ?></span>
									<span class="info-half"><span class="infotitle"><?php esc_html_e('Price','Event'); ?>:</span><?php echo esc_html($et_event_settings['et_event_price']); ?></span>
									<span class="info-half"><span class="infotitle"><?php esc_html_e('Type','Event'); ?>:</span><?php echo esc_html($et_event_settings['et_event_type']); ?></span>
									<span class="info-full"><span class="infotitle"><?php esc_html_e('Location','Event'); ?>:</span><?php echo esc_html($et_event_settings['et_event_location']); ?></span>
								</div> --><!-- end #info-bar -->
								<?php if ( $et_event_settings['et_event_bookings'] <> '' ) { ?>
									<a href="<?php echo esc_url($et_event_settings['et_event_bookings']); ?>" class="bookings"><span><?php esc_html_e('Bookings','Event');?></span></a>
								<?php } ?>
							</div> <!-- end #infopanel -->
						</div> <!-- end .post-panel -->

						<div class="clear"></div>
					<?php } ?>
						<?php the_content(); ?>
						<?php wp_link_pages(array('before' => '<p><strong>'.esc_html__('Pages','Event').':</strong> ', 'after' => '</p>', 'next_or_number' => 'number')); ?>
						<?php edit_post_link(esc_html__('Edit this page','Event')); ?>
					</div> 	<!-- end .post-->
				</div> 	<!-- end .big-box-content-->
			</div> 	<!-- end .big-box-top-->
		</div> 	<!-- end .big-box-->

		<?php if ( isset( $et_event_settings['et_event_show_gmap'] ) && $et_event_settings['et_event_show_gmap'] && !$isBlogPage ) { ?>
			<div class="venue">
				<div class="big-box">
					<div class="big-box-top">
						<div class="big-box-content">
							<div class="post">
								<div id="gmaps-container"></div>
							</div> 	<!-- end .post -->
						</div> 	<!-- end .big-box-content-->
					</div> 	<!-- end .big-box-top-->
				</div> 	<!-- end .big-box-->
			</div> <!-- end .venue -->

			<script type="text/javascript" src="http://maps.google.com/maps/api/js?v=3.1&sensor=true"></script>
			<script type="text/javascript">
			  //<![CDATA[
			  var map;
			  var geocoder;

			  initialize();

			  function initialize() {
				 geocoder = new google.maps.Geocoder();
				 geocoder.geocode({
					'address': '<?php echo esc_js($et_event_settings['et_event_location']); ?>',
					'partialmatch': true}, geocodeResult);
			  }

			  function geocodeResult(results, status) {

				 if (status == 'OK' && results.length > 0) {
					var latlng = new google.maps.LatLng(results[0].geometry.location.b,results[0].geometry.location.c);
				var myOptions = {
				   zoom: 10,
				   center: results[0].geometry.location,
				   mapTypeId: google.maps.MapTypeId.ROADMAP
				};

				map = new google.maps.Map(document.getElementById("gmaps-container"), myOptions);
				   var marker = new google.maps.Marker({
				   position: results[0].geometry.location,
				   map: map,
				   title:"<?php echo esc_js( get_the_title() ); ?>"
				});

					var contentString = '<div id="content">'+
					'<h3 id="firstHeading" class="firstHeading" style="padding-bottom: 15px;">'+marker.title+'</h3>'+
					'<div id="bodyContent">'+
					'<p><a target="_blank" href="http://maps.google.com/maps?f=q&amp;source=s_q&amp;hl=en&amp;geocode=&amp;q='+escape(results[0].formatted_address)+'&amp;ie=UTF8&amp;view=map">'+results[0].formatted_address+'</a>'+
					'</p>'+
					'</div>'+
					'</div>';
					//&amp;sll=29.67226,-94.873971

					var infowindow = new google.maps.InfoWindow({
					   content: contentString,
					   maxWidth: 300
					});

					google.maps.event.addListener(marker, 'click', function() {
					   infowindow.open(map,marker);
					});

					google.maps.event.trigger(marker, "click");

				 } else {
					//alert("Geocode was not successful for the following reason: " + status);
				 }
			  }
			  //]]>
			</script>
		<?php } ?>

		<?php if (get_option('event_integration_single_bottom') <> '' && get_option('event_integrate_singlebottom_enable') == 'on') echo(get_option('event_integration_single_bottom')); ?>

		<?php if (get_option('event_468_enable') == 'on') { ?>
				  <?php if(get_option('event_468_adsense') <> '') echo(get_option('event_468_adsense'));
				else { ?>
				   <a href="<?php echo esc_url(get_option('event_468_url')); ?>"><img src="<?php echo esc_url(get_option('event_468_image')); ?>" alt="468 ad" class="foursixeight" /></a>
		   <?php } ?>
		<?php } ?>

		<?php if (get_option('event_show_postcomments') == 'on') comments_template('', true); ?>
	<?php endwhile; endif; ?>
	</div> 	<!-- end #left-area -->

	<?php get_sidebar(); ?>

<?php get_footer(); ?>