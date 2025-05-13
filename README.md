# 10xCards

## Project Description
10xCards is a cutting-edge card management application designed to simplify the creation, management, and sharing of digital cards. Built with modern technologies, the project aims to deliver a fast, scalable, and user-friendly experience suitable for both personal and professional use.

## Tech Stack
- **Astro 5**: A modern static site generator for building fast websites.
- **TypeScript 5**: Enhances code quality and maintainability with static type-checking.
- **React 19**: Powers dynamic user interfaces with interactive components.
- **Tailwind CSS 4**: Provides utility-first styling for rapid UI development.
- **Shadcn/ui**: Offers a consistent set of pre-designed UI components.
- **Node**: Version specified in the `.nvmrc` file for compatibility.

## Getting Started Locally
To run 10xCards on your local machine, follow these steps:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/MaChilicki/10xCards.git
   cd 10xCards
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Ensure you are using the correct Node version:**
   Check the `.nvmrc` file for the required Node version.
4. **Configure environment variables:**
   Create a `.env` file based on `.env.example` and set your OpenRouter API key:
   ```bash
   OPENROUTER_API_KEY=your_api_key_here
   OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
   OPENROUTER_DEFAULT_MODEL=openai/gpt-4.1
   ```
5. **Start the development server:**
   ```bash
   npm run dev
   ```

## Available Scripts
- **npm run dev**: Launches the development server.
- **npm run build**: Builds the project for production.
- **npm run preview**: Previews the production build locally.
- **npm run lint**: Runs the linter to check for code quality issues.
- **npm run test**: Executes tests (if configured).

## Testing Infrastructure
The project employs robust testing methodologies at different levels:

### Unit Testing
- **Vitest (^3.1.1)**: A fast Vite-native unit testing framework
- **@testing-library/react (^16.3.0)**: For testing React components
- **@testing-library/dom**: For testing Astro components
- **jsdom (^26.1.0)**: Browser environment for running tests
- **Codecov**: For tracking test coverage

### End-to-End Testing
- **Playwright**: For comprehensive browser-based end-to-end tests across Chromium, Firefox, and WebKit

## Project Scope
The scope of 10xCards includes:
- A robust and scalable card management system.
- Responsive and dynamic user interfaces.
- Core features such as card creation, editing, organization, and sharing.
- Potential integration of user authentication and real-time collaboration.
- An architecture designed for continuous development and future feature enhancements.

## OpenRouter Service
The application includes an OpenRouter service for AI-powered features. The service is implemented in `src/lib/services/openrouter.service.ts` and provides the following functionality:

### Configuration
```typescript
const config: OpenRouterConfig = {
  apiKey: process.env.OPENROUTER_API_KEY,
  baseUrl: process.env.OPENROUTER_BASE_URL,
  defaultModel: process.env.OPENROUTER_DEFAULT_MODEL,
  defaultParams: {
    parameter: 1.0,
    top_p: 1.0,
    frequency_penalty: 0.0,
    presence_penalty: 0.0
  }
};
```

### Usage
```typescript
const openRouter = new OpenRouterService(config);

// Basic chat completion
const response = await openRouter.chat(
  "You are a helpful assistant",
  "What is the capital of France?"
);

// With custom parameters
const response = await openRouter.chat(
  "You are a helpful assistant",
  "What is the capital of France?",
  {
    model: "openai/gpt-4",
    parameter: 0.7,
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "capital_response",
        strict: true,
        schema: {
          type: "object",
          properties: {
            capital: { type: "string" },
            country: { type: "string" }
          }
        }
      }
    }
  }
);
```

### Error Handling
The service includes comprehensive error handling for:
- Network errors (`NetworkError`)
- API errors (`ApiError`)
- Validation errors (`ValidationError`)

All errors include descriptive messages and appropriate error codes where applicable.

### Retry Mechanism
The service implements an exponential backoff retry mechanism with jitter for handling transient failures:
- Maximum 3 retry attempts
- Initial delay of 1 second
- Maximum delay of 10 seconds
- Random jitter (±100ms) to prevent thundering herd

## Project Status
The 10xCards application is currently under active development. Ongoing updates and new features are being implemented to improve functionality and user experience.

## Detailed Testing Information

### Unit Tests (Vitest)

The project utilizes Vitest for unit testing React components and other modules.

```bash
# Run all unit tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with code coverage
npm run test:coverage

# Run tests in UI mode
npm run test:ui
```

Unit test structure:
- `tests/unit/` - unit tests for components and functions
- `tests/utils/` - test utilities and helpers

#### Covered Areas

The project includes unit tests for the following areas:
- **Services**:
  - `openrouter.service.ts` - OpenRouter API integration tests
  - `topics.service.ts` - Topic management functionality tests
  - `logger.service.ts` - Logging service tests
  - `ai-generate.service.ts` - AI generation service tests
  - `documents.service.ts` - Document management service tests
- **API Endpoints**:
  - Document operations endpoints
  - AI content generation endpoints
  - Flashcard management endpoints
- **Frontend Components**:
  - Document management interface components
  - Document views and editing interfaces
  - Flashcard management user interface

### End-to-End Tests (Playwright)

The project uses Playwright for E2E tests that verify application functionality in the browser.

```bash
# Run all E2E tests
npm run test:e2e

# Run E2E tests in UI mode
npm run test:e2e:ui

# Run E2E tests in debug mode
npm run test:e2e:debug

# Display E2E test report
npm run test:e2e:report
```

E2E test structure:
- `tests/e2e/` - end-to-end tests
- `tests/e2e/pages/` - page objects (Page Object Model)
- `tests/e2e/fixtures/` - test data

### Testing Best Practices

1. **For Unit Tests (Vitest):**
   - Use `vi.fn()` for mock functions
   - Apply `vi.mock()` for module mocking
   - Leverage `beforeEach()` and `afterEach()` for setup and cleanup
   - Implement snapshot tests for UI components
   - Always test edge cases and error handling

2. **For E2E Tests (Playwright):**
   - Implement Page Object Model for better test organization
   - Use locators instead of CSS/XPath selectors
   - Apply test isolation through browser contexts
   - Utilize screenshots for visual comparisons
   - Implement API tests alongside UI tests

## License
This project is licensed under the MIT License. 