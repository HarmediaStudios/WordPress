<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">

<html xmlns="http://www.w3.org/1999/xhtml" <?php language_attributes(); ?>>

<head profile="http://gmpg.org/xfn/11">



<!-- title -->

<title><?php the_title('', ' @'); ?> <?php bloginfo('name'); ?></title>



<!-- meta -->

<meta http-equiv="Content-Type" content="<?php bloginfo('html_type'); ?>; charset=<?php bloginfo('charset'); ?>" />



<!-- css -->

<link rel="stylesheet" href="<?php bloginfo('stylesheet_url'); ?>" type="text/css" media="screen" />



<!-- favicon -->

<link rel="shortcut icon" href="<?php bloginfo('template_url'); ?>/images/favicon.ico" />



<!-- wordpress -->

<?php wp_head(); ?>



<!-- feeds -->

<link rel="alternate" type="application/rss+xml" title="<?php bloginfo('name'); ?> RSS Feed" href="<?php bloginfo('rss2_url'); ?>" />

<link rel="alternate" type="application/atom+xml" title="<?php bloginfo('name'); ?> Atom Feed" href="<?php bloginfo('atom_url'); ?>" />

<link rel="pingback" href="<?php bloginfo('pingback_url'); ?>" />



<!-- javascript -->

<script type="text/javascript" src="<?php echo get_option('template_directory'); ?>/js/util-functions.js"></script>

<script type="text/javascript" src="<?php echo get_option('template_directory'); ?>/js/clear-default-text.js"></script> 



<?php if ( is_singular() ) wp_enqueue_script( 'comment-reply' ); ?>



</head>



<body>



<!-- container -->

<div id="container">



<!-- page header -->

<div id="header">



	<!-- Blog Title -->

	<span id="b-title"><a href="<?php echo get_option('home'); ?>/" title="Back Home"><?php bloginfo('name'); ?></a></span> - <?php bloginfo('description'); ?>



	<!-- menu -->

	<ul id="menu">

		

	</ul>



	<br class="clear" /> <!-- clear floats -->



</div>

