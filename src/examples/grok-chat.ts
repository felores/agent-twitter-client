// Set platform to Node.js
// @ts-ignore
global.PLATFORM_NODE = true;

import { Scraper } from '../scraper';
import { GrokChatResponse, GrokChatOptions } from '../grok';
import * as fs from 'fs';
import * as path from 'path';

// Store the last conversation state
const STATE_FILE = path.join(__dirname, '.grok-state.json');

// Helper function to clean and format the response
function formatResponse(response: GrokChatResponse): void {
    // Print the main message
    console.log('\nGrok:', response.message);

    // If there are web results, print them in a compact format
    if (response.webResults && Array.isArray(response.webResults)) {
        console.log('\nSources:');
        response.webResults.forEach((result: any, index: number) => {
            if (result.url) {
                console.log(`${index + 1}. ${result.url}`);
            }
        });
    }

    // If there's rate limit info, show it compactly
    if (response.rateLimit?.isRateLimited) {
        console.log('\nRate limit:', response.rateLimit.message);
    }
}

// Save conversation state
function saveState(response: GrokChatResponse) {
    const state = {
        conversationId: response.conversationId,
        messages: response.messages
    };
    fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

// Load conversation state
function loadState() {
    try {
        if (fs.existsSync(STATE_FILE)) {
            return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
        }
    } catch (error) {
        console.error('Error loading previous conversation state');
    }
    return null;
}

async function main() {
    // Parse command line arguments
    const args = process.argv.slice(2);
    let isFollowup = false;
    let query = '';

    // Check for followup flag
    if (args[0] === '-f' || args[0] === '--followup') {
        isFollowup = true;
        query = args.slice(1).join(' ');
    } else {
        query = args.join(' ');
    }

    // Show usage if no query provided
    if (!query) {
        console.log('Usage:');
        console.log('  Ask question:     research "your question here"');
        console.log('  Ask follow-up:    research -f "your follow-up question"');
        return;
    }
    
    // Initialize the scraper
    const scraper = new Scraper();

    try {
        // Set the cookies for authentication
        await scraper.setCookies([
            `auth_token=61fb0d11f41b671322e1dfcccb69867341cecee6; Domain=twitter.com; Path=/`,
            `ct0=86804a314ccf10918a03bf3c7f5f28be59912c9c310ec8a00c369a8ec9f35b88a218bc2a778a2df62693b59cef103fb776a45021e4df3543d79bfaa23d843d63ab75767d3b54052cc1066274c2e384fe; Domain=twitter.com; Path=/`,
            `twid=u%3D497038272; Domain=twitter.com; Path=/`
        ]);

        let chatOptions: GrokChatOptions = {
            messages: [{ role: 'user' as const, content: query }]
        };

        // If this is a follow-up, load previous conversation state
        if (isFollowup) {
            const state = loadState();
            if (state) {
                console.log('\nContinuing previous conversation...');
                chatOptions = {
                    conversationId: state.conversationId,
                    messages: [...state.messages, { role: 'user' as const, content: query }]
                };
            } else {
                console.log('\nNo previous conversation found. Starting new conversation...');
            }
        } else {
            console.log('\nStarting new conversation...');
        }

        console.log(`\nQuestion: "${query}"`);
        const response = await scraper.grokChat(chatOptions);
        formatResponse(response);

        // Save conversation state for potential follow-ups
        saveState(response);

    } catch (error: any) {
        console.error('Error:', error);
    }
}

// Run the example
main().catch(console.error); 