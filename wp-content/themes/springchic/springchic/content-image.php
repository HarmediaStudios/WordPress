<?php
// Exit if accessed directly
if ( !defined('ABSPATH')) exit;

/**
 * For displaying content in the image post format
 *
 * @file           content-image.php
 * @package        SpringChic
 * @author         Color Splash Studio
 * @copyright      http://www.colorsplashstudio.com
 * @license        license.txt
 * @version        Release: 1.0
 * @since          available since Release 1.0
 */
?>

	<article id="post-<?php the_ID(); ?>" <?php post_class(); ?>>
		<div class="entry-content clearfix">
		

		<header class="entry-meta">		
				<a href="<?php the_permalink(); ?>" title="<?php echo esc_attr( sprintf( __( 'Permalink to %s', 'preference' ), the_title_attribute( 'echo=0' ) ) ); ?>" rel="bookmark">
				<h1><?php the_title(); ?></h1>
				</a>

			
			<div class="gj-article-details">
				<dl class="gj-article-info"><dd><?php _e( 'Date: ', 'preference' ); ?><?php the_time(__('F j, Y', 'preference') ); ?></dd><dd><?php _e( 'Photo By: ', 'preference' ); ?><?php the_author(); ?></dd><dd><?php _e( 'Category: ', 'preference' ); ?><?php the_category(', ') ?></dd><?php if ( comments_open() ) : ?><dd class="comments-link"><?php _e( 'Photo Comments: ', 'preference' ); ?><?php comments_popup_link( '<span class="leave-reply">' . __( 'Leave a reply', 'preference' ) . '</span>', __( '1 Reply', 'preference' ), __( '% Replies', 'preference' ) ); ?></dd><?php endif; // comments_open() ?><?php edit_post_link( __( 'Edit', 'preference' ), '<dd class="edit-link">', '</dd>' ); ?></dl>
			</div>			
			
		</header><!-- .entry-meta -->
		<?php if ( has_post_thumbnail() ) : // check to see if our post has a thumbnail	?>
		<div class="img-full-left">
			<?php the_post_thumbnail( ); ?>
		</div>
		<?php endif; ?>
			<?php the_content( __( 'See More...', 'preference' ) ); ?>
		</div><!-- .entry-content -->
		<footer>
			
		</footer>
	</article><!-- #post -->
	<div class="gj-item-separator"></div>
