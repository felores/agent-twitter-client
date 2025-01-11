# Twitter Agent MCP Server Implementation Plan

This document outlines the implementation plan for creating an MCP server that integrates with the agent-twitter-client to provide thread retrieval, tweet creation, and Grok research capabilities.

## 1. Project Structure
```
mcp-twitter-agent/
├── src/
│   ├── server.ts            # Main MCP server implementation
│   ├── tools/               # Tool implementations
│   │   ├── thread.ts        # Thread retrieval tool
│   │   ├── tweet.ts         # Tweet creation tool
│   │   ├── grok.ts          # Grok research tool
│   │   ├── timeline.ts     # New
│   │   ├── media.ts        # New
│   │   └── user.ts        # New
│   ├── auth/              # New auth directory
│   │   ├── cookie.ts
│   │   ├── bearer.ts
│   │   └── token-manager.ts
│   ├── config/              # Configuration handling
│   │   ├── cookies.ts       # Cookie management
│   │   └── env.ts          # Environment configuration
│   └── types/              # Type definitions
└── config/
    └── cookies.json        # Cookie storage file
```

## 2. Core Features

### 2.1. Cookie Management
- Create a `cookies.json` file format:
```json
{
  "auth_token": "...",
  "ct0": "...",
  "twid": "..."
}
```
- Environment variable in MCP config:
```json
{
  "env": {
    "TWITTER_COOKIES_PATH": "./config/cookies.json"
  }
}
```

### 2.2. Tool Implementations

#### Thread Retrieval Tool
```typescript
{
  name: "get_thread_urls",
  description: "Retrieves all tweets with URLs from a thread",
  inputSchema: {
    type: "object",
    properties: {
      tweet_id: {
        type: "string",
        description: "ID of any tweet in the thread"
      }
    },
    required: ["tweet_id"]
  }
}
```

#### Tweet Creation Tool
```typescript
{
  name: "create_tweet",
  description: "Creates a new tweet with optional media attachments",
  inputSchema: {
    type: "object",
    properties: {
      text: {
        type: "string",
        description: "Tweet content"
      },
      reply_to: {
        type: "string",
        description: "Optional tweet ID to reply to"
      },
      media: {
        type: "array",
        description: "Array of media URLs or file paths to attach",
        items: {
          type: "object",
          properties: {
            url: {
              type: "string",
              description: "URL or file path of the media"
            },
            type: {
              type: "string",
              enum: ["photo", "video", "gif"],
              description: "Type of media"
            },
            alt_text: {
              type: "string",
              description: "Alternative text for accessibility"
            }
          },
          required: ["url", "type"]
        },
        maxItems: 4  // Twitter's limit for media attachments
      }
    },
    required: ["text"]
  }
}
```

#### Grok Research Tool
```typescript
{
  name: "grok_research",
  description: "Uses Grok for research and followup questions",
  inputSchema: {
    type: "object",
    properties: {
      query: {
        type: "string",
        description: "Research question"
      },
      conversation_id: {
        type: "string",
        description: "Optional conversation ID for followups"
      }
    },
    required: ["query"]
  }
}
```

#### Media Operations Tools

##### Upload Media
```typescript
{
  name: "upload_media",
  description: "Uploads media files to Twitter",
  inputSchema: {
    type: "object",
    properties: {
      media_type: {
        type: "string",
        enum: ["photo", "video", "gif"],
        description: "Type of media to upload"
      },
      file_path: {
        type: "string",
        description: "Path to the media file"
      },
      alt_text: {
        type: "string",
        description: "Alternative text for accessibility"
      },
      chunked: {
        type: "boolean",
        description: "Whether to use chunked upload (required for videos > 5MB)",
        default: false
      },
      media_category: {
        type: "string",
        enum: ["tweet_image", "tweet_video", "tweet_gif"],
        description: "Media category for processing"
      }
    },
    required: ["media_type", "file_path"]
  }
}
```

##### Attach Media
```typescript
{
  name: "attach_media",
  description: "Attaches uploaded media to a tweet",
  inputSchema: {
    type: "object",
    properties: {
      tweet_id: {
        type: "string",
        description: "ID of the tweet to attach media to"
      },
      media_ids: {
        type: "array",
        items: {
          type: "string"
        },
        description: "Array of media IDs to attach"
      },
      alt_texts: {
        type: "object",
        description: "Map of media IDs to alt texts"
      }
    },
    required: ["tweet_id", "media_ids"]
  }
}
```

##### Media Status
```typescript
{
  name: "get_media_status",
  description: "Checks the processing status of uploaded media",
  inputSchema: {
    type: "object",
    properties: {
      media_id: {
        type: "string",
        description: "ID of the media to check"
      }
    },
    required: ["media_id"]
  }
}
```

### 2.3. Media Processing Implementation

#### Media Upload Flow
```typescript
interface MediaUploadFlow {
  // Phase 1: INIT
  initUpload(): Promise<{
    media_id: string;
    expires_after_secs: number;
  }>;

  // Phase 2: APPEND (chunked upload)
  appendChunk(chunk: Buffer, segment_index: number): Promise<void>;

  // Phase 3: FINALIZE
  finalizeUpload(): Promise<{
    media_id: string;
    processing_info?: {
      state: string;
      check_after_secs: number;
    };
  }>;

  // Phase 4: STATUS (for videos)
  checkStatus(): Promise<{
    media_id: string;
    state: 'pending' | 'in_progress' | 'failed' | 'succeeded';
    progress_percent?: number;
  }>;
}
```

#### Media Categories
```typescript
enum MediaCategory {
  TWEET_IMAGE = 'tweet_image',
  TWEET_VIDEO = 'tweet_video',
  TWEET_GIF = 'tweet_gif',
  DM_IMAGE = 'dm_image',
  DM_VIDEO = 'dm_video',
  DM_GIF = 'dm_gif'
}
```

#### Media Processing States
```typescript
interface MediaProcessingState {
  state: 'pending' | 'in_progress' | 'failed' | 'succeeded';
  check_after_secs?: number;
  progress_percent?: number;
  error?: {
    code: number;
    message: string;
    name: string;
  };
}
```

#### Chunked Upload Configuration
```typescript
interface ChunkedUploadConfig {
  chunk_size: number;        // Default: 5MB
  max_retries: number;       // Default: 3
  concurrent_chunks: number; // Default: 4
  retry_delay: number;       // Default: 1000ms
}
```

## 3. Implementation Steps

### 3.1. Server Setup
1. Create base MCP server class
2. Implement protocol handlers
3. Set up stdio transport
4. Configure capabilities

### 3.2. Cookie Management
1. Create cookie file loader
2. Implement cookie validation
3. Add cookie refresh mechanism
4. Set up environment variable handling

### 3.3. Tool Implementation
1. Thread Tool:
   - Integrate with `Scraper.getTweet`
   - Add URL extraction logic
   - Implement thread traversal
   - Add error handling

2. Tweet Tool:
   - Integrate with tweet creation API
   - Add rate limiting handling
   - Implement media upload support
   - Add error handling

3. Grok Tool:
   - Integrate with `Scraper.grokChat`
   - Implement conversation state management
   - Add response formatting
   - Handle rate limits

4. Media Tool:
   - Implement media upload flow:
     * INIT phase for upload initialization
     * APPEND phase for chunked uploads
     * FINALIZE phase for upload completion
     * STATUS phase for processing monitoring
   - Add support for different media types:
     * Images (PNG, JPEG, WebP)
     * Videos (MP4, MOV)
     * GIFs (Animated GIFs)
   - Implement chunked upload manager:
     * Chunk size optimization
     * Concurrent chunk uploads
     * Progress tracking
     * Error recovery
   - Add media processing monitors:
     * Status polling
     * Progress tracking
     * Error handling
     * Timeout management
   - Implement media attachment system:
     * Single media attachment
     * Multiple media attachment
     * Alt text management
     * Media metadata handling
   - Add validation and optimization:
     * File size validation
     * Format validation
     * Media optimization
     * Metadata validation

### 3.4. Media Processing Workflow

1. Upload Process:
```typescript
async function handleMediaUpload(file: MediaFile) {
  // 1. Validate file
  validateMediaFile(file);

  // 2. Initialize upload
  const { media_id } = await initUpload({
    media_type: file.type,
    total_bytes: file.size,
    media_category: determineCategory(file)
  });

  // 3. Handle upload based on size
  if (file.size > CHUNKED_UPLOAD_THRESHOLD) {
    await handleChunkedUpload(file, media_id);
  } else {
    await handleDirectUpload(file, media_id);
  }

  // 4. Finalize and process
  await finalizeUpload(media_id);

  // 5. Monitor processing (for videos/GIFs)
  if (requiresProcessing(file.type)) {
    await monitorProcessing(media_id);
  }

  return media_id;
}
```

2. Chunked Upload Process:
```typescript
async function handleChunkedUpload(file: MediaFile, media_id: string) {
  const chunks = splitIntoChunks(file);
  const uploadQueue = new ConcurrentQueue(CONCURRENT_CHUNKS);

  for (const [index, chunk] of chunks.entries()) {
    await uploadQueue.add(async () => {
      await uploadChunk(media_id, chunk, index);
    });
  }
}
```

3. Processing Monitor:
```typescript
async function monitorProcessing(media_id: string) {
  while (true) {
    const status = await checkMediaStatus(media_id);
    
    if (status.state === 'succeeded') break;
    if (status.state === 'failed') {
      throw new MediaProcessingError(status.error);
    }

    await sleep(status.check_after_secs * 1000);
  }
}
```

### 3.5. Media Error Handling

1. Upload Errors:
```typescript
class MediaUploadError extends Error {
  constructor(
    message: string,
    public phase: 'INIT' | 'APPEND' | 'FINALIZE',
    public retryable: boolean,
    public mediaId?: string
  ) {
    super(message);
  }
}
```

2. Processing Errors:
```typescript
class MediaProcessingError extends Error {
  constructor(
    message: string,
    public state: MediaProcessingState,
    public mediaId: string
  ) {
    super(message);
  }
}
```

3. Error Recovery:
```typescript
async function handleMediaError(error: MediaUploadError | MediaProcessingError) {
  if (error instanceof MediaUploadError && error.retryable) {
    return await retryUpload(error.mediaId);
  }
  
  if (error instanceof MediaProcessingError) {
    return await handleProcessingError(error);
  }

  throw error;
}
```

### 3.6. Media Utilities

1. File Validation:
```typescript
interface MediaValidation {
  validateSize(file: MediaFile): boolean;
  validateFormat(file: MediaFile): boolean;
  validateDimensions(file: MediaFile): boolean;
  validateDuration(file: MediaFile): boolean;
}
```

2. Media Optimization:
```typescript
interface MediaOptimization {
  optimizeImage(file: ImageFile): Promise<OptimizedImage>;
  optimizeVideo(file: VideoFile): Promise<OptimizedVideo>;
  optimizeGif(file: GifFile): Promise<OptimizedGif>;
}
```

3. Progress Tracking:
```typescript
interface UploadProgress {
  totalBytes: number;
  uploadedBytes: number;
  chunks: {
    total: number;
    uploaded: number;
    failed: number;
  };
  processingStatus?: MediaProcessingState;
}
```

## 4. Error Handling
- Implement proper error codes
- Add rate limit handling
- Add retry mechanisms
- Validate all inputs
- Handle authentication errors

## 5. Security
- Secure cookie storage
- Input sanitization
- Rate limiting
- Access control
- Error message sanitization

## 6. Example Usage

### MCP Client Configuration
```json
{
  "mcpServers": {
    "twitter-agent": {
      "command": "twitter-agent-mcp",
      "env": {
        "TWITTER_COOKIES_PATH": "./config/cookies.json"
      }
    }
  }
}
```

### Example Tool Calls

1. Get Thread URLs
```json
{
  "method": "call_tool",
  "params": {
    "name": "get_thread_urls",
    "args": {
      "tweet_id": "1234567890"
    }
  }
}
```

2. Create Tweet
```json
{
  "method": "call_tool",
  "params": {
    "name": "create_tweet",
    "args": {
      "text": "Hello world!",
      "reply_to": "1234567890"
    }
  }
}
```

3. Grok Research
```json
{
  "method": "call_tool",
  "params": {
    "name": "grok_research",
    "args": {
      "query": "What are the latest developments in AI?"
    }
  }
}
```

## 7. Implementation Notes

### 7.1. Cookie Management
- Store cookies securely in JSON format
- Load cookies at server startup
- Validate cookie format and expiration
- Provide mechanism for cookie refresh

### 7.2. Rate Limiting
- Implement rate limit tracking per tool
- Add exponential backoff
- Provide rate limit status in responses

### 7.3. Error Handling
- Detailed error messages
- Proper error codes
- Recovery mechanisms
- Logging for debugging

### 7.4. State Management
- Store Grok conversation state
- Handle session persistence
- Clean up old sessions

## 8. Development Workflow

1. Initial Setup
   - Create project structure
   - Set up TypeScript configuration
   - Install dependencies
   - Configure development environment

2. Core Implementation
   - Implement MCP server base
   - Add cookie management
   - Create tool interfaces

3. Tool Development
   - Implement each tool individually
   - Add comprehensive testing
   - Document usage and examples

4. Testing & Validation
   - Unit tests for each component
   - Integration tests
   - Security testing
   - Performance testing

5. Documentation
   - API documentation
   - Usage examples
   - Configuration guide
   - Troubleshooting guide

## 9. Future Enhancements

1. Additional Features
   - Media handling in tweets
   - Thread composition
   - Advanced search capabilities
   - Analytics integration

2. Performance Optimizations
   - Caching mechanisms
   - Connection pooling
   - Request batching
   - Response streaming

3. Security Enhancements
   - Token rotation
   - Request signing
   - Audit logging
   - Access control lists

## 10. Error Handling Enhancements

### 10.1. Rate Limit Handling

#### Rate Limit Handler
```typescript
interface RateLimitHandler {
  retryAfter: number;
  limitType: 'app' | 'user' | 'endpoint';
  resetTime: Date;
  currentUsage: number;
  maxUsage: number;
}

#### Automatic Retry Mechanisms
```typescript
const handleRateLimit = async (error: RateLimitError) => {
  if (error.retryAfter) {
    await sleep(error.retryAfter);
    return retryRequest();
  }
};
```

## 11. Security Enhancements

### 11.1. Token Manager
```typescript
interface TokenManager {
  refreshToken: () => Promise<void>;
  validateToken: () => boolean;
  rotateTokens: () => Promise<void>;
}

const tokenManager = {
  refreshInterval: 1000 * 60 * 60, // 1 hour
  async startRefreshCycle() {
    setInterval(this.refreshToken, this.refreshInterval);
  }
};
```
