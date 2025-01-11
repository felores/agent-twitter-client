// Set platform to Node.js
// @ts-ignore
global.PLATFORM_NODE = true;

import { Scraper } from '../scraper';
import { Tweet } from '../tweets';

async function main() {
    // Get thread ID from command line arguments
    const threadId = process.argv[2];
    if (!threadId) {
        console.error('Please provide a thread ID as an argument');
        console.error('Usage: npx ts-node -T src/examples/get-thread.ts <threadId>');
        process.exit(1);
    }

    try {
        // Initialize the scraper
        const scraper = new Scraper();

        // Set the cookies for authentication
        await scraper.setCookies([
            `auth_token=61fb0d11f41b671322e1dfcccb69867341cecee6; Domain=twitter.com; Path=/`,
            `ct0=86804a314ccf10918a03bf3c7f5f28be59912c9c310ec8a00c369a8ec9f35b88a218bc2a778a2df62693b59cef103fb776a45021e4df3543d79bfaa23d843d63ab75767d3b54052cc1066274c2e384fe; Domain=twitter.com; Path=/`,
            `twid=u%3D497038272; Domain=twitter.com; Path=/`
        ]);
        
        console.log(`Fetching thread ${threadId}...`);
        const mainTweet = await scraper.getTweet(threadId);
        
        if (!mainTweet) {
            console.error('Tweet not found');
            return;
        }

        console.log('Main tweet found:', mainTweet.id);

        // Known thread IDs
        const knownThreadIds = [
            '1865062457418371080',
            '1865062459347710338',
            '1865062460912283952',
            '1865062463751754114',
            '1865062465257517185',
            '1865062466771689946'
        ];

        console.log('Fetching thread tweets...');
        
        // Try fetching tweets one by one first
        const threadTweets: Tweet[] = [];
        for (const tweetId of knownThreadIds) {
            console.log(`Fetching tweet ${tweetId}...`);
            const tweet = await scraper.getTweet(tweetId);
            if (tweet) {
                threadTweets.push(tweet);
                console.log(`Found tweet: ${tweet.id}`);
            } else {
                console.log(`Failed to fetch tweet ${tweetId}`);
            }
        }

        if (threadTweets.length === 0) {
            console.error('No tweets were found');
            return;
        }

        // Sort tweets by time to maintain thread order
        threadTweets.sort((a, b) => {
            return (a.timestamp || 0) - (b.timestamp || 0);
        });

        // Generate and display URLs
        console.log('\nThread URLs in order:');
        threadTweets.forEach((tweet, index) => {
            if (tweet.username && tweet.id) {
                const tweetUrl = `https://x.com/${tweet.username}/status/${tweet.id}`;
                console.log(`${index + 1}. ${tweetUrl}`);
            }
        });

    } catch (error) {
        console.error('Error:', error);
    }
}

main(); 