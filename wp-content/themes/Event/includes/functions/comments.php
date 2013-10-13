<?php if ( ! function_exists( 'et_custom_comments_display' ) ) :
function et_custom_comments_display($comment, $args, $depth) {
   $GLOBALS['comment'] = $comment; ?>
   <li <?php comment_class(); ?> id="li-comment-<?php comment_ID() ?>">
		<div class="comment_box">
			<div class="comment_box_top">
				<div class="comment_box_content">
				   <div id="comment-<?php comment_ID(); ?>" class="comment-body clearfix">
						<div class="alignleft authordata">
							<div class="avatar">
								<?php echo get_avatar($comment,$size='61'); ?>
								<span class="avatar-overlay"></span>
							</div> <!-- end .avatar-->
						</div>

						<div class="comment-wrap">
							<div class="comment-wrap-inner clearfix">
								<?php printf( '<span class="fn">%s says:</span>', get_comment_author_link() ); ?>

								<div class="comment-meta commentmetadata">
									<?php echo(get_comment_date()) ?>
									<?php edit_comment_link(esc_html__('(Edit)','Event'),'  ','') ?>
								</div>

								<?php if ($comment->comment_approved == '0') : ?>
									<em class="moderation"><?php esc_html_e('Your comment is awaiting moderation.','Event') ?></em>
									<br />
								<?php endif; ?>

								<div class="comment-content"><?php comment_text() ?></div> <!-- end comment-content-->
								<?php
									$et_comment_reply_link = get_comment_reply_link( array_merge( $args, array('reply_text' => esc_attr__('reply','Event'),'depth' => $depth, 'max_depth' => $args['max_depth'])) );
									if ( $et_comment_reply_link ) echo '<div class="reply-container">' . $et_comment_reply_link . '</div>';
								?>
							</div> <!-- end comment-wrap-inner -->
						</div> <!-- end comment-wrap-->
					</div> <!-- end comment-body-->
				</div> <!-- end comment_box_content -->
			</div> <!-- end comment_box_top -->
		</div> <!-- end comment_box -->
<?php }
endif; ?>