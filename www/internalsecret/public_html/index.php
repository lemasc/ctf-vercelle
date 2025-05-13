<?php
$login_error = "";

if (isset($_POST["username"]) && isset($_POST["password"])) {
    $username = $_POST["username"];
    $password = $_POST["password"];

    # connect to mysql database
    $conn = new mysqli("localhost", "root", $_SERVER["MYSQL_ROOT_PASSWORD"], $_SERVER["MYSQL_DATABASE"]);
    if ($conn->connect_error) {
        die("Connection failed: " . $conn->connect_error);
    }

    # check if username and password are correct
    $query = $conn->prepare("SELECT * FROM User WHERE username = 'admin' AND password = ?");
    $query->bind_param("s", $password);
    $query->execute();
    $result = $query->get_result();
    if ($result->num_rows > 0) {
        session_start();
        $_SESSION["username"] = "admin";
        session_write_close();
        header("Location: /backup");
        die();
    } else {
        $login_error = "Invalid username or password.";
    }
}
?>
<!DOCTYPE html>
<html>
    <head>
        <title>Login to Internal Site</title>
        <link rel="stylesheet" href="styles.css">
    </head>
    <body>
        <h1>Login to Internal Site</h1>
        <form method="post">
            <div class="form-group">
                <label for="username">Username</label><br/>
                <input type="text" name="username" placeholder="Username" required>
            </div>
            <div class="form-group">
                <label for="password">Password</label><br/>
                <input type="password" name="password" placeholder="Password" required>
            </div>
            <button type="submit">Login</button>
        </form>
        <?php if ($login_error) { ?>
            <p style="color: red;"><b><?php echo $login_error; ?></b></p>
        <?php } ?>
        <!-- what you see is what you might not see, go "bust" it, and check everywhere! -->
    </body>
</html>




