import fs from 'fs';
import cheerio from 'cheerio';
import fetch from 'node-fetch';

async function fetchContributionActivity() {
    const username = process.env.GH_USERNAME; // Access GitHub username from repository secret
    const accessToken = process.env.GH_ACCESS_TOKEN; // Access GitHub access token from repository secret

    try {
        const response = await fetch(`https://api.github.com/users/${username}/events`, {
            headers: {
                Authorization: `token ${accessToken}`
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch GitHub contribution activity: ${response.status}`);
        }

        const events = await response.json();
        return events;
    } catch (error) {
        console.error('Error fetching GitHub contribution activity:', error);
        return null;
    }
}

async function updateIndexHtml() {
    try {
        const events = await fetchContributionActivity();

        if (events && events.length > 0) {
            // Read index.html file
            const indexHtml = fs.readFileSync('index.html', 'utf8');
            const $ = cheerio.load(indexHtml);

            // Process and update contribution data in index.html
            const contributionList = $('<ul></ul>');
            events.forEach(event => {
                contributionList.append(`<li>${event.type} at ${event.created_at}</li>`);
            });

            // Update the content of the contribution-container element in index.html
            $('#contribution-container').empty().append(contributionList);

            // Save the changes back to index.html
            fs.writeFileSync('index.html', $.html());
        }
    } catch (error) {
        console.error('Error updating index.html:', error);
    }
}

// Call the function to update index.html
updateIndexHtml();
