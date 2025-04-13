# REST API Plan

## 1. Resources

- **Users**: Managed by Supabase authentication; includes email, id, created_at, and updated_at.
- **Topics**: Represents categories with hierarchical structure (table: topics) containing fields like id, user_id, name, description, and parent_id.
- **Documents**: Source documents for flashcards (table: documents) with fields id, user_id, name, and content.
- **Flashcards**: Contains flashcard data with original and modified content, source information (ai or manual), modification_percentage, approval status, and a soft delete flag (is_disabled).
- **Study Sessions**: Represents user study sessions with fields such as start_time, end_time, and cards_reviewed.
- **Study Session Results**: Stores results for flashcards review (is_correct, response_time, difficulty_rating, etc.).
- **User Statistics**: Aggregated statistics per user (total_cards_created, total_cards_studied, correct_answers, incorrect_answers, etc.).
- Study Sessions (table: study_sessions) – *Planned for future iteration (Module II)*
- Study Session Results (table: study_session_results) – *Deferred implementation*
- User Statistics (table: user_statistics) – *To be implemented post-MVP*

## 2. Endpoints

### Authentication Endpoints

#### 1. POST /api/auth/register
- **Description**: Register a new user.
- **Request Payload**:
  ```json
  {
    "email": "string",
    "password": "string"
  }
  ```
- **Response Payload**:
  ```json
  {
    "id": "string",
    "email": "string",
    "created_at": "ISODate string",
    "updated_at": "ISODate string"
  }
  ```
- **Success Codes**: 201 Created - "User successfully registered"
- **Error Codes**: 400 Bad Request, 409 Conflict (if email already exists)

#### 2. POST /api/auth/login
- **Description**: Authenticate the user and return a JWT token.
- **Request Payload**:
  ```json
  {
    "email": "string",
    "password": "string"
  }
  ```
- **Response Payload**:
  ```json
  {
    "token": "JWT string",
    "user": {
      "id": "string",
      "email": "string",
      "created_at": "ISODate string",
      "updated_at": "ISODate string"
    }
  }
  ```
- **Success Codes**: 200 OK - "Login successful"
- **Error Codes**: 400 Bad Request, 401 Unauthorized

#### 3. POST /api/auth/logout
- **Description**: Log out the current user.
- **Response Payload**:
  ```json
  {
    "message": "Logout successful"
  }
  ```
- **Success Codes**: 200 OK
- **Error Codes**: 401 Unauthorized

#### 4. POST /api/auth/reset-password
- **Description**: Initiate a password reset process.
- **Request Payload**:
  ```json
  {
    "email": "string"
  }
  ```
- **Response Payload**:
  ```json
  {
    "message": "Password reset instructions sent"
  }
  ```
- **Success Codes**: 200 OK
- **Error Codes**: 400 Bad Request, 404 Not Found

### Topics Endpoints

#### 1. GET /api/topics
- **Description**: Retrieve a list of topics for the authenticated user.
- **Query Parameters**: 
  - `page` (number)
  - `limit` (number)
  - `sort` (string)
  - `parent_id` (string, optional)
- **Response Payload**:
  ```json
  {
    "topics": [
      {
        "id": "string",
        "user_id": "string",
        "name": "string",
        "description": "string",
        "parent_id": "string or null",
        "created_at": "ISODate string",
        "updated_at": "ISODate string"
      }
    ],
    "total": "number"
  }
  ```
- **Success Codes**: 200 OK
- **Error Codes**: 401 Unauthorized, 500 Internal Server Error

#### 2. POST /api/topics
- **Description**: Create a new topic.
- **Request Payload**:
  ```json
  {
    "name": "string",
    "description": "string",
    "parent_id": "string (optional)"
  }
  ```
- **Response Payload**:
  ```json
  {
    "id": "string",
    "user_id": "string",
    "name": "string",
    "description": "string",
    "parent_id": "string or null",
    "created_at": "ISODate string",
    "updated_at": "ISODate string"
  }
  ```
- **Success Codes**: 201 Created
- **Error Codes**: 400 Bad Request, 401 Unauthorized

#### 3. GET /api/topics/{id}
- **Description**: Retrieve details of a specific topic.
- **Response Payload**:
  ```json
  {
    "id": "string",
    "user_id": "string",
    "name": "string",
    "description": "string",
    "parent_id": "string or null",
    "created_at": "ISODate string",
    "updated_at": "ISODate string"
  }
  ```
- **Success Codes**: 200 OK
- **Error Codes**: 401 Unauthorized, 404 Not Found

#### 4. PUT /api/topics/{id}
- **Description**: Update an existing topic.
- **Request Payload** (example):
  ```json
  {
    "name": "string",
    "description": "string"
  }
  ```
- **Response Payload**:
  ```json
  {
    "id": "string",
    "user_id": "string",
    "name": "string",
    "description": "string",
    "parent_id": "string or null",
    "created_at": "ISODate string",
    "updated_at": "ISODate string"
  }
  ```
- **Success Codes**: 200 OK
- **Error Codes**: 400 Bad Request, 401 Unauthorized, 404 Not Found

#### 5. DELETE /api/topics/{id}
- **Description**: Delete a topic.
- **Response Payload**:
  ```json
  {
    "message": "Topic deleted successfully"
  }
  ```
- **Success Codes**: 200 OK
- **Error Codes**: 401 Unauthorized, 404 Not Found

### Documents Endpoints

#### 1. GET /api/documents
- **Description**: Retrieve a list of documents.
- **Query Parameters**: 
  - `page` (number)
  - `limit` (number)
  - `sort` (string)
  - `name` (string, optional for filtering)
- **Response Payload**:
  ```json
  {
    "documents": [
      {
        "id": "string",
        "user_id": "string",
        "name": "string",
        "content": "string",
        "created_at": "ISODate string",
        "updated_at": "ISODate string"
      }
    ],
    "total": "number"
  }
  ```
- **Success Codes**: 200 OK
- **Error Codes**: 401 Unauthorized, 500 Internal Server Error

#### 2. POST /api/documents
- **Description**: Create a new document.
- **Request Payload**:
  ```json
  {
    "name": "string",
    "content": "string"
  }
  ```
- **Response Payload**:
  ```json
  {
    "id": "string",
    "user_id": "string",
    "name": "string",
    "content": "string",
    "created_at": "ISODate string",
    "updated_at": "ISODate string"
  }
  ```
- **Success Codes**: 201 Created
- **Error Codes**: 400 Bad Request, 401 Unauthorized

#### 3. GET /api/documents/{id}
- **Description**: Retrieve details of a specific document.
- **Response Payload**:
  ```json
  {
    "id": "string",
    "user_id": "string",
    "name": "string",
    "content": "string",
    "created_at": "ISODate string",
    "updated_at": "ISODate string"
  }
  ```
- **Success Codes**: 200 OK
- **Error Codes**: 401 Unauthorized, 404 Not Found

#### 4. PUT /api/documents/{id}
- **Description**: Update an existing document.
- **Request Payload**:
  ```json
  {
    "name": "string",
    "content": "string"
  }
  ```
- **Response Payload**:
  ```json
  {
    "id": "string",
    "user_id": "string",
    "name": "string",
    "content": "string",
    "created_at": "ISODate string",
    "updated_at": "ISODate string"
  }
  ```
- **Success Codes**: 200 OK
- **Error Codes**: 400 Bad Request, 401 Unauthorized, 404 Not Found

#### 5. DELETE /api/documents/{id}
- **Description**: Delete a document.
- **Response Payload**:
  ```json
  {
    "message": "Document deleted successfully"
  }
  ```
- **Success Codes**: 200 OK
- **Error Codes**: 401 Unauthorized, 404 Not Found

### Flashcards Endpoints

#### 1. GET /api/flashcards
- **Description**: Retrieve a list of flashcards.
- **Query Parameters**: 
  - `page` (number), `limit` (number), `sort` (string)
  - `document_id` (string), `topic_id` (string)
  - `source` (string, 'ai' or 'manual', optional)
- **Response Payload**:
  ```json
  {
    "flashcards": [
      {
        "id": "string",
        "user_id": "string",
        "document_id": "string or null",
        "topic_id": "string or null",
        "front_original": "string",
        "back_original": "string",
        "front_modified": "string or null",
        "back_modified": "string or null",
        "source": "ai | manual",
        "is_modified": "boolean",
        "is_approved": "boolean",
        "modification_percentage": "number",
        "is_disabled": "boolean",
        "spaced_repetition_data": {},
        "created_at": "ISODate string",
        "updated_at": "ISODate string"
      }
    ],
    "total": "number"
  }
  ```
- **Success Codes**: 200 OK
- **Error Codes**: 401 Unauthorized, 500 Internal Server Error

#### 2. POST /api/flashcards
- **Description**: Create a new flashcard manually.
- **Request Payload**:
  ```json
  {
    "front_original": "string",
    "back_original": "string",
    "document_id": "string (optional)",
    "topic_id": "string (optional)",
    "source": "ai | manual",
    "is_approved": "boolean (optional)"
  }
  ```
- **Response Payload**:
  ```json
  {
    "id": "string",
    "user_id": "string",
    "document_id": "string or null",
    "topic_id": "string or null",
    "front_original": "string",
    "back_original": "string",
    "front_modified": "string or null",
    "back_modified": "string or null",
    "source": "ai | manual",
    "is_modified": "boolean",
    "is_approved": "boolean",
    "modification_percentage": "number",
    "is_disabled": "boolean",
    "spaced_repetition_data": {},
    "created_at": "ISODate string",
    "updated_at": "ISODate string"
  }
  ```
- **Success Codes**: 201 Created
- **Error Codes**: 400 Bad Request, 401 Unauthorized

#### 3. GET /api/flashcards/{id}
- **Description**: Retrieve details of a specific flashcard.
- **Response Payload**:
  ```json
  {
    "id": "string",
    "user_id": "string",
    "document_id": "string or null",
    "topic_id": "string or null",
    "front_original": "string",
    "back_original": "string",
    "front_modified": "string or null",
    "back_modified": "string or null",
    "source": "ai | manual",
    "is_modified": "boolean",
    "is_approved": "boolean",
    "modification_percentage": "number",
    "is_disabled": "boolean",
    "spaced_repetition_data": {},
    "created_at": "ISODate string",
    "updated_at": "ISODate string"
  }
  ```
- **Success Codes**: 200 OK
- **Error Codes**: 401 Unauthorized, 404 Not Found

#### 4. PUT /api/flashcards/{id}
- **Description**: Update a flashcard's content.
- **Request Payload** (example):
  ```json
  {
    "front_modified": "string (optional)",
    "back_modified": "string (optional)"
  }
  ```
- **Response Payload**:
  ```json
  {
    "id": "string",
    "user_id": "string",
    "document_id": "string or null",
    "topic_id": "string or null",
    "front_original": "string",
    "back_original": "string",
    "front_modified": "string or null",
    "back_modified": "string or null",
    "source": "ai | manual",
    "is_modified": "boolean",
    "is_approved": "boolean",
    "modification_percentage": "number",
    "is_disabled": "boolean",
    "spaced_repetition_data": {},
    "created_at": "ISODate string",
    "updated_at": "ISODate string"
  }
  ```
- **Success Codes**: 200 OK
- **Error Codes**: 400 Bad Request, 401 Unauthorized, 404 Not Found

#### 5. DELETE /api/flashcards/{id}
- **Description**: Soft-delete a flashcard by setting `is_disabled` to true.
- **Response Payload**:
  ```json
  {
    "message": "Flashcard deleted successfully"
  }
  ```
- **Success Codes**: 200 OK
- **Error Codes**: 401 Unauthorized, 404 Not Found

##### AI-Generated Flashcards

###### 1. POST /api/flashcards/ai-generate
- **Description**: Generate flashcards automatically using an AI model based on input text.
- **Request Payload**:
  ```json
  {
    "text": "string",
    "document_id": "string (optional)",
    "topic_id": "string (optional)"
  }
  ```
- **Response Payload**:
  ```json
  {
    "flashcards": [
      {
        "id": "string",
        "user_id": "string",
        "document_id": "string or null",
        "topic_id": "string or null",
        "front_original": "string",
        "back_original": "string",
        "front_modified": "string or null",
        "back_modified": "string or null",
        "source": "ai",
        "is_modified": "boolean",
        "is_approved": "boolean",
        "modification_percentage": "number",
        "is_disabled": "boolean",
        "spaced_repetition_data": {},
        "created_at": "ISODate string",
        "updated_at": "ISODate string"
      }
    ]
  }
  ```
- **Success Codes**: 200 OK
- **Error Codes**: 400 Bad Request, 401 Unauthorized

###### 2. POST /api/flashcards/ai-regenerate
- **Description**: Re-generate flashcards based on input text when previous generation was rejected.
- **Request Payload**: (same as ai-generate)
  ```json
  {
    "text": "string",
    "document_id": "string (optional)",
    "topic_id": "string (optional)"
  }
  ```
- **Response Payload**: (same as ai-generate)
  ```json
  {
    "flashcards": [
      {
        "id": "string",
        "user_id": "string",
        "document_id": "string or null",
        "topic_id": "string or null",
        "front_original": "string",
        "back_original": "string",
        "front_modified": "string or null",
        "back_modified": "string or null",
        "source": "ai",
        "is_modified": "boolean",
        "is_approved": "boolean",
        "modification_percentage": "number",
        "is_disabled": "boolean",
        "spaced_repetition_data": {},
        "created_at": "ISODate string",
        "updated_at": "ISODate string"
      }
    ]
  }
  ```
- **Success Codes**: 200 OK
- **Error Codes**: 400 Bad Request, 401 Unauthorized

### Study Sessions Endpoints

#### 1. GET /api/study-sessions
- **Description**: Retrieve a list of study sessions.
- **Query Parameters**: 
  - `page` (number)
  - `limit` (number)
  - `sort` (string)
  - `date` (string in ISO format, optional)
- **Response Payload**:
  ```json
  {
    "study_sessions": [
      {
        "id": "string",
        "user_id": "string",
        "topic_id": "string or null",
        "start_time": "ISODate string",
        "end_time": "ISODate string or null",
        "cards_reviewed": "number",
        "created_at": "ISODate string"
      }
    ],
    "total": "number"
  }
  ```
- **Success Codes**: 200 OK
- **Error Codes**: 401 Unauthorized, 500 Internal Server Error

#### 2. POST /api/study-sessions
- **Description**: Create a new study session.
- **Request Payload**:
  ```json
  {
    "topic_id": "string (optional)"
  }
  ```
- **Response Payload**:
  ```json
  {
    "id": "string",
    "user_id": "string",
    "topic_id": "string or null",
    "start_time": "ISODate string",
    "end_time": "ISODate string or null",
    "cards_reviewed": "number",
    "created_at": "ISODate string"
  }
  ```
- **Success Codes**: 201 Created
- **Error Codes**: 400 Bad Request, 401 Unauthorized

#### 3. GET /api/study-sessions/{id}
- **Description**: Retrieve details of a specific study session.
- **Response Payload**:
  ```json
  {
    "id": "string",
    "user_id": "string",
    "topic_id": "string or null",
    "start_time": "ISODate string",
    "end_time": "ISODate string or null",
    "cards_reviewed": "number",
    "created_at": "ISODate string"
  }
  ```
- **Success Codes**: 200 OK
- **Error Codes**: 401 Unauthorized, 404 Not Found

#### 4. PUT /api/study-sessions/{id}
- **Description**: Update study session details (e.g., end time).
- **Request Payload**:
  ```json
  {
    "end_time": "ISODate string"
  }
  ```
- **Response Payload**:
  ```json
  {
    "id": "string",
    "user_id": "string",
    "topic_id": "string or null",
    "start_time": "ISODate string",
    "end_time": "ISODate string or null",
    "cards_reviewed": "number",
    "created_at": "ISODate string"
  }
  ```
- **Success Codes**: 200 OK
- **Error Codes**: 400 Bad Request, 401 Unauthorized, 404 Not Found

#### 5. DELETE /api/study-sessions/{id}
- **Description**: Optionally cancel a study session.
- **Response Payload**:
  ```json
  {
    "message": "Study session cancelled successfully"
  }
  ```
- **Success Codes**: 200 OK
- **Error Codes**: 401 Unauthorized, 404 Not Found

### Study Session Results Endpoints

#### 1. GET /api/study-session-results
- **Description**: Retrieve a list of study session results.
- **Query Parameters**: 
  - `page` (number)
  - `limit` (number)
  - `sort` (string)
  - `session_id` (string, optional)
- **Response Payload**:
  ```json
  {
    "results": [
      {
        "id": "string",
        "session_id": "string",
        "flashcard_id": "string",
        "is_correct": "boolean",
        "response_time": "number",
        "difficulty_rating": "number or null",
        "created_at": "ISODate string"
      }
    ],
    "total": "number"
  }
  ```
- **Success Codes**: 200 OK
- **Error Codes**: 401 Unauthorized, 500 Internal Server Error

#### 2. POST /api/study-session-results
- **Description**: Record a new study session result.
- **Request Payload**:
  ```json
  {
    "session_id": "string",
    "flashcard_id": "string",
    "is_correct": "boolean",
    "response_time": "number",
    "difficulty_rating": "number (optional)"
  }
  ```
- **Response Payload**:
  ```json
  {
    "id": "string",
    "session_id": "string",
    "flashcard_id": "string",
    "is_correct": "boolean",
    "response_time": "number",
    "difficulty_rating": "number or null",
    "created_at": "ISODate string"
  }
  ```
- **Success Codes**: 201 Created
- **Error Codes**: 400 Bad Request, 401 Unauthorized

#### 3. GET /api/study-session-results/{id}
- **Description**: Retrieve details of a specific study session result.
- **Response Payload**:
  ```json
  {
    "id": "string",
    "session_id": "string",
    "flashcard_id": "string",
    "is_correct": "boolean",
    "response_time": "number",
    "difficulty_rating": "number or null",
    "created_at": "ISODate string"
  }
  ```
- **Success Codes**: 200 OK
- **Error Codes**: 401 Unauthorized, 404 Not Found

### User Statistics Endpoints

#### GET /api/statistics
- **Description**: Retrieve aggregated statistics for the authenticated user.
- **Response Payload**:
  ```json
  {
    "user_id": "string",
    "total_cards_created": "number",
    "total_cards_studied": "number",
    "correct_answers": "number",
    "incorrect_answers": "number",
    "average_response_time": "number",
    "study_streak_days": "number",
    "last_study_date": "ISODate string",
    "created_at": "ISODate string",
    "updated_at": "ISODate string"
  }
  ```
- **Success Codes**: 200 OK
- **Error Codes**: 401 Unauthorized, 500 Internal Server Error

### Future Endpoints (Planned for later modules)

These endpoints are part of the complete system scope but are **not implemented in the current MVP**. They will be added in **Module II – Going LIVE** and beyond.

- Authentication endpoints (register, login, logout, reset password)
- Study session management:
  - `GET /api/study-sessions`
  - `POST /api/study-sessions`
  - `GET /api/study-sessions/{id}` etc.
- Study session results
- User statistics

## 3. Authentication and Authorization

- Authentication will be implemented in **Module II** using Supabase Auth with JWT-based authorization.
- Until then, all endpoints can be tested without secure user sessions. When enabled, protected endpoints will require the header:
  `Authorization: Bearer <token>`
- Supabase RLS (Row Level Security) is leveraged to ensure that users only access their own data.
- Endpoints related to user registration and login are public, while all other endpoints require authentication.

## 4. Validation and Business Logic

- **Data Validation**: 
  - Ensure required fields are provided (e.g., flashcards require both front_original and back_original).
  - Validate text lengths and data types according to the database schema.
  - Enforce unique constraints (e.g., unique topic names per user and parent combination).

- **Business Logic**:
  - Flashcard updates trigger database triggers that compute the modification percentage. The API simply passes the modified fields (`front_modified` and `back_modified`).
  - AI-generated flashcards endpoints validate the input text and ensure previous rejections are handled appropriately (rejected flashcards are preserved for audit).
  - List endpoints support pagination, sorting, and filtering through query parameters (e.g., filtering flashcards by document_id or topic_id).

- **Error Handling**:
  - Endpoints return relevant HTTP status codes (400 for bad requests, 401 for unauthorized, 404 for not found, 500 for server errors) along with descriptive error messages.
  - Input sanitation and validation occur at the API layer to prevent invalid data from reaching the database.

- **Security and Performance**:
  - Rate limiting, logging, and input sanitation are implemented at the gateway or middleware level to protect the system.
  - Indexes defined in the schema (e.g., on user_id, topic_id) are leveraged to optimize query performance for list endpoints.