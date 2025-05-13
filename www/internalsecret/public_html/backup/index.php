<?php
/**
 * NOTE FROM ADMIN!:
 * 
 * I write this quick and dirty, so if you want to
 * make changes to the code, just enter the front website
 * and enter the same login username and password.
 * Use the site file manager to edit files as usual.
 * 
 */

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
        <div>
            <h2>Welcome, <?php echo $_SESSION["username"]; ?></h2>
            <form method="post" action="/logout.php" style="max-width: 100px;">
                <button type="submit">Logout</button>
            </form>
            <p>If you can see this, then you deserve the second flag!</p>
            <div>
                <pre><code>$ekureMakEiEi</code></pre>
            </div>
        </div>
        <hr>
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
