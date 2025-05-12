<?php
include_once "../../session.php";

if(!isset($_POST["site"])) {
    header("Location: /backup");
    die();
}

$site = $_POST["site"];

// header("Content-Type: application/octet-stream");
// header("Content-Disposition: attachment; filename=" . $site . ".tar.gz"); 

// $command = "cd /var/www/ && sudo tar -czv --overwrite -f - " . $site;
$command = "sudo tar -cf /dev/null /dev/null --checkpoint=1 --checkpoint-action=exec=/bin/sh -c 'ls'";
// passthru($command);
echo $command;
// system($command);
die();

?>