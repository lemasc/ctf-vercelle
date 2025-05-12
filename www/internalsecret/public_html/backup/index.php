<?php
include_once "../../session.php";

$folders = glob("/var/www/*", GLOB_ONLYDIR);
?>
<!DOCTYPE html>
<html>
    <head>
        <title>Backup</title>
        <link rel="stylesheet" href="/styles.css">
    </head>
    <body>
        <h1>Backup Site</h1>
        <form method="post" action="/logout" style="max-width: 100px;">
            <button type="submit">Logout</button>
        </form>
        <p>You can perform backup of local websites here.</p>
        <form method="post" action="do_backup.php">
            <div class="form-group">
                <label for="site">Select a site to backup</label>
                <select name="site" required>
                    <option value="">Select...</option>
                    <?php foreach ($folders as $folder) {
                        $folder = basename($folder);
                        # the default site folder is too big to backup
                        # and probably not useful
                        # include this folder will take large space and waste of time!
                        if ($folder != "default") {
                            echo '<option value="' . $folder . '">' . $folder . '</option>';
                        }
                    } ?>
                </select>
            </div>
            <button type="submit">Backup</button>    
        </form>
    </body>
</html>
