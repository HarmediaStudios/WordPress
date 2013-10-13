				</div> <!-- end .container -->
			</div> <!-- end #main-area -->

			<div id="footer">
				<div class="container clearfix">
					<?php if ( !function_exists('dynamic_sidebar') || !dynamic_sidebar('Footer') ) : ?>
					<?php endif; ?>
				</div> <!-- end .container -->
			</div> <!-- end #footer -->

			<div id="footer-bottom">
				<div class="container clearfix">
					<?php $menuClass = 'bottom-nav';
					$footerNav = '';

					if (function_exists('wp_nav_menu')) $footerNav = wp_nav_menu( array( 'theme_location' => 'footer-menu', 'container' => '', 'fallback_cb' => '', 'menu_class' => $menuClass, 'echo' => false, 'depth' => '1' ) );
					if ($footerNav == '') show_page_menu($menuClass);
					else echo($footerNav); ?>

					<p id="copyright"><?php esc_html_e('Designed by ','Event'); ?> <a href="http://www.elegantthemes.com" title="Premium WordPress Themes">Elegant WordPress Themes</a> | <?php esc_html_e('Powered by ','Event'); ?> <a href="http://www.wordpress.org">WordPress</a></p>
				</div> <!-- end .container -->
			</div> <!-- end #footer-bottom -->
		</div> <!-- end #center-highlight-->
	</div> <!-- end #main-bg -->

	<?php get_template_part('includes/scripts'); ?>
	<?php wp_footer(); ?>

</body>
</html>