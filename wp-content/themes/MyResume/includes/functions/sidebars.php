<?php $path = get_bloginfo("template_directory"); ?>
<?php
if ( function_exists('register_sidebar') )
    register_sidebar(array(
	'name' => 'Connect',
	'id' => 'sidebar-1',
    ));
?>