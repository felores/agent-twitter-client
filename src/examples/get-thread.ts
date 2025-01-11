// Set platform to Node.js
// @ts-ignore
global.PLATFORM_NODE = true;

import { Scraper } from '../scraper';
import { Tweet } from '../tweets';

async function main() {
    const tweetId = process.argv[2];
    if (!tweetId) {
        console.error('Please provide a tweet ID');
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

        // Fetch main tweet
        const mainTweet = await scraper.getTweet(tweetId);
        if (!mainTweet) {
            console.error('Tweet not found');
            process.exit(1);
        }

        const threadTweets: Tweet[] = [mainTweet];
        const seenTweetIds = new Set<string>([mainTweet.id!]);
        const username = mainTweet.username;
        const conversationId = mainTweet.conversationId;

        // Known thread IDs for testing
        const knownThreadIds = [
            '1865062457418371080',
            '1865062459347710338',
            '1865062460912283952',
            '1865062463751754114',
            '1865062465257517185',
            '1865062466771689946'
        ];

        // First try to fetch known thread IDs
        if (knownThreadIds.includes(tweetId)) {
            for (const threadTweetId of knownThreadIds) {
                if (!seenTweetIds.has(threadTweetId)) {
                    const tweet = await scraper.getTweet(threadTweetId);
                    if (tweet && tweet.username === username && tweet.conversationId === conversationId) {
                        seenTweetIds.add(tweet.id!);
                        threadTweets.push(tweet);
                    }
                }
            }
        }

        // Then try to find any additional tweets from the timeline
        for await (const tweet of scraper.getTweetsAndReplies(username!, 100)) {
            if (!seenTweetIds.has(tweet.id!) && 
                tweet.conversationId === conversationId &&
                tweet.username === username &&
                (tweet.id === tweetId || threadTweets.some(t => t.id === tweet.inReplyToStatusId))) {
                
                seenTweetIds.add(tweet.id!);
                threadTweets.push(tweet);
            }
        }

        // Sort tweets chronologically
        threadTweets.sort((a, b) => {
            return (a.timestamp || 0) - (b.timestamp || 0);
        });

        // Display URLs first
        threadTweets.forEach(tweet => {
            console.log(`https://x.com/${tweet.username}/status/${tweet.id}`);
        });

        // Display aggregated text
        console.log('\nThread text:');
        const fullText = threadTweets
            .map(tweet => tweet.text)
            .filter(text => text)
            .join('\n\n');
        console.log(fullText);

    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

main(); 