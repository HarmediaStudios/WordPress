		jQuery("a.gallery-item").next("br").remove();
		jQuery("a.gallery-item").mouseover(function(e) {
			jQuery("body").append("<img class='features-hover' src='"+jQuery(this).attr("rel")+"' alt='' />");
			jQuery("img.features-hover").css({display:"none", visibility:"visible"}).fadeIn(350);
			jQuery(this).children("a.gallery-item img").stop().animate({opacity: 0.5, top: "5px", left: "5px"}, "fast");
		}).mousemove(function(e) {
			jQuery("img.features-hover").css({left:e.pageX+-210, top:e.pageY-265});
		}).mouseout(function() {
			jQuery(this).children("a.gallery-item img").stop().animate({opacity: 1, top: "0", left: "0"}, "fast");
			jQuery("img.features-hover").remove();
		});
		jQuery(".connect-div a").mouseover(function() {
			jQuery(this).next(".connect-div span img.connect-bg").stop(true, true).animate({opacity: "show"}, "fast");
		}).mouseout(function() {
			jQuery(this).next(".connect-div span img.connect-bg").stop(true, true).animate({opacity: "hide"}, "fast");
		});
		jQuery('#header ul li a').click(function(){
			var thisClass = jQuery(this).attr("rel");
			jQuery("div.slide").stop(true, true).css('display', 'none');
			jQuery("."+thisClass).animate({opacity: "show", height: "show"}, "slow");
			jQuery('#header ul li.active').removeClass("active");
			jQuery(this).parent("li").addClass("active");
			return false;
		});
		jQuery("a.gallery-item").fancybox();