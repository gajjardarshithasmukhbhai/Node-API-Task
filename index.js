require('dotenv').config()

const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
const port = process.env.SERVER_PORT || 3000;

// Define a route to retrieve open positions for a department
app.get('/open-positions', async (req, res) => {
    const departmentValu = req.query.department;

    // Check if the department parameter is provided
    if (!departmentValu) {
        return res.status(400).json({ error: 'Department is required!' });
    }

    try {
        // Make an HTTP request to the Actian Careers page
        const response = await axios.get('https://www.actian.com/company/careers');
        const html = response.data;

        // parse the HTML
        const parseTheHTML = cheerio.load(html);

        // Find all job-posting elements
        const jobPostings = parseTheHTML('.job-posting');

        const jobPostingsData = parseTheHTML('.job-posting');

        const jobTitlLists = [];

        jobPostings.each((index, element) => {
            const jobHeading = parseTheHTML(element).find('.job-heading .department').text().trim();
            const jobContent = parseTheHTML(element).find('.job-content .listing');

            // Check if the department matches from the requested department orn not
            if (jobHeading === departmentValu) {
                jobContent.each((i, listing) => {
                    const jobName = parseTheHTML(listing).find('.job-name').text().trim();
                    const jobPosition = parseTheHTML(listing).find('.job-position').text().trim();
                    jobTitlLists.push({ name: jobName, position: jobPosition });
                });
            }
        });

        // Check if any job titles were found
        if (jobTitlLists.length === 0) {
            return res.status(404).json({ error: 'No department found' });
        }

        // Send the job titles as a JSON response after parsing the data
        res.json({ departmentValu, jobTitlLists });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Start the Express server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
