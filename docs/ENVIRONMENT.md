# Environment Configuration Guide

> [!NOTE]
> You can place a `.env` file in the root (top-level) folder of your project to manage environment variables securely and efficiently.
>
> Alternatively, you can use your operating system's environment variable system for configuration.

## Database

- `HOST_DB`: This should be the hostname or IP address of your database server. For local development, this is usually `localhost`.
- `USER_DB`: This should be the username you use to connect to your database.
- `PASSWORD_DB`: This should be the password for the database user specified
- `DATABASE_DB`: This should be the name of the database you want to connect to.
- `PORT_DB`: This is the port number on which your database server is running. The default for MySQL is `3306`, but it may vary based on your setup.

## Email

- `NAME_EMAIL`: This should be the name you want to display in the "From" field of the email. It can be your name or the name of your application.
- `USER_EMAIL`: This should be your Gmail address. It is used to send emails from the application.
- `PASSWORD_EMAIL`: This should be an app password for Gmail, not your actual email password. You can create an app password in your Google account settings under "Security" > "App passwords".

## Example `.env` File

Below is an example of how these variables might look in a `.env` file:

```plaintext
HOST_DB=localhost
USER_DB=your_username
PASSWORD_DB=your_password
DATABASE_DB=your_database_name
PORT_DB=3306

NAME_EMAIL=Your Name
USER_EMAIL=example@gmail.com
PASSWORD_EMAIL=gmail_app_token
```
