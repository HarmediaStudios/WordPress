<?php
// Exit if accessed directly
if ( !defined('ABSPATH')) exit;

/**
 * For displaying content in the status post format
 *
 * @file           content-status.php
 * @package        SpringChic
 * @author         Color Splash Studio
 * @copyright      http://www.colorsplashstudio.com
 * @license        license.txt
 * @version        Release: 1.0
 * @since          available since Release 1.0
 */
?>

	<article id="post-<?php the_ID(); ?>" <?php post_class(); ?>>
		

		<div class="entry-content row-fluid">
		<div class="span1"><?php echo get_avatar( get_the_author_meta( 'ID' ), apply_filters( 'preference_status_avatar', '70' ) ); ?></div>
		<div class="span11">
		<div class="entry-header">
			<header>
				<h1 class="entry-title-status"><?php the_title(); ?><?php edit_post_link( __( 'Edit', 'preference' ), '<span class="edit-link">&nbsp;', '</span>' ); ?></h1>
				<h2 class="status-date"><?php printf( __( 'Update By: ', 'preference' ) ) ; ?><?php the_author(); ?> <br /><span ><?php the_date(__('F j, Y', 'preference'), __('Date: ', 'preference') ); ?></span></h2>	
			</header>			
		</div><!-- .entry-header -->
			<?php the_content( __( 'Continue reading <span class="meta-nav">&rarr;</span>', 'preference' ) ); ?>
		</div>
		</div><!-- .entry-content -->

		<footer class="status-entry-meta">
			
		</footer><!-- .entry-meta -->
	</article><!-- #post -->
	<div class="gj-item-separator"></div>