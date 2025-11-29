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

- `DB_POOL_MAX`: This is the maximum number of connections allowed in the database connection pool. Adjust this based on your application's needs and database server capacity.
- `DB_POOL_MIN`: This is the minimum number of connections to maintain in the database connection pool.
- `DB_POOL_IDLE`: This is the maximum time, in milliseconds, that a connection can remain idle in the pool before being released.
- `DB_POOL_ACQUIRE`: This is the maximum time, in milliseconds, that the pool will try to get a connection before throwing an error.

## Email

- `NAME_EMAIL`: This should be the name you want to display in the "From" field of the email. It can be your name or the name of your application.
- `USER_EMAIL`: This should be your Gmail address. It is used to send emails from the application.
- `PASSWORD_EMAIL`: This should be an app password for Gmail, not your actual email password. You can create an app password in your Google account settings under "Security" > "App passwords".

## Mercado Pago

- `MP_ACCESS_TOKEN`: This should be the access token for your Mercado Pago account. You can find this in your Mercado Pago developer account settings.
- `MP_WEBHOOK_SECRET`: This should be the webhook secret for your Mercado Pago account. This is used to verify the authenticity of webhook notifications sent by Mercado Pago.
- `MP_URL_BACKEND`: This should be the URL of your backend server that will handle webhook notifications from Mercado Pago. It should be publicly accessible and configured to receive POST requests.
- `MP_URL_FRONTEND_SUCCESS`: This should be the URL of your frontend application that users will be redirected to after a successful payment.
- `MP_URL_FRONTEND_FAILURE`: This should be the URL of your frontend application that users will be redirected to after a failed payment.

## Others

- `JWT_PASSWORD`: This should be the password for JWT tokens.
- `MP_TIME`: This should be the time in minutes for which the Mercado Pago payment link will be valid. It is used to set the expiration time for the payment link.
- `START_CRONS`: This should be set to `true` if you want to start the cron jobs for your application. Cron jobs are scheduled tasks that run at specified intervals.

## Example `.env` File

Below is an example of how these variables might look in a `.env` file:

```plaintext
HOST_DB=localhost
USER_DB=your_username
PASSWORD_DB=your_password
DATABASE_DB=your_database_name
PORT_DB=3306

DB_POOL_MAX=20
DB_POOL_MIN=5
DB_POOL_IDLE=10000
DB_POOL_ACQUIRE=30000

JWT_PASSWORD=yourJWTToken

MP_TIME=30

START_CRONS=true

NAME_EMAIL=Your Name
USER_EMAIL=example@gmail.com
PASSWORD_EMAIL=gmail_app_token

MP_ACCESS_TOKEN=your_mp_access_token
MP_WEBHOOK_SECRET=your_mp_webhook_secret
MP_URL_BACKEND=https://your-backend-url.com/webhook
MP_URL_FRONTEND_SUCCESS=https://your-frontend-url.com/success
MP_URL_FRONTEND_FAILURE=https://your-frontend-url.com/failure
```
