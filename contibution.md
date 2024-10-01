Here’s a clear step-by-step guide for contributing to **GAME_PLAYER**:

## Steps to Contribute

1. **Fork the Repository**:
   - Go to the GAME_PLAYER GitHub repository.
   - Click on the "Fork" button at the top right corner of the page. This will create a copy of the repository under your GitHub account.

2. **Clone the Forked Repository**:
   - Open your terminal.
   - Clone your forked repository to your local machine:
     ```bash
     git clone https://github.com/your-username/GAME_PLAYER.git
     ```

3. Navigate to the project directory:
   ```bash
   cd GAME_PLAYER
   ```

4. Install the necessary dependencies for both the client and server:
   ```bash
   cd my-project
   npm install
   Add `.env` VITE_API_KEY=http://localhost:5000/
   npm run dev
   
   cd BACKEND
   npm install
   Add `.env` MONGO_URI=your-mongodb-connection-uri
   npm start
   ```

6. **Make Your Changes**:
   - Create a new branch for your feature or bug fix:
     ```bash
     git checkout -b your-branch-name
     ```
   - Make your changes in the code.
   - Once done, add and commit your changes:
     ```bash
     git add .
     git commit -m "Description of the feature/fix"
     ```

7. **Push Your Changes**:
   - Push the changes to your forked repository:
     ```bash
     git push origin your-branch-name
     ```

8. **Submit a Pull Request**:
   - Go to your forked repository on GitHub.
   - Click on the "Compare & pull request" button.
   - Add a description of your changes and submit the pull request.

9. **Review & Merge**:
   - Wait for the project maintainers to review your pull request.
   - Once approved, your changes will be merged into the main repository.

## Guidelines
- Ensure your code is well-structured and follows the project's code style.
- Write clear commit messages.
- Test your changes before submitting.
- Provide detailed descriptions in your pull requests.

Happy coding!
