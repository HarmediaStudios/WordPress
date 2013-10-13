<?php global $shortname; ?>
	<script src="<?php echo get_template_directory_uri(); ?>/js/cufon-yui.js" type="text/javascript"></script>
	<script src="<?php echo get_template_directory_uri(); ?>/js/Chunk_Five_400.font.js" type="text/javascript"></script>
	<script src="<?php echo get_template_directory_uri(); ?>/js/Colaborate-Thin_400-Colaborate-Bold_400.font.js" type="text/javascript"></script>

	<script type="text/javascript" src="<?php echo get_template_directory_uri(); ?>/js/superfish.js"></script>
	<script type="text/javascript">
	//<![CDATA[
		jQuery.noConflict();

		jQuery(document).ready(function(){
			Cufon.set('fontFamily', 'Colaborate-Thin');
			Cufon.replace('p.meta-info,.commentmetadata, h3#comments,.post h1, .post h2, .post h3, .post h4, .post h5, .post h6')('#wp-custom-calendar caption',{textShadow:'1px 1px 0px #fff'})('span.featured-info');

			Cufon.set('fontFamily', 'Colaborate-Bold');
			Cufon.replace('p.meta-info a, span.featured-info span');

			Cufon.set('fontFamily', 'Chunk Five');

			Cufon.replace('h1.title')('h2.title')('h2.custom-title')('h3.custom-title')('h3.title')('h4.title')('#about h3.title',{textShadow:'1px 1px 1px #000', hover: { textShadow: '1px 1px 1px #000' }})('h4.widgettitle')('.footer-widget h4.widgettitle',{textShadow:'1px 1px 1px #28282b'})('#wp-custom-calendar thead th',{textShadow:'1px 1px 0px #d5a273'})('.wp-pagenavi a, .wp-pagenavi span.current', {textShadow:'1px 1px 1px rgba(0,0,0,0.5)'})('span.fn, span.featured-title')('.slide h2.slider-title',{textShadow:'1px 1px 1px rgba(0,0,0,0.5)'});

			Cufon.replace('.info-half, .info-full', {fontFamily: 'Colaborate-Bold'})('.infotitle', {fontFamily: 'Colaborate-Thin'});

			jQuery('ul.nav').superfish({
				delay:       300,                            // one second delay on mouseout
				animation:   {opacity:'show',height:'show'},  // fade-in and slide-down animation
				speed:       'fast',                          // faster animation speed
				autoArrows:  true,                           // disable generation of arrow mark-up
				dropShadows: false                            // disable drop shadows
			});

			jQuery('ul.nav > li > a.sf-with-ul').parent('li').addClass('sf-ul');

			var $featured_content = jQuery('#featured');

			et_search_bar();

			if ( $featured_content.length ) {
				et_service_tabs($featured_content);
				window.setInterval( function() { Cufon.refresh('span.featured-title'); }, 100 );
			}

			<!---- Search Bar Improvements ---->
			function et_search_bar(){
				var $searchform = jQuery('#header div#search-form'),
					$searchinput = $searchform.find("input#searchinput"),
					searchvalue = $searchinput.val();

				$searchinput.focus(function(){
					if (jQuery(this).val() === searchvalue) jQuery(this).val("");
				}).blur(function(){
					if (jQuery(this).val() === "") jQuery(this).val(searchvalue);
				});
			};

			<!---- Service Tabs ---->
			function et_service_tabs($service_tabs){
				var active_tabstate = 'active',
				active_tab = 0,
				$service_div = $service_tabs.find('div.slide').hide(),
				$service_li = $service_tabs.find('#featured-nav >ul>li');

				$service_div.filter(':first').show();
				$service_li.filter(':first').addClass(active_tabstate);

				$service_li.find('a').click(function(){
					var $a = jQuery(this),
						next_tab = $a.parent('li').prevAll().length,
						next_tab_height = $service_tabs.find('>div').eq(next_tab).outerHeight();

					if ( next_tab != active_tab ) {
						$service_tabs.css({height:next_tab_height});
						$service_div.filter(':visible')
							.animate( {opacity: 'hide'},500, function(){
								jQuery(this).parent().find('>div').eq(next_tab).animate( {opacity: 'show'},500 );
							} );
						$service_li.removeClass(active_tabstate).filter(':eq('+next_tab+')').addClass(active_tabstate);
						active_tab = next_tab;
					}

					return false;
				}).hover(function(){
					if ( !jQuery(this).parent('li').hasClass(active_tabstate) && !is_ie ) jQuery(this).fadeTo('slow',.7);
				}, function(){
					if (!is_ie) jQuery(this).fadeTo('slow',1);
				});
			}

			var $et_custom_calendar = jQuery('#et_custom_calendar'),
				$et_custom_calendar_links = $et_custom_calendar.find('#wp-custom-calendar a');

			$et_custom_calendar_links.live("click", function(){
				$href = jQuery(this).attr('href');
				var $et_event_info = jQuery('.event_post')
				$et_event_info.fadeTo('slow',0);
				$et_custom_calendar
				.load($href+' #et_custom_calendar', function() {
					Cufon.set('fontFamily', 'Colaborate-Thin');
					Cufon.replace('#wp-custom-calendar caption',{textShadow:'1px 1px 0px #fff'});

					Cufon.set('fontFamily', 'Chunk Five');
					Cufon.replace('#wp-custom-calendar thead th',{textShadow:'1px 1px 0px #d5a273'})('.event_post h2.title');
				});
				return false;
			});

			var $et_daywithposts = jQuery('td.dwp');

			$et_daywithposts.live('mouseenter', function(e){
				jQuery(this).find('span.et_popup').css({'bottom':'42px'}).stop(true, true).animate({bottom:"32px", opacity:'show'},200);
			});

			$et_daywithposts.live('mouseleave', function(e){
				jQuery(this).find('span.et_popup').stop(true, true).animate({bottom:"42px", opacity:'hide'},200);
			});

			<?php if (get_option($shortname.'_disable_toptier') == 'on') echo('jQuery("ul.nav > li > ul").prev("a").attr("href","#");'); ?>

			Cufon.now();
		});
	//]]>
	</script>