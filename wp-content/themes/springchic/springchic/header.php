<?php
// Exit if accessed directly
if ( !defined('ABSPATH')) exit;

/**
 * Main Header template
 *
 * @file           header.php
 * @package        SpringChic
 * @author         Color Splash Studio
 * @copyright      http://www.colorsplashstudio.com
 * @license        license.txt
 * @version        Release: 1.0
 * @since          available since Release 1.0
 */
?>
<!DOCTYPE html>
<!--[if IE 7]>
<html class="ie ie7" <?php language_attributes(); ?>>
<![endif]-->
<!--[if IE 8]>
<html class="ie ie8" <?php language_attributes(); ?>>
<![endif]-->
<!--[if !(IE 7) | !(IE 8)  ]><!-->
<html <?php language_attributes(); ?>>
<!--<![endif]-->
<head>
<meta charset="<?php bloginfo( 'charset' ); ?>" />
<meta name="viewport" content="width=device-width" />
<title><?php wp_title( '|', true, 'right' ); ?></title>
<link rel="profile" href="http://gmpg.org/xfn/11" />
<link rel="pingback" href="<?php bloginfo( 'pingback_url' ); ?>" />
<?php wp_head(); ?>
</head>

<body <?php body_class(); ?>>
	<div id="page-top-bg" style="border-top-color: <?php echo get_theme_mod( 'page_top_border', '' ); ?>; border-bottom-color: <?php echo get_theme_mod( 'tophalf_botline', '' ); ?>; background-color:<?php echo get_theme_mod( 'tophalf_bg', '#ffffff' ); ?>;"></div>
		<div id="centered-wrapper">
	
			<div id="logo-wrapper">			
			<?php 
			$logostyle = get_theme_mod( 'logo_style', 'text' );
			 switch ($logostyle) {
				case "default" : // default theme logo ?>
						<div id="logo">
							<a href="<?php echo esc_url( home_url( '/' ) ); ?>" title="<?php echo esc_attr( get_bloginfo( 'name', 'display' ) ); ?>" rel="home">
								<img src="<?php echo get_template_directory_uri() ; ?>/images/logo-demo.png" alt="<?php bloginfo( 'name' ); ?>" />
							</a>
						</div>	 
				<?php break;
				case "custom" : // your own logo ?>
					<?php if ( get_option('my_logo') ) : ?>
						<a href="<?php echo esc_url( home_url( '/' ) ); ?>" title="<?php echo esc_attr( get_bloginfo( 'name', 'display' ) ); ?>" rel="home">
							<img src="<?php echo get_option( 'my_logo' ); ?> "/>
						</a>
					<?php endif; ?>			 
				<?php break;
				case "text" : // text based title and site description ?>
					<hgroup>
						<h1 id="site-title">
							<a href="<?php echo esc_url( home_url( '/' ) ); ?>" title="<?php echo esc_attr( get_bloginfo( 'name', 'display' ) ); ?>" rel="home">
								<span><?php bloginfo( 'name' ); ?></span>
							</a>
						</h1>
						<h2 id="site-description"><?php bloginfo( 'description' ); ?></h2>
					</hgroup>			
				<?php break;
				} 
			?>												
			</div>
		
			<div id="content-wrapper" style="background-color:<?php echo get_theme_mod( 'content_bg', '' ); ?>; border-color: <?php echo get_theme_mod( 'page_top_border', '#595A67' ); ?>;">			
				<div id="nav-wrapper" style="background-color:<?php echo get_theme_mod( 'mainmenu_bg', '' ); ?>;">
					<div class="container">
						<div class="row">
							<div class="span12">
								<div class="navbar">
									
									<div class="container">								 
										<!-- .btn-navbar is used as the toggle for collapsed navbar content -->											
										<a class="btn btn-navbar" data-toggle="collapse" data-target=".nav-collapse">
											<span>Menu</span>
										</a>										
										<!-- Everything you want hidden at 940px or less, place within here -->
										<div class="nav-collapse">
											<!-- .nav, .navbar-search, .navbar-form, etc -->
											<nav  id="gj-menu" class="mainmenu">
												<?php wp_nav_menu( array( '
												theme_location' => 'primary-menu', 
												'container' => false,
												'menu_class' => 'menu', 	
												'fallback_cb' => 'wp_page_menu',
												) ); ?>
											</nav>
										</div>							 
									</div><!-- .container -->
									
								</div><!-- .navbar -->						
							</div>
						</div>
					</div>
					
				</div>			
			
				
				
				<div id="content" style="border-color: <?php echo get_theme_mod( 'content_botline', '' ); ?>; color:<?php echo get_theme_mod( 'content_text', '' ); ?>;">

					<div class="container">
						<aside class="row">
							<div id="cta">
								
							</div>
						</aside>
					</div><!-- .container -->