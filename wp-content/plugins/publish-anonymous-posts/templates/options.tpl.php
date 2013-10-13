<div class="wrap">

	<div id="icon-options-general" class="icon32"><br /></div>
<h2>Publish Anonymous Posts</h2>

<form name="form" action="" method="post">
  <p>If you want you can add a new user called (anonymous) and enter his ID on the field &quot;Default User&quot;, so, any new posts will be published using that user credentials.</p>

<h3>Default Informations</h3>

<table class="form-table">
	<tr>
		<th><label>Default Status</label></th>
    <td><select name="sl_pap_status">
        		<option value="publish" <?php echo is_selected('publish',get_option('pap_status'))?>>Publish (Post will be published)</option>
                <option value="pending" <?php echo is_selected('pending',get_option('pap_status'))?>>Pending (Post will be sent for moderation)</option>
        	</select>&nbsp;<span class="description">Select the default status for new posts</span></td>
	</tr>
	<tr>
		<th><label >Default User</label></th>
		<td> <input name="txt_pap_user" type="text" value="<?php echo get_option('pap_user');?>" class="small-text" />&nbsp;<span class="description">Default User Id to create new posts. If not informed, ID 1 is assumed </span></td>
	</tr> 
	<tr>
		<th><label >Default Category</label></th>
		<td> <input name="txt_pap_category" type="text" value="<?php echo get_option('pap_category');?>" class="small-text" />&nbsp;<span class="description">Default Category ID to create new posts. If not informed, ID 1 is assumed </span></td>
	</tr>       
</table>
<br />
<h3>Limits Informations</h3>

<table class="form-table">
	<tr>
		<th><label >Max Posts Per IP Per Hour</label></th>
		<td> <input name="txt_pap_limit" type="text" value="<?php echo get_option('pap_limit');?>" class="small-text" />&nbsp;<span class="description">Number of posts can be created by one IP. <strong>-1</strong> for no limits. It is interesting to avoid abuses and spams</span></td>
	</tr>       
</table>

<p class="submit">
	<input type="submit" name="submit" class="button-primary" value="Update" />
</p>
  </form>

</div>
