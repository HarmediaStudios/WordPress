<form id="searchform" method="get" action="<?php bloginfo('url'); ?>">

	<input type="text" name="s" id="s" size="15" value="Type your search term here..." class="cleardefault" />

	<input type="submit" id="search" value="" />

	<br class="clear" />

</form>



<ul id="sidebar">

<?php if ( !function_exists('dynamic_sidebar') || !dynamic_sidebar() ) : ?>



	<li><h2>Categories</h2>

		<ul>

			<?php wp_list_categories('show_count=0&title_li='); ?>

		</ul>

	</li>



	<?php endif; ?>



</ul>