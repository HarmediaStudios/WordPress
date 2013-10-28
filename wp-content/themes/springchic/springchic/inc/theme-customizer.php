<?php
// Exit if accessed directly
if ( !defined('ABSPATH')) exit;

/**
 * Theme options
 *
 * @file           theme-customizer.php
 * @package        Preference Lite 
 * @author         Andre Jutras 
 * @copyright      2013 StyledThemes.com
 * @license        license.txt
 * @version        Release: 1.0
 * @since          available since Release 1.0
 */
 
// Lets create a customizable theme 
add_action('after_setup_theme','themedemo_setup');
function themedemo_setup() {
	add_theme_support( 'custom-background', array(
		'default-color' => 'ffffff',
		
	) );
}


add_action('customize_register', 'themedemo_customize');
function themedemo_customize($wp_customize) {

// Lets remove the Display Header Text setting and control
$wp_customize->remove_setting( 'display_header_text');
$wp_customize->remove_control( 'display_header_text');

/**
 * Lets begin adding our own settings and controls for this theme
 * Plus organize it in sequence in each setting group with a priority level
 */
	$wp_customize->add_setting( 'logo_style', array(
		'default' => 'Default Logo',
	) );

// Setting group for selecting logo title	
	$wp_customize->add_control( 'logo_style', array(
    'label'   => __( 'Logo Style', 'preference' ),
    'section' => 'title_tagline',
	'priority' => '1',
    'type'    => 'radio',
        'choices' => array(
            'default' => __( 'Default Logo', 'preference' ),
            'custom' => __( 'Your Logo', 'preference' ),
            'text' => __( 'Text Title', 'preference' ),
        ),
    ));
	
// Setting group for uploading logo
    $wp_customize->add_setting('my_logo', array(
        'default'           => '',
        'capability'        => 'edit_theme_options',
        'type'           => 'option',

    ));

    $wp_customize->add_control( new WP_Customize_Image_Control($wp_customize, 'my_logo', array(
        'label'    => __('Your Logo', 'preference'),
        'section'  => 'title_tagline',
        'settings' => 'my_logo',
		'priority' => '2',
    )));
	
// Lets add a section tab called BASIC SETTINGS
	$wp_customize->add_section( 'basic_settings', array(
		'title'          => __( 'Basic Settings', 'preference' ),
		'priority'       => 25,
	) );	


/**
 * Header image section
 */
	



/**
 * Colour Section
 * Lets add some colours to our theme
 */
 
// Page top border
 	$wp_customize->add_setting( 'page_top_border', array(
		'default'        => '#fbd3ca',
	) );

	$wp_customize->add_control( new WP_Customize_Color_Control( $wp_customize, 'page_top_border', array(
		'label'   => __( 'Page Top Border', 'preference' ),
		'section' => 'colors',
		'settings'   => 'page_top_border',
		'priority' => '1',
	) ) );
	
// Top page half background colour
	$wp_customize->add_setting( 'tophalf_bg', array(
		'default'        => '#ffffff',
	) );

	$wp_customize->add_control( new WP_Customize_Color_Control( $wp_customize, 'tophalf_bg', array(
		'label'   => __( 'Top Half Page Background', 'preference' ),
		'section' => 'colors',
		'settings'   => 'tophalf_bg',
		'priority' => '2',
	) ) );
// Top page half bottom line
	$wp_customize->add_setting( 'tophalf_botline', array(
		'default'        => '#ffffff',
	) );

	$wp_customize->add_control( new WP_Customize_Color_Control( $wp_customize, 'tophalf_botline', array(
		'label'   => __( 'Top Half Bottom Line', 'preference' ),
		'section' => 'colors',
		'settings'   => 'tophalf_botline',
		'priority' => '3',
	) ) );

// Main menu background colour
	$wp_customize->add_setting( 'mainmenu_bg', array(
		'default'        => '#ffffff',
	) );

	$wp_customize->add_control( new WP_Customize_Color_Control( $wp_customize, 'mainmenu_bg', array(
		'label'   => __( 'Main Menu Background', 'preference' ),
		'section' => 'colors',
		'settings'   => 'mainmenu_bg',
		'priority' => '4',
	) ) );

// Main Content background colour
	$wp_customize->add_setting( 'content_bg', array(
		'default'        => '#Ffffff',
	) );

	$wp_customize->add_control( new WP_Customize_Color_Control( $wp_customize, 'content_bg', array(
		'label'   => __( 'Main Content Background', 'preference' ),
		'section' => 'colors',
		'settings'   => 'content_bg',
		'priority' => '5',
	) ) );

// Main Content bottom line
	$wp_customize->add_setting( 'content_botline', array(
		'default'        => '#fbd3ca',
	) );

	$wp_customize->add_control( new WP_Customize_Color_Control( $wp_customize, 'content_botline', array(
		'label'   => __( 'Main Content Bottom Line', 'preference' ),
		'section' => 'colors',
		'settings'   => 'content_botline',
		'priority' => '6',
	) ) );

// Main Content text colour
	$wp_customize->add_setting( 'content_text', array(
		'default'        => '#747474',
	) );

	$wp_customize->add_control( new WP_Customize_Color_Control( $wp_customize, 'content_text', array(
		'label'   => __( 'Main Content Text Colour', 'preference' ),
		'section' => 'colors',
		'settings'   => 'content_text',
		'priority' => '7',
	) ) );

// Footer background colour
	$wp_customize->add_setting( 'footer_bg', array(
		'default'        => '#fbd3ca',
	) );

	$wp_customize->add_control( new WP_Customize_Color_Control( $wp_customize, 'footer_bg', array(
		'label'   => __( 'Footer Background', 'preference' ),
		'section' => 'colors',
		'settings'   => 'footer_bg',
		'priority' => '8',
	) ) );
	
// Footer top line
	$wp_customize->add_setting( 'footer_topline', array(
		'default'        => '#ffffff',
	) );

	$wp_customize->add_control( new WP_Customize_Color_Control( $wp_customize, 'footer_topline', array(
		'label'   => __( 'Footer Top Line', 'preference' ),
		'section' => 'colors',
		'settings'   => 'footer_topline',
		'priority' => '9',
	) ) );	
	
// Footer text colour
	$wp_customize->add_setting( 'footer_text', array(
		'default'        => '#ffffff',
	) );

	$wp_customize->add_control( new WP_Customize_Color_Control( $wp_customize, 'footer_text', array(
		'label'   => __( 'Footer Text Colour', 'preference' ),
		'section' => 'colors',
		'settings'   => 'footer_text',
		'priority' => '10',
	) ) );	
	
// Page bottom text colour
	$wp_customize->add_setting( 'pagebottom_text', array(
		'default'        => '#747474',
	) );

	$wp_customize->add_control( new WP_Customize_Color_Control( $wp_customize, 'pagebottom_text', array(
		'label'   => __( 'Page Bottom Text Colour', 'preference' ),
		'section' => 'colors',
		'settings'   => 'pagebottom_text',
		'priority' => '11',
	) ) );	
	
// Page bottom link colour
	$wp_customize->add_setting( 'pagebottom_links', array(
		'default'        => '#ffeae5',
	) );

	$wp_customize->add_control( new WP_Customize_Color_Control( $wp_customize, 'pagebottom_links', array(
		'label'   => __( 'Page Bottom Links', 'preference' ),
		'section' => 'colors',
		'settings'   => 'pagebottom_links',
		'priority' => '12',
	) ) );		
	
// Content Headings
	$wp_customize->add_setting( 'page_headings', array(
		'default'        => '#333333',
	) );

	$wp_customize->add_control( new WP_Customize_Color_Control( $wp_customize, 'page_headings', array(
		'label'   => __( 'Page Headings', 'preference' ),
		'section' => 'colors',
		'settings'   => 'page_headings',
		'priority' => '13',
	) ) );	
	
// Footer Headings
	$wp_customize->add_setting( 'footer_headings', array(
		'default'        => '#ffffff',
	) );

	$wp_customize->add_control( new WP_Customize_Color_Control( $wp_customize, 'footer_headings', array(
		'label'   => __( 'Footer Headings', 'preference' ),
		'section' => 'colors',
		'settings'   => 'footer_headings',
		'priority' => '14',
	) ) );	

// Text link colour
	$wp_customize->add_setting( 'links', array(
		'default'        => '#fbd3ca',
	) );

	$wp_customize->add_control( new WP_Customize_Color_Control( $wp_customize, 'links', array(
		'label'   => __( 'Text link Colour', 'preference' ),
		'section' => 'colors',
		'settings'   => 'links',
		'priority' => '15',
	) ) );
// Text link hover colour
	$wp_customize->add_setting( 'linkshover', array(
		'default'        => '#719aa7',
	) );

	$wp_customize->add_control( new WP_Customize_Color_Control( $wp_customize, 'linkshover', array(
		'label'   => __( 'Text Link Hover Colour', 'preference' ),
		'section' => 'colors',
		'settings'   => 'linkshover',
		'priority' => '16',
	) ) );

// Sidebar link colour
	$wp_customize->add_setting( 'sidelinks', array(
		'default'        => '#747474',
	) );
	$wp_customize->add_control( new WP_Customize_Color_Control( $wp_customize, 'sidelinks', array(
		'label'   => __( 'Sidebar Link Colour', 'preference' ),
		'section' => 'colors',
		'settings'   => 'sidelinks',
		'priority' => '17',
	) ) );	
// Sidebar link hover colour
	$wp_customize->add_setting( 'sidelinkshover', array(
		'default'        => '#fbd3ca',
	) );
	$wp_customize->add_control( new WP_Customize_Color_Control( $wp_customize, 'sidelinkshover', array(
		'label'   => __( 'Sidebar Link Hover Colour', 'preference' ),
		'section' => 'colors',
		'settings'   => 'sidelinkshover',
		'priority' => '18',
	) ) );	
	
	
// Image border colour
	$wp_customize->add_setting( 'imgborder', array(
		'default'        => '#ffeae5',
	) );

	$wp_customize->add_control( new WP_Customize_Color_Control( $wp_customize, 'imgborder', array(
		'label'   => __( 'Image Border', 'preference' ),
		'section' => 'colors',
		'settings'   => 'imgborder',
		'priority' => '19',
	) ) );	
/**
 * Nav Section
 * Lets style our menus
 */
 
// Main menu link
	$wp_customize->add_setting( 'menutext', array(
		'default'        => '#747474',
	) );

	$wp_customize->add_control( new WP_Customize_Color_Control( $wp_customize, 'menutext', array(
		'label'   => __( 'Menu Text Colour', 'preference' ),
		'section' => 'nav',
		'settings'   => 'menutext',
		'priority' => '105',
	) ) );	
	
// Main menu link active and hover
	$wp_customize->add_setting( 'menutexthover', array(
		'default'        => '#fbd3ca',
	) );

	$wp_customize->add_control( new WP_Customize_Color_Control( $wp_customize, 'menutexthover', array(
		'label'   => __( 'Menu Text Hover', 'preference' ),
		'section' => 'nav',
		'settings'   => 'menutexthover',
		'priority' => '106',
	) ) );	
	
	
}