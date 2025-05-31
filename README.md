# LuminaWeb - AI Website Transformation

This application uses serverless functions to take screenshots of websites and upload images for AI analysis and transformation. The application is designed to be deployed on serverless platforms like Vercel and Netlify with secure temporary file storage.

## Features

- Take screenshots of websites using serverless APIs
- Upload website images directly with drag-and-drop
- Analyze website design and structure (AI integration coming soon)
- Apply AI-powered transformations
- Preview before/after comparisons
- Secure encrypted file storage with automatic cleanup

## Development Setup

1. Install dependencies:
   ```
   bun install
   ```

2. Create a `.env.local` file in the root directory with the following variables:
   ```
   # API Configuration
   VITE_API_URL=http://localhost:3001
   
   # Screenshot API
   SCREENSHOT_API_KEY=your_screenshot_api_key
   
   # UploadThing API for file uploads
   UPLOADTHING_APP_ID=your_uploadthing_app_id
   UPLOADTHING_SECRET=your_uploadthing_secret
   VITE_UPLOADTHING_APP_ID=your_uploadthing_app_id
   
   # Security
   JWT_SECRET=your_secure_random_string
   FILE_ENCRYPTION_KEY=your_secure_32_character_key
   
   # Temporary File Settings
   MAX_FILE_SIZE_MB=10
   FILE_RETENTION_MINUTES=30
   ```

3. Start the development server:
   ```
   bun run dev
   ```

4. For local testing with the Express server:
   ```
   bun run server
   ```

## Serverless Deployment

The application is configured to work with serverless platforms and uses temporary encrypted file storage instead of external CDNs.

### Vercel Deployment

1. Push your code to GitHub
2. Import your repository in Vercel
3. Configure the following environment variables:
   - `VITE_API_URL`: Your application URL (e.g., https://your-app.vercel.app)
   - `SCREENSHOT_API_KEY`: Your screenshot API service key
   - `UPLOADTHING_APP_ID`: Your UploadThing app ID
   - `UPLOADTHING_SECRET`: Your UploadThing secret key
   - `VITE_UPLOADTHING_APP_ID`: Your UploadThing app ID (for client-side)
   - `FILE_ENCRYPTION_KEY`: A secure 32-character encryption key
   - `MAX_FILE_SIZE_MB`: Maximum file size in MB (default: 10)
   - `FILE_RETENTION_MINUTES`: How long to keep files (default: 30)
4. Deploy

### Netlify Deployment

1. Push your code to GitHub
2. Import your repository in Netlify
3. Configure the following environment variables:
   - `VITE_API_URL`: Your application URL (e.g., https://your-app.netlify.app)
   - `SCREENSHOT_API_KEY`: Your screenshot API service key
   - `UPLOADTHING_APP_ID`: Your UploadThing app ID
   - `UPLOADTHING_SECRET`: Your UploadThing secret key
   - `VITE_UPLOADTHING_APP_ID`: Your UploadThing app ID (for client-side)
   - `FILE_ENCRYPTION_KEY`: A secure 32-character encryption key
   - `MAX_FILE_SIZE_MB`: Maximum file size in MB (default: 10)
   - `FILE_RETENTION_MINUTES`: How long to keep files (default: 30)
4. Deploy

## Secure File Handling

The application uses a secure approach to file handling:

1. **Encrypted Storage**: All uploaded files are encrypted using AES-256-CBC before being stored
2. **Temporary Storage**: Files are stored using UploadThing's secure file hosting
3. **Automatic Cleanup**: Files are automatically deleted after a configurable retention period
4. **Secure Access**: Files can only be accessed with a secure random token
5. **Modern File Storage**: Uses UploadThing for reliable and secure file uploads

## Security Considerations

- The `FILE_ENCRYPTION_KEY` should be a secure random 32-character string
- Files are automatically deleted after the retention period (default: 30 minutes)
- Security headers are set to prevent common web vulnerabilities
- Token-based authentication is used for file access

## Notes

- The serverless functions have been optimized to work within the free tier limits of Vercel and Netlify
- The application supports both direct image uploads and URL-based screenshots
- Maximum file upload size is configurable (default: 10MB)
- For heavy usage, consider extending the file retention period or implementing a more robust storage solution

## Serverless Architecture

The application uses the following serverless functions:

1. `/api/screenshot` - Takes screenshots of websites using external screenshot APIs
2. `/api/upload` - Uploads images to UploadThing for secure storage
3. `/api/analyze` - Analyzes images (placeholder for future AI integration)

### External Services

- **Image Storage**: UploadThing (free tier includes generous storage limits)
- **Screenshot API**: Screenshot One API (many offer free tiers)
- **Future AI Integration**: OpenAI Vision API or similar

## Code Review Tool

This project includes a code review tool that helps maintain code quality by identifying common issues and anti-patterns in the codebase.

### Running the Code Review

To run the code review tool:

```bash
bun run code-review
```

### What It Checks For

The code review tool analyzes the codebase for:

- **Console statements**: Identifies console.log/error/warn statements that might be forgotten in production code
- **Missing accessibility attributes**: Finds HTML elements that might need accessibility improvements
- **Long functions**: Highlights functions that are too complex and could be broken down
- **Large files**: Identifies files that may be doing too much and could be split
- **Hardcoded API endpoints**: Finds hardcoded URLs that should be in environment variables
- **Empty useEffect dependency arrays**: Identifies React useEffect hooks that might cause unexpected behavior
- **Nested ternary operators**: Finds complex nested ternaries that reduce code readability

### Understanding the Results

The output includes:

1. **File-by-file breakdown**: Each issue is shown with its location and context
2. **Summary of most common issues**: The top 5 most frequently occurring issues
3. **Recommendations**: Specific suggestions for addressing each type of issue

### Integrating with Your Workflow

The code review tool is integrated into the pre-commit hook and is run before each release. To run it manually during development, use:

```bash
bun run code-review
```

It's recommended to address high-priority issues (errors) immediately, while warnings can be addressed over time as part of ongoing code maintenance.

## Automated Pre-Development Checks

This project includes automated security and code quality checks that run before starting the development server. These checks help catch issues early in the development process.

### How It Works

When you run `bun run dev` to start the development server, the following checks are automatically run first:

1. **Security Check**: Scans the codebase for potential security issues like hardcoded API keys or tokens
2. **Code Review**: Analyzes the code for quality issues and best practices

If any critical issues are found, the development server will not start until they are fixed.

### Manual Execution

You can also run these checks manually:

```bash
node scripts/predev-check.js
```

## Serverless Function Checks

The project includes specialized checks for serverless functions, which are particularly important for security.

### Running Serverless Checks

To check only the serverless functions in your project:

```bash
bun run check-serverless
```

This will:
1. Automatically detect serverless function files in your project
2. Run focused security and code quality checks on those files
3. Report any issues that need to be addressed

### Supported Serverless Environments

The script recognizes serverless functions for:
- Netlify Functions
- Vercel Serverless Functions
- API Routes
- Express server endpoints 

## Accessibility Components

This project includes a set of accessible UI components to ensure compliance with WCAG accessibility standards. These components should be used instead of native HTML elements to ensure consistent styling and proper accessibility attributes.

### Available Components

- **AccessibleButton**: A button component with proper ARIA attributes, keyboard navigation, and various styling options
- **AccessibleInput**: A text input component with proper labeling, error states, and screen reader support
- **AccessibleTextarea**: A textarea component with character counting and appropriate ARIA attributes

### Using the Components

```tsx
// Button example
<AccessibleButton 
  onClick={handleClick}
  variant="primary"
  size="md"
  leftIcon={<Icon />}
  ariaLabel="Submit form"
>
  Submit
</AccessibleButton>

// Input example
<AccessibleInput
  label="Email Address"
  type="email"
  value={email}
  onChange={handleChange}
  errorMessage={errors.email}
  helperText="We'll never share your email"
  isRequired
  fullWidth
/>

// Textarea example
<AccessibleTextarea
  label="Comments"
  value={comments}
  onChange={handleChange}
  maxLength={500}
  showCharCount
  resize="vertical"
/>
```

### Benefits

Using these components provides several benefits:
- Consistent styling across the application
- Built-in accessibility features like proper labeling and ARIA attributes
- Error and helper text handling
- Icon support with proper positioning
- State handling (disabled, loading, error states)

## Console Log Replacement Utility

The project includes a utility to replace all console.log statements with a structured logging system. This helps maintain code quality and makes it easier to control logging behavior in different environments.

### Running the Utility

To scan for console statements without replacing them:

```bash
bun run check-console-logs
```

To replace all console statements with the logger utility:

```bash
bun run fix-console-logs
```

### Benefits

The logger utility provides several advantages over direct console usage:

1. **Environment-aware logging**: Automatically adjusts log levels based on the environment
2. **Structured output**: Includes timestamps, log levels, and formatted messages
3. **Error handling**: Properly formats and captures error stacks
4. **Centralized control**: Easily disable all debug logs in production
5. **Easier to extend**: Can be modified to send logs to monitoring services

### Usage

After replacement, instead of:

```js
console.log('User logged in:', user);
console.error('Failed to save:', error);
```

Your code will use:

```js
import logger from '../utils/logger';

logger.debug('User logged in:', user);
logger.error('Failed to save:', error);
```

## UploadThing File Upload Components

This project uses UploadThing for secure file uploads. The implementation includes both server-side functions and client-side React components.

### Setup

1. Sign up for an account at [UploadThing](https://uploadthing.com/) and create a new project
2. Add your UploadThing credentials to your `.env` file:
   ```
   # Server-side
   UPLOADTHING_APP_ID=your_app_id
   UPLOADTHING_SECRET=your_secret_key
   
   # Client-side
   VITE_UPLOADTHING_APP_ID=your_app_id
   ```

### Using the Components

To use the UploadThing components in your React application:

1. Wrap your application with the UploadThing provider:

```jsx
import { UploadThingProvider } from './components/UploadThingProvider';

function App() {
  return (
    <UploadThingProvider>
      {/* Your app components */}
      <YourComponent />
    </UploadThingProvider>
  );
}
```

2. Use the UploadThing component for file uploads:

```jsx
import { UploadThing } from './components/UploadThing';

function YourComponent() {
  const handleUploadComplete = (result) => {
    console.log('Upload completed:', result);
    // Use the returned URL: result.url
  };
  
  const handleUploadError = (error) => {
    console.error('Upload error:', error);
  };
  
  return (
    <div>
      <h2>Upload an Image</h2>
      <UploadThing 
        onUploadComplete={handleUploadComplete}
        onUploadError={handleUploadError}
      />
    </div>
  );
}
```

### Server-Side Implementation

The server-side implementation includes:

1. A file router that handles different file types and sizes
2. Secure token generation for file access
3. Automatic file expiration based on configured retention periods
4. Error handling and validation

For more information, refer to the [UploadThing documentation](https://docs.uploadthing.com/). 