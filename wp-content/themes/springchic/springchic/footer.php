<?php
// Exit if accessed directly
if ( !defined('ABSPATH')) exit;

/**
 * Footer Template
 *
 * @file           footer.php
 * @package        SpringChic
 * @author         Color Splash Studio
 * @copyright      http://www.colorsplashstudio.com
 * @license        license.txt
 * @version        Release: 1.0
 * @since          available since Release 1.0
 */

?>	

		
				</div><!-- #content -->
				<div id="footer-wrapper" style="background-color:<?php echo get_theme_mod( 'footer_bg', '' ); ?>; border-color: <?php echo get_theme_mod( 'footer_topline', '#ffffff' ); ?>; color:<?php echo get_theme_mod( 'footer_text', '#ffffff' ); ?>;">
					<div class="container">
						<div class="row">						 
							<?php get_sidebar( 'footer' ); ?>							
						</div>			
					</div>
				</div>
	
			</div><!-- #content-wrapper -->
	
			<div id="page-footer-wrapper" style="color:<?php echo get_theme_mod( 'pagebottom_text', '#747474' ); ?>;" >
				<div class="container">
					<div class="row">
						<div class="span12">
							<div><?php wp_nav_menu( array( 'theme_location' => 'footer-menu', 'fallback_cb' => false, 'container' => false, 'menu_id' => 'st-footer-menu' ) ); ?></div>
							<div><?php esc_attr_e('Copyright &copy;', 'preference'); ?> <?php _e(date('Y')); ?> <?php bloginfo('name'); ?>	
						</div>
					</div>
				</div>
			</div>
		</div><!-- #centered-wrapper -->

		<script type="text/javascript">
			jQuery.noConflict();
		</script>
		<?php wp_footer(); ?>
	</body>
</html>