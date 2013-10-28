<?php
// Exit if accessed directly
if ( !defined('ABSPATH')) exit;

/**
 * Theme functions
 *
 * @file           functions.php
 * @package        SpringChic
 * @author         Color Splash Studio
 * @copyright      http://www.colorsplashstudio.com
 * @license        license.txt
 * @version        Release: 1.0
 * @since          available since Release 1.0
 */

/**
 * Sets up the content width value based on the theme's design and stylesheet.
 */
if ( ! isset( $content_width ) )
	$content_width = 770;

/**
 * Sets up theme defaults and registers the various WordPress features that Preference supports
 */
function preference_setup() {
	/*
	 * Makes Preference available for translation.
	 *
	 * Translations can be added to the /languages/ directory.
	 * If you're building a theme based on Preference, use a find and replace
	 * to change 'preference' to the name of your theme in all the template files.
	 */
	load_theme_textdomain( 'preference', get_template_directory() . '/languages' );

	// This theme styles the visual editor with editor-style.css to match the theme style.
	add_editor_style();

	// Adds RSS feed links to <head> for posts and comments.
	add_theme_support( 'automatic-feed-links' );

	// This theme supports a variety of post formats.
	add_theme_support( 'post-formats', array( 'aside','image','quote', 'status' ) );

	// This theme uses wp_nav_menu() in one location.
	register_nav_menus( array(
		'primary-menu'			=>	__( 'Primary Menu', 'preference' ),
	) );	

	/*
	 * This theme supports custom background color and image, and here
	 * we also set up the default background color.
	 */
	add_theme_support( 'custom-background', array(
		'default-color' => '',
	) );

/** 
 * This theme uses a custom image size for the small thumbnail in addition to the full size. 
 * You can uncomment the other sizes if you want to use them by taking the // from the first part.
 */
	add_theme_support( 'post-thumbnails' );
	set_post_thumbnail( 250, 170 );        // Thumbnail (default 250px x 170px max)
}
add_action( 'after_setup_theme', 'preference_setup' );

/**
 * Adds support for a custom header image and also the theme customizer.
 */
require( get_template_directory() . '/inc/custom-header.php' );
require_once( get_template_directory() . '/inc/theme-customizer.php' );


/**
 * Enqueues scripts and styles for front-end.
 */
function preference_scripts_styles() {
	global $wp_styles;

	/*
	 * Adds JavaScript to pages with the comment form to support
	 * sites with threaded comments (when in use).
	 */
	if ( is_singular() && comments_open() && get_option( 'thread_comments' ) )
		wp_enqueue_script( 'comment-reply' );


	
	/*
	 * Adds Twitters Bootstrap script set.
	 */
	wp_enqueue_script( 'tw-bootstrap', get_template_directory_uri() . '/js/bootstrap.min.js', array('jquery'), '2.2.2', true );

	/*
	* Adds custom bootstrap styles to wp elements.
	*/
	wp_enqueue_script( 'st-bootstrap', get_template_directory_uri() . '/js/st-bootstrap.js', array('jquery'), '1.0', true );

	
	/*
	 * Loads our theme css
	 */
	wp_enqueue_style( 'tw-bootstrap', get_template_directory_uri() . '/css/bootstrap.css', array( ), '2.2.2' );
	wp_enqueue_style( 'menus', get_template_directory_uri() . '/css/menu.css', array( ), '1.0' );
	wp_enqueue_style( 'preference-style', get_stylesheet_uri() );	
	

/**
 * Adds IE specific scripts
 * Respond.js has to be loaded after Theme styles
 */
function preference_print_ie_scripts() {
	?>
	<!--[if lt IE 9]>
		<script src="<?php echo get_template_directory_uri(); ?>/js/html5shiv.min.js" type="text/javascript"></script>
		<script src="<?php echo get_template_directory_uri(); ?>/js/respond.min.js" type="text/javascript"></script>
	<![endif]-->
	<?php
}
add_action( 'wp_head', 'preference_print_ie_scripts', 11 );
	

/*
 * Loads the Internet Explorer specific stylesheet.
 */
	wp_enqueue_style( 'preference-ie', get_template_directory_uri() . '/css/ie.css', array( 'preference-style' ), '20130110' );
	$wp_styles->add_data( 'preference-ie', 'conditional', 'lt IE 9' );
}
add_action( 'wp_enqueue_scripts', 'preference_scripts_styles' );

/**
 * Adds customizable styles to your <head>
 */
function preference_customize_css()
{
    ?>
	<style type="text/css">
		a:link, a:visited {color:<?php echo get_theme_mod( 'links','' ); ?>;}
		a:hover {color:<?php echo get_theme_mod( 'linkshover','' ); ?>;}
		#right-column a, #right-column a:visited {color:<?php echo get_theme_mod( 'sidelinks','' ); ?>;}
		#right-column a:hover {color:<?php echo get_theme_mod( 'sidelinkshover','' ); ?>;}
		h1, h2, h3, h4, h5, h6, h1 a, h2 a, #right-column a {color:<?php echo get_theme_mod( 'page_headings','' ); ?>;}
		#footer-wrapper aside h4 {color:<?php echo get_theme_mod( 'footer_headings','' ); ?>;}
		#page-footer-wrapper a:link {color:<?php echo get_theme_mod( 'pagebottom_link','#' ); ?>;}
		#nav-wrapper,
		#gj-menu a {color:<?php echo get_theme_mod( 'menutext','' ); ?>;}		
		#gj-menu a:hover, #gj-menu .current > a, #gj-menu .active > a, #gj-menu .current-menu-item > a, #gj-menu .current-menu-ancestor > a, #gj-menu .current_page_item > a,
		#gj-menu .current_page_ancestor > a {color:<?php echo get_theme_mod( 'menutexthover','' ); ?>;}
		#gj-menu ul.menu li.home a {color:<?php echo get_theme_mod( 'menutext','' ); ?>;}
		.mainmenu ul li:hover > ul{background-color:<?php echo get_theme_mod( 'mainmenu_bg', '' ); ?>;}
		.img-intro img,.img-intro-left img,.img-intro-right img,.img-intro-none img,.img-full-left img,.img-full-right img,.img-full-none img,.imageborder,.contact-image img,.entry-attachment img,img.alignnone,img.alignright,img.alignleft,img.aligncenter,div.wp-caption img {border-color:<?php echo get_theme_mod( 'imgborder', '' ); ?>;
				
	</style>
    <?php
}
add_action( 'wp_head', 'preference_customize_css');

/**
 * Creates a nicely formatted and more specific title element text
 * for output in head of document, based on current view.
 */
function preference_wp_title( $title, $sep ) {
	global $paged, $page;

	if ( is_feed() )
		return $title;

	// Add the site name.
	$title .= get_bloginfo( 'name' );

	// Add the site description for the home/front page.
	$site_description = get_bloginfo( 'description', 'display' );
	if ( $site_description && ( is_home() || is_front_page() ) )
		$title = "$title $sep $site_description";

	// Add a page number if necessary.
	if ( $paged >= 2 || $page >= 2 )
		$title = "$title $sep " . sprintf( __( 'Page %s', 'preference' ), max( $paged, $page ) );

	return $title;
}
add_filter( 'wp_title', 'preference_wp_title', 10, 2 );

/**
 * Makes our wp_nav_menu() fallback -- wp_page_menu() -- show a home link.
 */
function preference_page_menu_args( $args ) {
	if ( ! isset( $args['show_home'] ) )
		$args['show_home'] = true;
	return $args;
}
add_filter( 'wp_page_menu_args', 'preference_page_menu_args' );

/**
 * Registers our main widget area and the front page widget areas.
 */
function preference_widgets_init() {

	register_sidebar( array(
		'name' => __( 'Blog Right Sidebar', 'preference' ),
		'id' => 'sidebar-blogright',
		'description' => __( 'This is the right sidebar column that appears on the blog but not the pages.', 'preference' ),
		'before_widget' => '<div id="%1$s" class="module %2$s">',
		'after_widget' => '</div>',
		'before_title' => '<h3>',
		'after_title' => '</h3><div class="modline-outer"><div class="modline-inner"></div></div>',
	) );
	register_sidebar( array(
		'name' => __( 'Page Right Sidebar', 'preference' ),
		'id' => 'sidebar-pageright',
		'description' => __( 'This is the right sidebar column that appears on pages, but not part of the blog', 'preference' ),
		'before_widget' => '<div id="%1$s" class="module %2$s">',
		'after_widget' => '</div>',
		'before_title' => '<h3>',
		'after_title' => '</h3><div class="modline-outer"><div class="modline-inner"></div></div>',
	) );	
	register_sidebar( array(
		'name' => __( 'Showcase Header', 'preference' ),
		'id' => 'sidebar-showcase',
		'description' => __( 'This is a showcase banner for images or media sliders that can display on your pages.', 'preference' ),
		'before_widget' => '<div id="%1$s" class="module %2$s" style="margin-bottom:0;">',
		'after_widget' => '</div>',
		'before_title' => '<h3>',
		'after_title' => '</h3>',
	) );

	register_sidebar( array(
		'name' => __( 'Bottom 1', 'preference' ),
		'id' => 'sidebar-bottom1',
		'description' => __( 'This is the first bottom widget position located in a coloured background area and shows only on the Front page and full width templates.', 'preference' ),
		'before_widget' => '<div id="%1$s" class="module %2$s">',
		'after_widget' => '</div>',
		'before_title' => '<h3>',
		'after_title' => '</h3><div class="modline-outer"><div class="modline-inner"></div></div>',
	) );	
	register_sidebar( array(
		'name' => __( 'Bottom 2', 'preference' ),
		'id' => 'sidebar-bottom2',
		'description' => __( 'This is the second bottom widget position located in a coloured background area and shows only on the Front page and full width templates.', 'preference' ),
		'before_widget' => '<div id="%1$s" class="module %2$s">',
		'after_widget' => '</div>',
		'before_title' => '<h3>',
		'after_title' => '</h3><div class="modline-outer"><div class="modline-inner"></div></div>',
	) );	
	register_sidebar( array(
		'name' => __( 'Bottom 3', 'preference' ),
		'id' => 'sidebar-bottom3',
		'description' => __( 'This is the third bottom widget position located in a coloured background area and shows only on the Front page and full width templates.', 'preference' ),
		'before_widget' => '<div id="%1$s" class="module %2$s">',
		'after_widget' => '</div>',
		'before_title' => '<h3>',
		'after_title' => '</h3><div class="modline-outer"><div class="modline-inner"></div></div>',
	) );	
	register_sidebar( array(
		'name' => __( 'Bottom 4', 'preference' ),
		'id' => 'sidebar-bottom4',
		'description' => __( 'This is the fourth bottom widget position located in a coloured background area and shows only on the Front page and full width templates.', 'preference' ),
		'before_widget' => '<div id="%1$s" class="module %2$s">',
		'after_widget' => '</div>',
		'before_title' => '<h3>',
		'after_title' => '</h3><div class="modline-outer"><div class="modline-inner"></div></div>',
	) );
	
	register_sidebar( array(
		'name' => __( 'Footer 1', 'preference' ),
		'id' => 'sidebar-footer1',
		'description' => __( 'This is the first footer widget position located in a coloured background area.', 'preference' ),
		'before_widget' => '<div id="%1$s" class="module %2$s ">',
		'after_widget' => '</div>',
		'before_title' => '<h4>',
		'after_title' => '</h4>',
	) );	
	register_sidebar( array(
		'name' => __( 'Footer 2', 'preference' ),
		'id' => 'sidebar-footer2',
		'description' => __( 'This is the second footer widget position located in a coloured background area.', 'preference' ),
		'before_widget' => '<div id="%1$s" class="module %2$s ">',
		'after_widget' => '</div>',
		'before_title' => '<h4>',
		'after_title' => '</h4>',
	) );	
	register_sidebar( array(
		'name' => __( 'Footer 3', 'preference' ),
		'id' => 'sidebar-footer3',
		'description' => __( 'This is the third footer widget position located in a coloured background area.', 'preference' ),
		'before_widget' => '<div id="%1$s" class="module %2$s ">',
		'after_widget' => '</div>',
		'before_title' => '<h4>',
		'after_title' => '</h4>',
	) );	
	register_sidebar( array(
		'name' => __( 'Footer 4', 'preference' ),
		'id' => 'sidebar-footer4',
		'description' => __( 'This is the fourth footer widget position located in a coloured background area.', 'preference' ),
		'before_widget' => '<div id="%1$s" class="module %2$s ">',
		'after_widget' => '</div>',
		'before_title' => '<h4>',
		'after_title' => '</h4>',
	) );
}
add_action( 'widgets_init', 'preference_widgets_init' );

/**
 * Count the number of top sidebars to enable resizable widgets
 * Starting with the Bottom group widgets then the footer group
 */
function bottomgroup_sidebar_class() {
	$count = 0;
	if ( is_active_sidebar( 'sidebar-bottom1' ) )
		$count++;
	if ( is_active_sidebar( 'sidebar-bottom2' ) )
		$count++;
	if ( is_active_sidebar( 'sidebar-bottom3' ) )
		$count++;		
	if ( is_active_sidebar( 'sidebar-bottom4' ) )
		$count++;
	$class = '';
	switch ( $count ) {
		case '1':
			$class = 'span12';
			break;
		case '2':
			$class = 'span6';
			break;
		case '3':
			$class = 'span4';
			break;
		case '4':
			$class = 'span3';
			break;
	}
	if ( $class )
		echo 'class="' . $class . '"';
}
// Lets do the footer widgets
function footergroup_sidebar_class() {
	$count = 0;
	if ( is_active_sidebar( 'sidebar-footer1' ) )
		$count++;
	if ( is_active_sidebar( 'sidebar-footer2' ) )
		$count++;
	if ( is_active_sidebar( 'sidebar-footer3' ) )
		$count++;		
	if ( is_active_sidebar( 'sidebar-footer4' ) )
		$count++;
	$class = '';
	switch ( $count ) {
		case '1':
			$class = 'span12';
			break;
		case '2':
			$class = 'span6';
			break;
		case '3':
			$class = 'span4';
			break;
		case '4':
			$class = 'span3';
			break;
	}
	if ( $class )
		echo 'class="' . $class . '"';
}



if ( ! function_exists( 'preference_content_nav' ) ) :
/**
 * Displays navigation to next/previous pages when applicable.
 */
function preference_content_nav( $html_id ) {
	global $wp_query;

	$html_id = esc_attr( $html_id );

	if ( $wp_query->max_num_pages > 1 ) : ?>
		<nav id="<?php echo $html_id; ?>" class="navigation" role="navigation">
			<h3 class="assistive-text"><?php _e( 'Post navigation', 'preference' ); ?></h3>
			<div class="nav-previous alignleft"><?php next_posts_link( __( '<span class="meta-nav">&larr;</span> Older posts', 'preference' ) ); ?> </div>
			<div class="nav-next alignright"><?php previous_posts_link( __( 'Newer posts <span class="meta-nav">&rarr;</span>', 'preference' ) ); ?></div>
		</nav><!-- #<?php echo $html_id; ?> .navigation -->
	<?php endif;
}
endif;

if ( ! function_exists( 'preference_comment' ) ) :
/**
 * Template for comments and pingbacks.
 *
 * To override this walker in a child theme without modifying the comments template
 * simply create your own preference_comment(), and that function will be used instead.
 *
 * Used as a callback by wp_list_comments() for displaying the comments.
 */
function preference_comment( $comment, $args, $depth ) {
	$GLOBALS['comment'] = $comment;
	switch ( $comment->comment_type ) :
		case 'pingback' :
		case 'trackback' :
		// Display trackbacks differently than normal comments.
	?>
	<li <?php comment_class(); ?> id="comment-<?php comment_ID(); ?>">
		<p><?php _e( 'Pingback:', 'preference' ); ?> <?php comment_author_link(); ?> <?php edit_comment_link( __( '(Edit)', 'preference' ), '<span class="edit-link">', '</span>' ); ?></p>
	<?php
			break;
		default :
		// Proceed with normal comments.
		global $post;
	?>
	<li <?php comment_class(); ?> id="li-comment-<?php comment_ID(); ?>">
		<article id="comment-<?php comment_ID(); ?>" class="comment">
		
		<header class="comment-meta comment-author vcard row-fluid">
			<div class="span1">
				<?php echo get_avatar( $comment, 44 ); ?>
			</div>
			<div class="span11">
			<?php
				printf( '<cite class="fn">%1$s %2$s</cite>',
					get_comment_author_link(),
					// If current post author is also comment author, make it known visually.
					( $comment->user_id === $post->post_author ) ? '<span> ' . __( 'Post author', 'preference' ) . '</span>' : ''
				);
				printf( '<time datetime="%2$s">%3$s</time>',
					esc_url( get_comment_link( $comment->comment_ID ) ),
					get_comment_time( 'c' ),
					/* translators: 1: date, 2: time */
					sprintf( __( '<br /><span class="comment-date">Commented on: %1$s</span>', 'preference' ), get_comment_date('F j, Y'), get_comment_time() )
				);
				?>
				<?php edit_comment_link( __( '<strong>Edit</strong> this comment', 'preference' ), '<span class="edit-link">', '</span>' ); ?>
			</div>
		</header>

			<?php if ( '0' == $comment->comment_approved ) : ?>
				<p class="comment-awaiting-moderation"><?php _e( 'Your comment is awaiting moderation.', 'preference' ); ?></p>
			<?php endif; ?>

			<section class="comment-content comment">
				<?php comment_text(); ?>
			</section><!-- .comment-content -->

			<div class="reply">
			<?php comment_reply_link( array_merge( $args, array( 'reply_text' => __( '<strong>Reply</strong> to this Comment', 'preference' ), 'depth' => $depth, 'max_depth' => $args['max_depth'] ) ) ); ?>
			</div><!-- .reply -->
			
		</article><!-- #comment-## -->
	<?php
		break;
	endswitch; // end comment_type check
}
endif;

/**
 * Adds markup to the comment form which is needed to make it work with Bootstrap

 */
function preference_comment_form_top() {
	echo '<div class="form-horizontal">';
}
add_action( 'comment_form_top', 'preference_comment_form_top' );


/**
 * Adds markup to the comment form which is needed to make it work with Bootstrap
 */
function preference_comment_form() {
	echo '</div>';
}
add_action( 'comment_form', 'preference_comment_form' );


/**
 * Custom author form field for the comments form
 */
function preference_comment_form_field_author( $html ) {
	$commenter	=	wp_get_current_commenter();
	$req		=	get_option( 'require_name_email' );
	$aria_req	=	( $req ? " aria-required='true'" : '' );
	
	return	'<div class="comment-form-author control-group">
				<label for="author" class="control-label">' . __( 'Name', 'preference' ) . '</label>
				<div class="controls">
					<input id="author" name="author" type="text" value="' . esc_attr(  $commenter['comment_author'] ) . '" class="span4"' . $aria_req . ' />
					' . ( $req ? '<span class="help-inline"><span class="required">' . __('required', 'preference') . '</span></span>' : '' ) . '
				</div>
			</div>';
}
add_filter( 'comment_form_field_author', 'preference_comment_form_field_author');


/**
 * Custom HTML5 email form field for the comments form
 */
function preference_comment_form_field_email( $html ) {
	$commenter	=	wp_get_current_commenter();
	$req		=	get_option( 'require_name_email' );
	$aria_req	=	( $req ? " aria-required='true'" : '' );
	
	return	'<div class="comment-form-email control-group">
				<label for="email" class="control-label">' . __( 'Email', 'preference' ) . '</label>
				<div class="controls">
					<input id="email" name="email" type="email" value="' . esc_attr(  $commenter['comment_author_email'] ) . '"  class="span4"' . $aria_req . ' />
					<p class="help-inline">' . ( $req ? '<span class="required">' . __('required', 'preference') . '</span>, ' : '' ) . __( 'will not be published', 'preference' ) . '</p>
				</div>
			</div>';
}
add_filter( 'comment_form_field_email', 'preference_comment_form_field_email');


/**
 * Custom HTML5 url form field for the comments form
 */
function preference_comment_form_field_url( $html ) {
	$commenter	=	wp_get_current_commenter();
	
	return	'<div class="comment-form-url control-group">
				<label for="url" class="control-label">' . __( 'Website', 'preference' ) . '</label>
				<div class="controls">
					<input id="url" name="url" type="url" value="' . esc_attr(  $commenter['comment_author_url'] ) . '" class="span4" />
				</div>
			</div>';
}
add_filter( 'comment_form_field_url', 'preference_comment_form_field_url');

/**
 * Filters comments_form() default arguments
 */
function preference_comment_form_defaults( $defaults ) {
	return wp_parse_args( array(
		'comment_field'			=>	'<div class="comment-form-comment control-group"><label class="control-label" for="comment">' . _x( 'Comment', 'noun', 'preference' ) . '</label><div class="controls"><textarea class="span6" id="comment" name="comment" rows="8" aria-required="true"></textarea></div></div>',
		'comment_notes_before'	=>	'',
		'comment_notes_after'	=>	'',
		'title_reply'			=>	'<legend>' . __( 'Leave a reply', 'preference' ) . '</legend>',
		'title_reply_to'		=>	'<legend>' . __( 'Leave a reply to %s', 'preference' ). '</legend>',
		'must_log_in'			=>	'<div class="must-log-in control-group controls">' . sprintf( __( 'You must be <a href="%s">logged in</a> to post a comment.', 'preference' ), wp_login_url( apply_filters( 'the_permalink', get_permalink( get_the_ID() ) ) ) ) . '</div>',
		'logged_in_as'			=>	'<div class="logged-in-as control-group controls">' . sprintf( __( 'Logged in as <a href="%1$s">%2$s</a>. <a href="%3$s" title="Log out of this account">Log out?</a>', 'preference' ), admin_url( 'profile.php' ), wp_get_current_user()->display_name, wp_logout_url( apply_filters( 'the_permalink', get_permalink( get_the_ID() ) ) ) ) . '</div>',
	), $defaults );
}
add_filter( 'comment_form_defaults', 'preference_comment_form_defaults' );


/**
 * Extends the default WordPress body class to denote:
 * 1. Using a full-width layout, when no active widgets in the sidebar
 *    or full-width template.
 * 2. Front Page template: thumbnail in use and number of sidebars for
 *    widget areas.
 * 3. White or empty background color to change the layout and spacing.
 * 4. Custom fonts enabled.
 * 5. Single or multiple authors.
 */
function preference_body_class( $classes ) {
	$background_color = get_background_color();

	if ( ! is_active_sidebar( 'sidebar-blogright' ) || is_page_template( 'page-templates/full-width.php' ) )
		$classes[] = 'full-width';

	if ( is_page_template( 'page-templates/page-right.php' ) ) {
		$classes[] = 'template-page-right';
		if ( has_post_thumbnail() )
			$classes[] = 'has-post-thumbnail';
		if ( is_active_sidebar( 'sidebar-pageright' ) && is_active_sidebar( 'sidebar-pageleft' ) )
			$classes[] = 'two-sidebars';
	}

	if ( empty( $background_color ) )
		$classes[] = 'custom-background-empty';
	elseif ( in_array( $background_color, array( 'fff', 'ffffff' ) ) )
		$classes[] = 'custom-background-white';

	// Enable custom font class only if the font CSS is queued to load.
	if ( wp_style_is( 'preference-fonts', 'queue' ) )
		$classes[] = 'custom-font-enabled';

	if ( ! is_multi_author() )
		$classes[] = 'single-author';

	return $classes;
}
add_filter( 'body_class', 'preference_body_class' );

/**
 * Adjusts content_width value for full-width and single image attachment
 * templates, and when there are no active widgets in the sidebar.
 */
function preference_content_width() {
	if ( is_page_template( 'page-templates/full-width.php' ) || is_attachment() || ! is_active_sidebar( 'sidebar-blogright' ) ) {
		global $content_width;
		$content_width = 1170;
	}
}
add_action( 'template_redirect', 'preference_content_width' );

/**
 * Returns a "Continue Reading" link for excerpts
 */
function preference_continue_reading_link() {
	return ' <a href="'. esc_url( get_permalink() ) . '">' . __( 'Read More', 'preference' ) . '</a>';
}
/**
 * Replaces "[...]" (appended to automatically generated excerpts) with an ellipsis and preference_continue_reading_link().
 */
function preference_auto_excerpt_more( $more ) {
	return '&hellip;' . preference_continue_reading_link();
}
add_filter( 'excerpt_more', 'preference_auto_excerpt_more' );




/**
 * Move the More Link outside the default content paragraph.
 * Special thanks to http://nixgadgets.vacau.com/archives/134
 */
function new_more_link($link) {
    $link = '<p class="btn">'.$link.'</p>';
    return $link;
}
add_filter('the_content_more_link', 'new_more_link');


/**
 * Lets strip the styles out of the default WP Gallery because they should not be loading in the content
 * Then we will have our own styled from the theme
 */
function preference_remove_gallery_css( $css ) {
	return preg_replace( "#<style type='text/css'>(.*?)</style>#s", '', $css );
}
add_filter( 'gallery_style', 'preference_remove_gallery_css' );



/**
 * Add postMessage support for site title and description for the Theme Customizer.
 */
function preference_customize_register( $wp_customize ) {
	$wp_customize->get_setting( 'blogname' )->transport = 'postMessage';
	$wp_customize->get_setting( 'blogdescription' )->transport = 'postMessage';
}
add_action( 'customize_register', 'preference_customize_register' );

/**
 * Binds JS handlers to make Theme Customizer preview reload changes asynchronously.
 */
function preference_customize_preview_js() {
	wp_enqueue_script( 'preference-customizer', get_template_directory_uri() . '/js/theme-customizer.js', array( 'customize-preview' ), '20120827', true );
}
add_action( 'customize_preview_init', 'preference_customize_preview_js' );