<?php
// Exit if accessed directly
if ( !defined('ABSPATH')) exit;

/**
 * For displaying content in the aside post format
 *
 * @file           content-aside.php
 * @package        SpringChic
 * @author         Color Splash Studio
 * @copyright      http://www.colorsplashstudio.com
 * @license        license.txt
 * @version        Release: 1.0
 * @since          available since Release 1.0
 */
?>

<article id="post-<?php the_ID(); ?>" <?php post_class(); ?>>

	<?php if ( is_search() ) : // Only display Excerpts for Search ?>
	<div class="entry-summary clearfix">
		<?php the_excerpt(); ?>
	</div><!-- .entry-summary -->
	<?php else : ?>
		<div class="entry-content aside-post clearfix">
			<header class="page-header">
				<hgroup>
					<h2 class="aside-title"><?php printf( __( 'Aside', 'preference' ) ) ; ?></h2>
				</hgroup>
			</header><!-- .entry-header -->
		<?php the_content(); ?>		
			<footer class="aside-entry-footer">
				<div class="aside-entry-meta">
					<span><?php the_date(__('F j, Y', 'preference'), __('<strong>Published:</strong> ', 'preference') ); ?></span>	
					<span><a href="<?php echo get_permalink(); ?>"><?php printf( __( 'Permalink ', 'preference' ) ) ; ?></a></span>			
				</div><!-- .entry-meta -->
			</footer><!-- .entry-footer -->
	</div><!-- .entry-content -->
	<?php endif; ?>
	
</article><!-- #post-<?php the_ID(); ?>-->
<div class="gj-item-separator"></div>