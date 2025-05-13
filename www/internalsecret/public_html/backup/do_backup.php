<?php
include_once "../../session.php";

if(!isset($_POST["site"])) {
    header("Location: /backup");
    die();
}

$site = $_POST["site"];

header("Content-Type: application/octet-stream");
header("Content-Disposition: attachment; filename=" . $site . ".tar.gz"); 

$command = "cd /var/www/ && sudo tar -czf - " . $site;
passthru($command);;

die()

?>