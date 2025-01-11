// Set platform to Node.js
// @ts-ignore
global.PLATFORM_NODE = true;

import { Scraper } from '../scraper';
import { SearchMode } from '../search';

async function main() {
    try {
        // Initialize the scraper
        const scraper = new Scraper();

        // Set the cookies
        await scraper.setCookies([
            `auth_token=61fb0d11f41b671322e1dfcccb69867341cecee6; Domain=twitter.com; Path=/`,
            `ct0=86804a314ccf10918a03bf3c7f5f28be59912c9c310ec8a00c369a8ec9f35b88a218bc2a778a2df62693b59cef103fb776a45021e4df3543d79bfaa23d843d63ab75767d3b54052cc1066274c2e384fe; Domain=twitter.com; Path=/`,
            `twid=u%3D497038272; Domain=twitter.com; Path=/`
        ]);

        // Test if we're logged in
        console.log('Testing authentication...');
        const profile = await scraper.getProfile('elfelorestrepo');
        console.log('Profile:', profile);

        // Test getting some tweets
        console.log('\nFetching recent tweets...');
        const tweets = [];
        for await (const tweet of scraper.searchTweets('from:elfelorestrepo', 5, SearchMode.Latest)) {
            tweets.push(tweet);
        }
        console.log('Recent tweets:', tweets);

    } catch (error) {
        console.error('Error:', error);
    }
}

main(); 