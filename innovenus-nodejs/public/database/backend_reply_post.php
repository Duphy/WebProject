
<?php include_once '../header.php';?>
<?php 

//$response = connect_reply_posting($poster_id, $target_uid,$eid, $pid, $uid_name, $reply_target_name,$content, $visibility);
$poster_uid=1235770;
$post_eid=0;
$post_pid=20;

$response = connect_reply_posting($poster_uid, $poster_uid,
0, $post_pid, 'Andy', 'acerwei',
$_POST['reply'], 0);

print_array($response);
?>