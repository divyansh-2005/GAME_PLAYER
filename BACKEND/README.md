# Notes API

This project is a RESTful API built using Express.js, providing functionalities to manage user notes. It supports the following features:

- **SignUp**: Allows users to create an account by providing a username, email, and password.
- **SignIn**: Enables users to sign in using their registered email and password.
- **CreateNote**: Allows authenticated users to create new notes.
- **UpdateNote**: Allows authenticated users to update existing notes.
- **DeleteNote**: Allows authenticated users to delete their notes.
- **GetNote**: Allows authenticated users to retrieve their notes.

## Deployment

The deployment process for the Notes API is currently underway. Stay tuned for updates on the deployment status and instructions on how to access the API once it's deployed. If you have any questions or inquiries regarding deployment, feel free to reach out. Thank you for your patience!

## Installation

1. Clone this repository to your local machine:

   ```bash
   git clone <repository-url>
   ```

2. Navigate to the project directory:

   ```bash
   cd notes-api
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. Set up environment variables:
   - Create a `.env` file in the root directory.
   - Define the following environment variables:
     - `MONGO_URL`: MongoDB connection URI.
     - `SECRET_KEY`: Secret key for JWT token generation.

5. Start the server:

   ```bash
   npm start
   ```

## Usage

### SignUp

Endpoint: `POST /users/signup`

Request Body:
```json
{
  "username": "example",
  "email": "example@example.com",
  "password": "password"
}
```

### SignIn

Endpoint: `POST /users/signin`

Request Body:
```json
{
  "email": "example@example.com",
  "password": "password"
}
```

### CreateNote

Endpoint: `POST /note`

Authorization: Bearer token

Request Body:
```json
{
  "title": "Note Title",
  "content": "Note Content"
}
```

### UpdateNote

Endpoint: `PUT /note/:noteId`

Authorization: Bearer token

Request Body:
```json
{
  "title": "Updated Note Title",
  "content": "Updated Note Content"
}
```

### DeleteNote

Endpoint: `DELETE /note/:noteId`

Authorization: Bearer token

### GetNote

Endpoint: `GET /note`

Authorization: Bearer token

## Authentication

This API uses JSON Web Tokens (JWT) for authentication. Upon successful authentication (sign-in or sign-up), a token is generated and returned. This token should be included in the `Authorization` header of subsequent requests as a Bearer token.

Example:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImV4YW1wbGVAdGVzdC5jb20iLCJpZCI6IjYwNzlkZTI3N2U4NjFhMjE2MzZkM2IwZSIsImlhdCI6MTY0ODg0NzY5NCwiZXhwIjoxNjQ4ODUxMjk0fQ.k3i-BtGNgG3BpzfQZu_LDFDab3kffHuxbu1nftA7yQ0
```

## Contributing

Contributions are welcome! Feel free to open an issue or submit a pull request for new features, improvements, or bug fixes.

