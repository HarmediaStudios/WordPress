<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="de" lang="de">
<!--
Red Train: Template for Wordpress 2.0.x
(c) by Vladimir Simovic aka Perun
www.vlad-design.de and www.perun.net

The CSS, XHTML and design is released under GPL:
http://www.opensource.org/licenses/gpl-license.php
-->
<head profile="http://gmpg.org/xfn/1">
<?php if (is_home()) { ?>
    <title><?php bloginfo('name'); ?> - <?php bloginfo('description'); ?></title>
<?php } else { ?>
    <title><?php wp_title('&raquo;', true, 'right'); bloginfo('name'); ?></title>
<?php } ?>
    <meta http-equiv="Content-Type" content="text/html; charset=<?php bloginfo('charset'); ?>" />
    <meta name="generator" content="WordPress <?php bloginfo('version'); ?>" /> <!-- leave this for stats -->

    <link rel="stylesheet" type="text/css" media="screen, projection" href="<?php bloginfo('stylesheet_url'); ?>" />

    <meta name="robots" content="index,follow" />

    <link rel="alternate" type="application/rss+xml" title="RSS 2.0" href="<?php bloginfo('rss2_url'); ?>" />
    <link rel="alternate" type="text/xml" title="RSS .92" href="<?php bloginfo('rss_url'); ?>" />
    <link rel="alternate" type="application/atom+xml" title="Atom 0.3" href="<?php bloginfo('atom_url'); ?>" />
    <link rel="pingback" href="<?php bloginfo('pingback_url'); ?>" />
    <?php wp_get_archives('type=monthly&format=link'); ?>
    <?php wp_head(); ?>
</head>
<body>

<div id="container">

    <div id="header">
        <h1><a href="<?php bloginfo('url'); ?>"><?php bloginfo('name'); ?></a><br /><small><?php bloginfo('description'); ?></small></h1>
    </div>
