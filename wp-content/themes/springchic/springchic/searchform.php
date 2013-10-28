<?php
// Exit if accessed directly
if ( !defined('ABSPATH')) exit;

/**
 * Search form
 *
 * @file           searchform.php
 * @package        SpringChic
 * @author         Color Splash Studio
 * @copyright      http://www.colorsplashstudio.com
 * @license        license.txt
 * @version        Release: 1.0
 * @since          available since Release 1.0
 */
?>
<form method="get" id="searchform" class="form-search" action="<?php echo esc_url( home_url( '/' ) ); ?>">
	
	<div class="input-append">
		<input id="s" class="input-large search-query" type="search" name="s" placeholder="<?php esc_attr_e( 'Search', 'st' ); ?>">
		<button class="btn btn-primary" name="submit" id="searchsubmit" type="submit"><?php _e( 'Go', 'st' ); ?></button>
   	</div>
</form>