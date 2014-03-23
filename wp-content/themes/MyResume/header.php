<?php global $shortname; ?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" <?php language_attributes(); ?>>
<head profile="http://gmpg.org/xfn/11">
<meta http-equiv="Content-Type" content="<?php bloginfo('html_type'); ?>; charset=<?php bloginfo('charset'); ?>" />
<title><?php elegant_titles(); ?></title>
<?php elegant_description(); ?>
<?php elegant_keywords(); ?>
<?php elegant_canonical(); ?>

<link rel="stylesheet" href="<?php bloginfo('stylesheet_url'); ?>" type="text/css" media="screen" />
<link rel="pingback" href="<?php bloginfo('pingback_url'); ?>" />

<!--[if lt IE 7]>
	<link rel="stylesheet" type="text/css" href="<?php echo get_template_directory_uri(); ?>/css/ie6style.css" />
	<script type="text/javascript" src="<?php echo get_template_directory_uri(); ?>/js/DD_belatedPNG_0.0.8a-min.js"></script>
	<script type="text/javascript">DD_belatedPNG.fix('img.overlay, div#content-bg-bottom');</script>
<![endif]-->

<?php wp_head(); ?>

</head>
<body <?php body_class(); ?>>

<div id="wrapper">
	<div id="content">
		<div id="content-bg-bottom">
			<div id="header">
				<ul>
					<li class="active"><a href="#" rel="resume">resume</a></li>
				<?php
					$et_featured_pages_args = array(
						'post_type' => 'page',
						'orderby' => get_option('myresume_nav_sort_pages'),
						'order' => get_option('myresume_nav_order_page'),
					);

					if ( is_array( et_get_option( 'myresume_nav_exclude_pages', '', 'page' ) ) )
						$et_featured_pages_args['post__not_in'] = (array) array_map( 'intval', et_get_option( 'myresume_nav_exclude_pages', '', 'page' ) );

					query_posts( $et_featured_pages_args );
				?>
					<?php if (have_posts()) : while (have_posts()) : the_post()?>
					<li><a href="#" rel="<?php echo esc_attr($post->post_name) ?>"><?php the_title() ?></a></li>
					<?php endwhile; endif; wp_reset_query(); ?>
				</ul>
				<br class="clear" />
				<div id="logo">
					<img class="avatar" alt="" src="<?php echo esc_attr( et_new_thumb_resize( et_multisite_thumbnail(get_option('myresume_avatar')), 79, 79, '', true ) ); ?>" />
					<?php $logo = (get_option('myresume_logo') <> '') ? get_option('myresume_logo') : get_template_directory_uri().'/images/logo.gif'; ?>
					<img src="<?php echo esc_attr($logo); ?>" alt="<?php echo esc_attr(get_bloginfo('name')); ?>" class="logo"/>


					<img class="overlay" src="<?php echo get_template_directory_uri(); ?>/images/photo-overlay.png" alt="" />
					<span>
						<br />
						<?php echo(get_option('myresume_email')) ?>
						<br />
						<?php echo esc_html(get_option('myresume_phone')) ?>
					</span>
				</div>
			</div>
			<div id="inside">
				<div id="inside-bg-top">
					<div id="inside-bg-bottom">
						<div class="resume slide">