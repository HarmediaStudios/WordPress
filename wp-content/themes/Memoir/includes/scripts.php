<?php global $shortname; ?>
	<script src="<?php echo get_template_directory_uri(); ?>/js/cufon-yui.js" type="text/javascript"></script>
	<script src="<?php echo get_template_directory_uri(); ?>/js/Goudy_Bookletter_1911_400.font.js" type="text/javascript"></script>
	<script type="text/javascript">
		Cufon.replace('ul#top-menu a',{textShadow:'1px 1px 1px #000000', hover:true})('h1, h2, h3, h4, h5, h6, span.fn',{textShadow:'1px 1px 1px #fff'})('.widget h3.widgettitle',{textShadow:'1px 1px 1px #fff'});
	</script>

	<script type="text/javascript" src="<?php echo get_template_directory_uri(); ?>/js/superfish.js"></script>

	<script type="text/javascript">
	//<![CDATA[
		jQuery.noConflict();

		jQuery(document).ready(function(){
			jQuery('ul.nav').superfish({
				delay:       300,                            // one second delay on mouseout
				animation:   {opacity:'show'},  // fade-in and slide-down animation
				speed:       'fast',                          // faster animation speed
				autoArrows:  true,                           // disable generation of arrow mark-up
				dropShadows: false                            // disable drop shadows
			}).find('li ul').prepend('<span class="dropdown-top"></span>');

			jQuery('ul.nav li a strong.sf-with-ul').parent('a').parent('li').addClass('sf-ul');

			et_search_bar();

			<!---- Search Bar Improvements ---->
			function et_search_bar(){
				var $searchform = jQuery('div#search-form'),
					$searchinput = $searchform.find("input#searchinput"),
					searchvalue = $searchinput.val();

				$searchinput.focus(function(){
					if (jQuery(this).val() === searchvalue) jQuery(this).val("");
				}).blur(function(){
					if (jQuery(this).val() === "") jQuery(this).val(searchvalue);
				});
			};

			var $post_info = jQuery("div.meta-info");
			if ($post_info.length) {
				$post_info.each(function (index, domEle) {
					var post_meta_width = jQuery(domEle).width(),
						post_meta_height = jQuery(domEle).height();

					if ( post_meta_height > 34 && !jQuery.browser.msie ) {
						jQuery(domEle).find('.postinfo').css('margin-top', -30 - post_meta_height );
						jQuery(domEle).css('margin-top',70);
					}

					if ( post_meta_width < 460 ) {
						var new_width = (464 - post_meta_width) / 2;
						jQuery(domEle).css('margin-left',new_width);
					}
				});
			}

			var $comment_form = jQuery('form#commentform');


			$comment_form.find('input:text, textarea').each(function(index,domEle){
				var $et_current_input = jQuery(domEle),
					$et_comment_label = $et_current_input.siblings('label'),
					et_comment_label_value = $et_current_input.siblings('label').text();
				if ( $et_comment_label.length ) {
					$et_comment_label.hide();
					if ( $et_current_input.siblings('span.required') ) {
						et_comment_label_value += $et_current_input.siblings('span.required').text();
						$et_current_input.siblings('span.required').hide();
					}
					$et_current_input.val(et_comment_label_value);
				}
			}).live('focus',function(){
				var et_label_text = jQuery(this).siblings('label').text();
				if ( jQuery(this).siblings('span.required').length ) et_label_text += jQuery(this).siblings('span.required').text();
				if (jQuery(this).val() === et_label_text) jQuery(this).val("");
			}).live('blur',function(){
				var et_label_text = jQuery(this).siblings('label').text();
				if ( jQuery(this).siblings('span.required').length ) et_label_text += jQuery(this).siblings('span.required').text();
				if (jQuery(this).val() === "") jQuery(this).val( et_label_text );
			});

			// remove placeholder text before form submission
			$comment_form.submit(function(){
				$comment_form.find('input:text, textarea').each(function(index,domEle){
					var $et_current_input = jQuery(domEle),
						$et_comment_label = $et_current_input.siblings('label'),
						et_comment_label_value = $et_current_input.siblings('label').text();

					if ( $et_comment_label.length && $et_comment_label.is(':hidden') ) {
						if ( $et_comment_label.text() == $et_current_input.val() )
							$et_current_input.val( '' );
					}
				});
			});

			<?php if (get_option($shortname.'_disable_toptier') == 'on') echo('jQuery("ul.nav > li > ul").prev("a").attr("href","#");'); ?>

			Cufon.now();
		});
	//]]>
	</script>