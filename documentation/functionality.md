# Twitter Client Library Functionality Documentation

## Table of Contents
1. [Setup and Installation](#setup-and-installation)
2. [Authentication](#authentication)
3. [Core API Functionality](#core-api-functionality)
4. [Tweet Operations](#tweet-operations)
5. [Timeline Operations](#timeline-operations)
6. [User Operations](#user-operations)
7. [Search Operations](#search-operations)
8. [Media Operations](#media-operations)
9. [Spaces Operations](#spaces-operations)
10. [Direct Messages](#direct-messages)
11. [Error Handling](#error-handling)

## Setup and Installation

### System Requirements
- Node.js 16.x or higher
- TypeScript 5.0.4 or higher
- npm or yarn package manager

### Installation
```bash
npm install agent-twitter-client
# or
yarn add agent-twitter-client
```

### Dependencies
#### Core Dependencies
- `@roamhq/wrtc`: ^0.8.0 - WebRTC implementation
- `@sinclair/typebox`: ^0.32.20 - Runtime type system
- `headers-polyfill`: ^3.1.2 - Headers implementation
- `twitter-api-v2`: ^1.18.2 - Twitter API v2 client
- `undici`: ^7.1.1 - HTTP/1.1 client
- `ws`: ^8.18.0 - WebSocket client
- `tough-cookie`: ^4.1.4 - Cookie jar implementation
- `otpauth`: ^9.2.2 - 2FA authentication support

#### Development Dependencies
- TypeScript ecosystem:
  - `typescript`: ^5.0.4
  - `@typescript-eslint/eslint-plugin`: ^5.59.7
  - `@typescript-eslint/parser`: ^5.59.7
  - `@tsconfig/node16`: ^16.1.3
- Build tools:
  - `rollup`: ^4.18.0
  - `esbuild`: ^0.21.5
  - `rimraf`: ^5.0.7
- Testing:
  - `jest`: ^29.7.0
  - `ts-jest`: ^29.1.0
- Code quality:
  - `eslint`: ^8.41.0
  - `prettier`: ^2.8.8

### Configuration
1. Create a `.env` file in your project root (based on `.env.example`):
```env
# For v1 API support
TWITTER_USERNAME=myaccount
TWITTER_PASSWORD=MyPassword!!!
TWITTER_EMAIL=myemail@gmail.com

# For v2 API support
TWITTER_API_KEY=key
TWITTER_API_SECRET_KEY=secret
TWITTER_ACCESS_TOKEN=token
TWITTER_ACCESS_TOKEN_SECRET=tokensecret

# Optional
PROXY_URL=           # HTTP(s) proxy for requests
```

### Build Setup
1. Install dependencies:
```bash
npm install
```

2. Build the project:
```bash
npm run build
```

3. Run tests:
```bash
npm test
```

### Project Structure
```
src/
├── examples/        # Example implementations
├── platform/        # Core platform functionality
├── types/          # TypeScript type definitions
├── spaces/         # Spaces-related functionality
└── tests/          # Test files
```

### Available Scripts
- `npm run build`: Build the project
- `npm run prepare`: Prepare for npm publish
- `npm run docs:generate`: Generate documentation
- `npm run docs:deploy`: Deploy documentation
- `npm run format`: Format code with prettier
- `npm run test`: Run test suite

## Authentication
The library provides robust authentication mechanisms through the `TwitterAuth` class:
- Cookie-based authentication
- Bearer token authentication
- Support for multiple user sessions
- Automatic token refresh handling

## Core API Functionality
### Base API Features
- RESTful API request handling
- Request/Response transformation capabilities
- Rate limiting management
- Error handling and recovery
- Cookie jar management

### API Endpoints
- Support for both v1.1 and v2 Twitter API endpoints
- Automatic API version selection based on endpoint
- Custom request headers and parameters

## Tweet Operations
### Reading Tweets
- `getTweet(id)`: Fetch single tweet by ID
- `getTweets(user, maxTweets)`: Get user's tweets
- `getTweetsAndReplies(user, maxTweets)`: Get user's tweets and replies
- `getTweetWhere(tweets, query)`: Find specific tweets matching criteria
- `getLatestTweet(user)`: Get user's most recent tweet

### Tweet Creation
- `createCreateTweetRequest()`: Create standard tweets
- `createCreateNoteTweetRequest()`: Create longer notes
- `createCreateLongTweetRequest()`: Create threads
- `createQuoteTweetRequest()`: Quote existing tweets

### Tweet Interactions
- `likeTweet(tweetId)`: Like a tweet
- `retweet(tweetId)`: Retweet content
- Support for viewing tweet analytics (views, likes, retweets)

### Media Handling
- Support for photos, videos, and GIFs
- Media upload functionality
- Chunked video upload support
- Alt text support for accessibility

## Timeline Operations
### Timeline Types
- Home timeline
- User timeline
- List timeline
- Search timeline
- Following timeline

### Timeline Features
- Cursor-based pagination
- Tweet filtering
- Conversation threading
- Timeline search capabilities

## User Operations
### Profile Management
- Get user profile information
- Update profile settings
- Manage profile media

### Relationship Operations
- Follow/Unfollow users
- Get followers/following lists
- Block/Mute management
- Relationship status checking

## Search Operations
- Advanced search queries
- Real-time search results
- Filter by media type, users, or keywords
- Geolocation-based search

## Media Operations
### Upload Capabilities
- Image upload
- Video upload with chunking
- GIF support
- Media metadata management

### Media Types Support
- Photos (PNG, JPEG, etc.)
- Videos (MP4, MOV, etc.)
- Animated GIFs
- Alt text and accessibility features

## Spaces Operations
- List available spaces
- Join/leave spaces
- Space metadata retrieval
- Space participant management

## Direct Messages
- Send/receive direct messages
- Media in direct messages
- Conversation management
- Message timeline retrieval

## Error Handling
### Error Types
- Network errors
- API errors
- Rate limiting errors
- Authentication errors

### Error Recovery
- Automatic retry mechanisms
- Rate limit handling
- Token refresh on authentication errors
- Detailed error reporting

## Advanced Features
### Polling and Real-time Updates
- Support for poll creation
- Poll vote management
- Real-time tweet streaming
- Event handling

### Data Types
- Comprehensive TypeScript types
- Input validation
- Response parsing
- Data transformation utilities

### Utilities
- URL expansion
- Entity parsing
- Text formatting
- Date handling

## Best Practices
1. Always handle rate limits appropriately
2. Use proper error handling
3. Implement retry mechanisms for failed requests
4. Keep authentication tokens secure
5. Monitor API usage and quotas
6. Cache responses when appropriate
7. Use TypeScript types for better code reliability

## Security Considerations
1. Secure token storage
2. API key management
3. Rate limiting protection
4. Error message sanitization
5. Safe cookie handling
