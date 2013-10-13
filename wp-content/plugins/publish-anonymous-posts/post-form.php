<?php
include("../../../wp-blog-header.php");

function create_post($author, $status, $category){
	global $title, $text, $tags;
	
	$my_post = array();
	$my_post['post_title'] = $title;
	$my_post['post_content'] = $text;
	$my_post['post_status'] = $status;
	$my_post['post_author'] = $author;
	$my_post['post_category'] = array($category);
	$my_post['tags_input'] = $tags;

	return wp_insert_post( $my_post );
}

$title = isset($_POST["title"])?$_POST["title"]:"";
$text = isset($_POST["text"])?$_POST["text"]:"";
$tags = isset($_POST["tags"])?$_POST["tags"]:"";
$submit = isset($_POST["submit"])?$_POST["submit"]:"";

function display_captcha($cptch_options) {

	if(function_exists('cptch_anonymous_post_form') && $cptch_options['cptch_anonymous_post'] == 1) { 
		return cptch_anonymous_post_form();
	}
}

if($submit == "Post it") {
	if(empty($title) || empty($text)) {
		echo "<script>alert('Post Title and Post Text cannot be empty');</script>";	
	} else if (exceeded_limit()) {
		echo "<script>alert('You have exceeded the maximum number of post creation per hour limit. \\nWait an hour and try again!');</script>";	
	} else {
		if( function_exists( 'cptch_check_custom_form' ) && cptch_check_custom_form() !== true && $cptch_options['cptch_anonymous_post'] == 1) {
			$msg = "The Captcha Result is incorrect! Please try again.";
			echo "<script>alert('$msg');</script>";	
		} else {
			$author = get_option('pap_user'); if(!$author) $author = 1;
			$status = get_option('pap_status'); if(!$status) $status = 'pending';
			$category = get_option('pap_category'); if(!$category) $category = 1;
			create_post($author, $status, $category);
			$msg = 'publish' == $status?'Your Post has been Published!':'Your Post has been submited for Moderation!';
			$title = '';
			$text = '';
			$tags = '';
			echo "<script>alert('$msg');</script>";	
		}
	}
}

function exceeded_limit(){
	$total_posts = 0;
	$limit = get_option('pap_limit');
	if($limit==-1 || $limit==false) return false;
	$ip = $_SERVER['REMOTE_ADDR'];
	$new_ips = array();
	
	$day_hora = date('Y') . "_" . date('m') . "_" . date('d') . "_" . date('H');
	$pap_ip = $day_hora . "_" . $ip;
	$ips = get_option('pap_ips');
	if($ips){
		$ips = explode(",", $ips);
		for($i=0;$i<count($ips);$i++){
			if(strpos($ips[$i], $day_hora)!==false) $new_ips[] = $ips[$i];
		}
		for($i=0;$i<count($new_ips);$i++){
			if(strpos($new_ips[$i], $ip)!==false) $total_posts++;
			if($total_posts >= $limit) return true;
		}
	}
	$new_ips = implode(",",$new_ips);
	$new_ips.= "," . $day_hora . "_" . $ip;
	update_option('pap_ips',$new_ips);
	return false;
}
?>
<html>
<head>
</head>
<body>
<div id="postbox" style="background-color:#EEE; padding: 15px; margin: 5px 0px; -moz-border-radius: 10px; -khtml-border-radius: 10px; -webkit-border-radius: 10px; border-radius: 10px;" >
	<form id="new_post" name="new_post" method="post" action="">
		<input type="hidden" name="action" value="post" />
		<label for="title">Post Title: (*)</label>
		<br />
		<input type="text" name="title" id="title" style="width:100%; height: 25px; border: 1px solid #99afbc; margin: 5px 0 10px 0;" value="<?php echo $title?>" />
		<br />
		<label for="text">Post Text</label> :(*)
    	<br />
		<textarea name="text" id="text" rows="3" style="width:100%; height: 80px; border: 1px solid #99afbc; margin: 5px 0 10px 0;"><?php echo $text?></textarea>
    	
    	<?php echo display_captcha($cptch_options); ?>
		
		<label for="tags">Tags (separated with comma)</label>
		<br />
		<input type="text" name="tags" id="tags" style="width:100%; height: 25px; border: 1px solid #99afbc; margin: 5px 0 10px 0;" value="<?php echo $tags?>" />
		<br />
		<input id="submit" type="submit" name="submit" value="Post it" style='padding:10px; font-size:20px; width:250px;'  /> <span style="float:right;font-family:Tahoma; font-size:9px;color:#CCC;">by <a href='http://wordpresslivro.com' target="_blank" style="font-family:Tahoma; font-size:9px;color:#CCC;text-decoration:none">Livro Wordpress</a></span>
	</form>
</div> <!-- // postbox -->
</body>
</html>