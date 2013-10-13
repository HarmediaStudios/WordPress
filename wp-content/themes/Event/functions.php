<?php

add_action( 'login_head', 'hide_login_nav' );

function hide_login_nav()
{
    ?><style>#nav{display:none}</style><?php
}

add_action( 'after_setup_theme', 'et_setup_theme' );
if ( ! function_exists( 'et_setup_theme' ) ){
	function et_setup_theme(){
		global $themename, $shortname, $default_colorscheme;
		$themename = "Event";
		$shortname = "event";
		$default_colorscheme = "Default";

		$template_dir = get_template_directory();

		require_once($template_dir . '/epanel/custom_functions.php');

		require_once($template_dir . '/includes/functions/comments.php');

		require_once($template_dir . '/includes/functions/sidebars.php');

		load_theme_textdomain('Event',$template_dir.'/lang');

		require_once($template_dir . '/epanel/core_functions.php');

		require_once($template_dir . '/epanel/post_thumbnails_event.php');

		include($template_dir . '/includes/widgets.php');

		require_once($template_dir . '/includes/additional_functions.php');

		add_action( 'pre_get_posts', 'et_home_posts_query' );

		add_action( 'et_epanel_changing_options', 'et_delete_featured_ids_cache' );
		add_action( 'delete_post', 'et_delete_featured_ids_cache' );
		add_action( 'save_post', 'et_delete_featured_ids_cache' );
	}
}

add_action('wp_head','et_portfoliopt_additional_styles',100);
function et_portfoliopt_additional_styles(){ ?>
	<style type="text/css">
		#et_pt_portfolio_gallery { margin-left: -11px; }
		.et_pt_portfolio_item { margin-left: 26px; }
		.et_portfolio_small { margin-left: -40px !important; }
		.et_portfolio_small .et_pt_portfolio_item { margin-left: 38px !important; }
		.et_portfolio_large { margin-left: -8px !important; }
		.et_portfolio_large .et_pt_portfolio_item { margin-left: 11px !important; }
		div.pp_default .pp_content_container .pp_details { color: #666; }
		.et_pt_portfolio_item h2 { color: #fff; }
	</style>
<?php }

function register_main_menus() {
	register_nav_menus(
		array(
			'primary-menu' => __( 'Primary Menu', 'Event' ),
			'footer-menu' => __( 'Footer Menu', 'Event' )
		)
	);
}
if (function_exists('register_nav_menus')) add_action( 'init', 'register_main_menus' );

/**
 * Gets featured posts IDs from transient, if the transient doesn't exist - runs the query and stores IDs
 */
function et_get_featured_posts_ids(){
	if ( false === ( $et_featured_post_ids = get_transient( 'et_featured_post_ids' ) ) ) {
		$featured_query = new WP_Query( apply_filters( 'et_featured_post_args', array(
			'posts_per_page'	=> (int) et_get_option( 'event_featured_num' ),
			'cat'				=> (int) get_catId( et_get_option( 'event_feat_cat' ) )
		) ) );

		if ( $featured_query->have_posts() ) {
			while ( $featured_query->have_posts() ) {
				$featured_query->the_post();

				$et_featured_post_ids[] = get_the_ID();
			}

			set_transient( 'et_featured_post_ids', $et_featured_post_ids );
		}

		wp_reset_postdata();
	}

	return $et_featured_post_ids;
}

/**
 * Filters the main query on homepage
 */
function et_home_posts_query( $query = false ) {
	/* Don't proceed if it's not homepage or the main query */
	if ( ! is_home() || ! is_a( $query, 'WP_Query' ) || ! $query->is_main_query() ) return;

	/* Exclude slider posts, if the slider is activated, pages are not featured and posts duplication is disabled in ePanel  */
	if ( 'on' == et_get_option( 'event_featured', 'on' ) && 'false' == et_get_option( 'event_use_pages', 'false' ) && 'false' == et_get_option( 'event_duplicate', 'on' ) )
		$query->set( 'post__not_in', et_get_featured_posts_ids() );

	if ( 'false' == et_get_option( 'event_blog_style', 'false' ) ){
		$query->set( 'posts_per_page', (int) et_get_option( 'event_blog_postsnum', '6' ) );
		$query->set( 'ignore_sticky_posts', 1 );
		$query->set( 'cat', (int) get_catId( et_get_option( 'event_blog_cat' ) ) );

		return;
	}

	/* Set the amount of posts per page on homepage */
	$query->set( 'posts_per_page', (int) et_get_option( 'event_homepage_postsnum', '6' ) );

	/* Exclude categories set in ePanel */
	$exclude_categories = et_get_option( 'event_exlcats_recent', false );
	if ( $exclude_categories ) $query->set( 'category__not_in', array_map( 'intval', et_generate_wpml_ids( $exclude_categories, 'category' ) ) );
}

/**
 * Deletes featured posts IDs transient, when the user saves, resets ePanel settings, creates or moves posts to trash in WP-Admin
 */
function et_delete_featured_ids_cache(){
	if ( false !== get_transient( 'et_featured_post_ids' ) ) delete_transient( 'et_featured_post_ids' );
}

// add Home link to the custom menu WP-Admin page
function et_add_home_link( $args ) {
	$args['show_home'] = true;
	return $args;
}
add_filter( 'wp_page_menu_args', 'et_add_home_link' );

if ( ! function_exists( 'et_list_pings' ) ){
	function et_list_pings($comment, $args, $depth) {
		$GLOBALS['comment'] = $comment; ?>
		<li id="comment-<?php comment_ID(); ?>"><?php comment_author_link(); ?> - <?php comment_excerpt(); ?>
	<?php }
}

add_action( 'comment_form', 'et_allow_future_posts_comments' );
function et_allow_future_posts_comments($postid){
   global $wpdb;
   if ( is_single() ) {
      $post_object = get_post($postid);
      if ( $post_object->post_status == 'future' ) {
         $wpdb->update( $wpdb->posts, array( 'post_status' => 'publish' ), array( 'ID' => $postid ), array( '%s' ), array( '%d' ) );
      }
   }

   return $postid;
}

function et_filter_where($where = '') {
	global $wpdb;

	$where = str_replace("$wpdb->posts.post_status = 'publish'", "$wpdb->posts.post_status = 'publish' OR $wpdb->posts.post_status = 'future'",$where);
   return $where;
}
add_filter('posts_where', 'et_filter_where');


function et_show_future_singlepost($posts)
{
	global $wp_query, $wpdb;

	if(is_single() && $wp_query->post_count == 0)
		$posts = $wpdb->get_results($wp_query->request);

	return $posts;
}
add_filter('the_posts', 'et_show_future_singlepost');

if ( ! function_exists( 'et_get_calendar' ) ){
	function et_get_calendar($initial = true, $echo = true) {
		global $wpdb, $monthnum, $year, $wp_locale, $posts, $shortname;

		$wp_table = 'wp_em_events';

		$blogcat = (int) get_catId(get_option($shortname . '_blog_cat'));
		$blogcats_array = array_merge( array($blogcat), get_term_children($blogcat, 'category') );
		$blogcats = implode(",",$blogcats_array);

		$blog_category_posts_id = $wpdb->get_results("SELECT $wpdb->posts.ID "
									. "FROM $wpdb->posts "
									. "INNER JOIN $wpdb->term_relationships ON ($wpdb->posts.ID = $wpdb->term_relationships.object_id) " 								. "INNER JOIN $wpdb->term_taxonomy ON ($wpdb->term_relationships.term_taxonomy_id = $wpdb->term_taxonomy.term_taxonomy_id) "
									. "AND $wpdb->term_taxonomy.taxonomy = 'category' "
									. "AND $wpdb->term_taxonomy.term_id IN ($blogcats) "
									. "AND($wpdb->posts.post_type = 'post') AND ($wpdb->posts.post_status = 'publish' OR $wpdb->posts.post_status = 'future') "
									. "ORDER BY post_date DESC ", ARRAY_A
									);

		$excluded_ids = array();
		foreach ( $blog_category_posts_id as $blog_cat_post ) {
			$excluded_ids[] = $blog_cat_post['ID'];
		}
		$excluded_posts_string = implode(",",$excluded_ids);

		if ( isset($_GET['etmonth']) )
			$m = $_GET['etmonth'];
		else {
			$recent_post_info = $wpdb->get_row("SELECT DISTINCT ID, MONTH(post_date) AS month, YEAR(post_date) AS year
				FROM $wpdb->em_events
				WHERE post_type = 'post' AND (post_status = 'publish' OR post_status = 'future') AND ID NOT IN ($excluded_posts_string)
				ORDER BY post_date DESC
				LIMIT 1");

			$m = $recent_post_info->year . zeroise($recent_post_info->month,2);
		}

		$etpostid = isset( $_GET['etpostid'] ) ? $_GET['etpostid'] : '';
		if ( $etpostid == '' ) {
			if ( isset($recent_post_info) ) $etpostid = $recent_post_info->ID;
			else {
				$recentyear = substr($m,0,4);
				$recentmonth = substr($m,5,2);
				$recent_post_ID = $wpdb->get_results("SELECT ID "
					."FROM $wpdb->posts "
					."WHERE YEAR(post_date) = '$recentyear' "
					."AND MONTH(post_date) = '$recentmonth' "
					."AND post_type = 'post' AND (post_status = 'publish' OR post_status = 'future') AND ID NOT IN ($excluded_posts_string)"
					."ORDER BY post_date DESC LIMIT 1"
				);
				$etpostid = $recent_post_ID[0]->ID;
			}
		}

		$cache = array();
		$key = md5( $m . $monthnum . $year );

		if ( $cache = wp_cache_get( 'et_get_calendar', 'calendar' ) ) {
			if ( is_array($cache) && isset( $cache[ $key ] ) ) {
				if ( $echo ) {
					echo apply_filters( 'et_get_calendar',  $cache[$key] );
					return;
				} else {
					return apply_filters( 'et_get_calendar',  $cache[$key] );
				}
			}
		}

		if ( !is_array($cache) )
			$cache = array();

		// Quick check. If we have no posts at all, abort!
		if ( !$posts ) {
			$gotsome = $wpdb->get_var("SELECT 1 as test FROM $wpdb->posts WHERE post_type = 'post' AND post_status = 'publish' LIMIT 1");
			if ( !$gotsome ) {
				$cache[ $key ] = '';
				wp_cache_set( 'et_get_calendar', $cache, 'calendar' );
				return;
			}
		}

		if ( isset($_GET['w']) )
			$w = ''.intval($_GET['w']);

		// week_begins = 0 stands for Sunday
		$week_begins = intval(get_option('start_of_week'));

		// Let's figure out when we are

		if ( !empty($monthnum) && !empty($year) ) {
			$thismonth = ''.zeroise(intval($monthnum), 2);
			$thisyear = ''.intval($year);
		} elseif ( !empty($w) ) {

			// We need to get the month from MySQL
			$thisyear = ''.intval(substr($m, 0, 4));
			$d = (($w - 1) * 7) + 6; //it seems MySQL's weeks disagree with PHP's
			$thismonth = $wpdb->get_var("SELECT DATE_FORMAT((DATE_ADD('${thisyear}0101', INTERVAL $d DAY) ), '%m')");
		} elseif ( !empty($m) && $m != '00') {
			$thisyear = ''.intval(substr($m, 0, 4));
			if ( strlen($m) < 6 )
					$thismonth = '01';
			else
					$thismonth = ''.zeroise(intval(substr($m, 4, 2)), 2);
		} else {

			$thisyear = gmdate('Y', current_time('timestamp'));
			$thismonth = gmdate('m', current_time('timestamp'));
		}

		$unixmonth = mktime(0, 0 , 0, $thismonth, 1, $thisyear);

		// Get the next and previous month and year with at least one post
		$previous = $wpdb->get_row($q="SELECT DAYOFMONTH(event_start_date) as dom "
			."FROM wp_em_events "
			."WHERE event_start_date < '$thisyear-$thismonth-01' "
			." LIMIT 1");


		/*	"SELECT DISTINCT MONTH(post_date) AS month, YEAR(post_date) AS year
			FROM $wpdb->posts
			WHERE post_date < '$thisyear-$thismonth-01'
			AND post_type = 'post' AND (post_status = 'publish' OR post_status = 'future') AND ID NOT IN ($excluded_posts_string)
				ORDER BY post_date DESC
				LIMIT 1");*/
		$next = $wpdb->get_row("SELECT DAYOFMONTH(event_start_date) as dom "
			."FROM wp_em_events "
			."WHERE event_start_date > '$thisyear-$thismonth-01' "
			." LIMIT 1");

		/* translators: Calendar caption: 1: month name, 2: 4-digit year */
		$calendar_caption = _x('%1$s %2$s', 'calendar caption');
		$calendar_output = '<div id="et_custom_calendar">';
		$calendar_output .= "\n" . '<div id="custom_calendar" class="clearfix">';
		$calendar_output .= "\n" . '<table id="wp-custom-calendar" summary="' . esc_attr__('Calendar') . '">
		<caption>' . sprintf($calendar_caption, $wp_locale->get_month($thismonth), date('Y', $unixmonth)) . '</caption>
		<thead>
		<tr>';

		$myweek = array();

		for ( $wdcount=0; $wdcount<=6; $wdcount++ ) {
			$myweek[] = $wp_locale->get_weekday(($wdcount+$week_begins)%7);
		}

		$initial = false;
		$wd_i = 0;
		foreach ( $myweek as $wd ) {
			$wd_i++;
			$day_name = (true == $initial) ? $wp_locale->get_weekday_initial($wd) : $wp_locale->get_weekday_abbrev($wd);
			$wd = esc_attr($wd);
			$calendar_output .= "\n\t\t<th id=\"wd_$wd_i\" scope=\"col\" title=\"$wd\">$day_name</th>";
		}

		$calendar_output .= '
		</tr>
		</thead>

		<tfoot>
		<tr>';

		$calendar_page = ( is_home() ) ? get_bloginfo('url') : get_permalink();

		if ( $previous ) {
			$calendar_output .= "\n\t\t".'<td colspan="3" id="prev"><a href="'.add_query_arg('etmonth', $previous->year . zeroise($previous->month,2), $calendar_page). '" title="' . sprintf(__('View posts for %1$s %2$s'), $wp_locale->get_month($previous->month), date('Y', mktime(0, 0 , 0, $previous->month, 1, $previous->year))) . '">&laquo; ' . $wp_locale->get_month_abbrev($wp_locale->get_month($previous->month)) . '</a></td>';
		} else {
			$calendar_output .= "\n\t\t".'<td colspan="3" id="prev" class="pad">&nbsp;</td>';
		}

		$calendar_output .= "\n\t\t".'<td class="pad">&nbsp;</td>';

		if ( $next ) {
			$calendar_output .= "\n\t\t".'<td colspan="3" id="next"><a href="' . add_query_arg('etmonth', $next->year . zeroise($next->month,2), $calendar_page) . '" title="' . esc_attr( sprintf(__('View posts for %1$s %2$s'), $wp_locale->get_month($next->month), date('Y', mktime(0, 0 , 0, $next->month, 1, $next->year))) ) . '">' . $wp_locale->get_month_abbrev($wp_locale->get_month($next->month)) . ' &raquo;</a></td>';
		} else {
			$calendar_output .= "\n\t\t".'<td colspan="3" id="next" class="pad">&nbsp;</td>';
		}

		// See how much we should pad in the beginning
		$pad = calendar_week_mod(date('w', $unixmonth)-$week_begins);

		$pad_class = ( $pad >= 5 ) ? " class='et_pad'" : '';

		$calendar_output .= "
		</tr>
		</tfoot>

		<tbody>
		<tr{$pad_class}>";

		// Get days with posts
		$dayswithposts = $wpdb->get_results("SELECT DISTINCT DAYOFMONTH(event_start_date) FROM wp_em_events WHERE event_status = 1", ARRAY_N);

//print_r($dayswithposts);exit;

		if ( $dayswithposts ) {
			foreach ( (array) $dayswithposts as $daywith ) {
				$daywithpost[] = $daywith[0];
			}
		} else {
			$daywithpost = array();
		}

		if (strpos($_SERVER['HTTP_USER_AGENT'], 'MSIE') !== false || stripos($_SERVER['HTTP_USER_AGENT'], 'camino') !== false || stripos($_SERVER['HTTP_USER_AGENT'], 'safari') !== false)
			$ak_title_separator = "\n";
		else
			$ak_title_separator = ', ';

		$ak_titles_for_day = array();
		$ak_post_titles = $wpdb->get_results("SELECT DAYOFMONTH(event_start_date) as dom "
			."FROM wp_em_events "
			."WHERE YEAR(event_start_date) = '$thisyear' "
			."AND MONTH(event_start_date) = '$thismonth' "
			.""
		);

		if ( $ak_post_titles ) {
			foreach ( (array) $ak_post_titles as $ak_post_title ) {
					$arr_params = array ( 'etmonth' => $thisyear . zeroise($thismonth,2), 'etpostid' => $ak_post_title->ID );

					$ak_categories = get_the_category( $ak_post_title->ID );
					$ak_first_category = $ak_categories[0]->cat_name;

					$post_title = esc_attr( apply_filters( 'the_title', $ak_post_title->post_title, $ak_post_title->ID ) );
					$current_post = get_post($ak_post_title->ID);

					if ( empty($ak_titles_for_day['day_'.$ak_post_title->dom]) )
						$ak_titles_for_day['day_'.$ak_post_title->dom] = '';
					if ( empty($ak_titles_for_day["$ak_post_title->dom"]) ) // first one
						$ak_titles_for_day["$ak_post_title->dom"] = '<span class="feat_title"><a href="'.add_query_arg( $arr_params, $calendar_page ).'" title="'.$post_title.'">'.truncate_title(20,false,$current_post).'</a></span><span class="feat_cat">'.$ak_first_category.'</span>';
					else
						$ak_titles_for_day["$ak_post_title->dom"] .= '<span class="feat_title"><a href="'.add_query_arg( $arr_params, $calendar_page ).'" title="'.$post_title.'">'.truncate_title(20,false,$current_post).'</a></span><span class="feat_cat">'.$ak_first_category.'</span>';
			}
		}

		if ( 0 != $pad )
			$calendar_output .= "\n\t\t".'<td colspan="'. esc_attr($pad) .'" class="pad">&nbsp;</td>';

		$daysinmonth = intval(date('t', $unixmonth));
		for ( $day = 1; $day <= $daysinmonth; ++$day ) {
			$dwp_class = '';
			if ( in_array($day, $daywithpost) )
				$dwp_class = ' class="dwp"';

			if ( isset($newrow) && $newrow )
				$calendar_output .= "\n\t</tr>\n\t<tr{$pad_class}>\n\t\t";
			$newrow = false;

			if ( $day == gmdate('j', current_time('timestamp')) && $thismonth == gmdate('m', current_time('timestamp')) && $thisyear == gmdate('Y', current_time('timestamp')) )
				$calendar_output .= '<td id="today"'.$dwp_class.'>';
			else
				$calendar_output .= "<td{$dwp_class}>";

			if ( in_array($day, $daywithpost) ) { // any posts today?
				$calendar_output .= '<span class="posts_today">' . "$day".'<span class="et_popup"><span class="tooltip_arrow"></span>' . $ak_titles_for_day[$day] . '</span>'."</span>";
				#$calendar_output .= '<span class="et_popup"><span class="tooltip_arrow"></span>' . $ak_titles_for_day[$day] . '</span>';
				//'. esc_attr($ak_titles_for_day[$day])
			}
			else
				$calendar_output .= $day;
			$calendar_output .= '</td>';

			if ( 6 == calendar_week_mod(date('w', mktime(0, 0 , 0, $thismonth, $day, $thisyear))-$week_begins) )
				$newrow = true;
		}

		$pad = 7 - calendar_week_mod(date('w', mktime(0, 0 , 0, $thismonth, $day, $thisyear))-$week_begins);
		if ( $pad != 0 && $pad != 7 )
			$calendar_output .= "\n\t\t".'<td class="pad" colspan="'. esc_attr($pad) .'">&nbsp;</td>';

		$calendar_output .= "\n\t</tr>\n\t</tbody>\n\t</table>";
		$calendar_output .= "\n</div> <!-- end custom-calendar -->";
		$calendar_output .= "\n" . '<div class="event_post">';
		if ( $etpostid <> '' ) {
			global $themename;
			$post_id = $etpostid;
			$et_calendar_post = get_post( $post_id );
			$et_link = get_permalink( $post_id );

			$thumb = '';

			$width = 524;
			$height = 211;
			$classtext = '';
			$titletext = get_the_title();

			$thumbnail = get_thumbnail($width,$height,$classtext,$titletext,$titletext,false,'Featured',$et_calendar_post);
			$thumb = $thumbnail["thumb"];

			if ( $thumb <> '' ) {
				$calendar_output .= '<div class="featured-thumbnail">';
				$calendar_output .= print_thumbnail($thumb, $thumbnail["use_timthumb"], $titletext, $width, $height, $classtext, false, false, true, $et_calendar_post);
				$calendar_output .= '<span class="featured-overlay"></span></div> <!-- end .featured-thumbnail -->';
			}
			$calendar_output .= "\n" . '<h2 class="title">'.truncate_title(19, false, $et_calendar_post).'</h2>';
			$calendar_output .= "\n" . '<p class="excerpt">'.truncate_post(250, false, $et_calendar_post).'</p>';
			$calendar_output .= "\n" . '<a href="'.$et_link.'" class="readmore"><span>'.__('More Info',$themename).'</span></a>';
		}
		$calendar_output .= "\n" . '</div> <!-- .event_post -->';
		$calendar_output .= "\n" . '</div> <!-- #et_custom_calendar -->';

		$cache[ $key ] = $calendar_output;
		$et_result = wp_cache_set( 'et_get_calendar', $cache, 'calendar' );

		if ( $echo )
			echo apply_filters( 'et_get_calendar',  $calendar_output );
		else
			return apply_filters( 'et_get_calendar',  $calendar_output );
	}
}

function et_epanel_custom_colors_css(){
	global $shortname; ?>

	<style type="text/css">
		body { color: #<?php echo esc_html(get_option($shortname.'_color_mainfont')); ?>; }
		#content-area a { color: #<?php echo esc_html(get_option($shortname.'_color_mainlink')); ?>; }
		ul.nav li a { color: #<?php echo esc_html(get_option($shortname.'_color_pagelink')); ?>; }
		ul.nav > li.current_page_item > a, ul#top-menu > li:hover > a, ul.nav > li.current-cat > a { color: #<?php echo esc_html(get_option($shortname.'_color_pagelink_active')); ?>; }
		h1, h2, h3, h4, h5, h6, h1 a, h2 a, h3 a, h4 a, h5 a, h6 a { color: #<?php echo esc_html(get_option($shortname.'_color_headings')); ?>; }

		#sidebar a { color:#<?php echo esc_html(get_option($shortname.'_color_sidebar_links')); ?>; }
		div#footer { color:#<?php echo esc_html(get_option($shortname.'_footer_text')); ?> }
		#footer a, ul#bottom-menu li a { color:#<?php echo esc_html(get_option($shortname.'_color_footerlinks')); ?> }
	</style>

<?php }
