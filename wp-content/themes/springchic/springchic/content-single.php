<?php
// Exit if accessed directly
if ( !defined('ABSPATH')) exit;

/**
 * Single Post content Template
 *
 * @file           content-single.php
 * @package        SpringChic
 * @author         Color Splash Studio
 * @copyright      http://www.colorsplashstudio.com
 * @license        license.txt
 * @version        Release: 1.0
 * @since          available since Release 1.0
 */


 ?>
<article id="post-<?php the_ID(); ?>" <?php post_class(); ?>>
	
	
	<header class="page-header">
		<h1 class="entry-title"><?php the_title(); ?></h1>
			<div class="gj-article-details">
				<dl class="gj-article-info"><dd><?php _e( 'Date: ', 'preference' ); ?><?php the_time(__('F j, Y', 'preference') ); ?></dd><dd><?php _e( 'Author: ', 'preference' ); ?><?php the_author(); ?></dd><?php edit_post_link( __( 'Edit', 'preference' ), '<dd class="edit-link">', '</dd>' ); ?></dl>
			</div>
	</header><!-- .entry-header -->

	<div class="entry-content">
	<?php  if ( has_post_format( 'image' , '' )) : ?>
		<div class="img-full-left"><?php the_post_thumbnail( ); ?></div>
	<?php endif; ?>
		<?php the_content(); ?>
		
	</div><!-- .entry-content -->

	<footer class="entry-footer">
		<?php wp_link_pages( array( 'before' => '<span><span class="page-links">' . __( 'Pages: </span>', 'preference' ), 'after' => '</span><br />' ) ); ?>
		
		<?php
		$categories_list = get_the_category_list( _x( ', ', 'used between list items, there is a space after the comma', 'preference' ) );
		$tags_list = get_the_tag_list( '', _x( ', ', 'used between list items, there is a space after the comma', 'preference' ) );
		
		if ( $categories_list )
			printf( '<span>' . __( '<span class="cat-links">Posted in: </span> %1$s.', 'preference' ) . '</span><br />', $categories_list );
		if ( $tags_list )
			printf( '<span>' . __( '<span class="tag-links">Tagged: </span> %1$s.', 'preference' ) . '</span><br />', $tags_list );		 
		?>
		<?php  the_modified_date( 'F j, Y', __( '<span class="modified-date">Last Modified: </span> ', 'preference') ); ?>
	</footer><!-- .entry-footer -->
	
	
</article><!-- #post-<?php the_ID(); ?> -->

<?php if ( is_singular() && get_the_author_meta( 'description' ) && is_multi_author() ) : // If a user has filled out their description and this is a multi-author blog, show a bio on their entries. ?>
	<aside id="author-info">
		<div class="row-fluid">
			<div id="author-avatar" class="span1">
				<?php echo get_avatar( get_the_author_meta( 'user_email' ), apply_filters( 'styledthemes_author_bio_avatar_size', 70 ) ); ?>
			</div>
			<div id="author-description" class="span11">
				<h4 id="author-title"><?php printf( __( 'About %s', 'preference' ), get_the_author() ); ?></h4>
				<?php the_author_meta( 'description' ); ?>
				<span id="author-link"><a href="<?php echo esc_url( get_author_posts_url( get_the_author_meta( 'ID' ) ) ); ?>" rel="author">
					<?php printf( __( 'View all posts by %s here...', 'preference' ), get_the_author() ); ?>
				</a></span>
			</div><!-- #author-description -->
			
		</div>
	</aside><!-- #author-info -->
<?php endif; ?>