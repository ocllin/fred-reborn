const axios = require('axios')
const { setIntervalAsync } = require('set-interval-async/dynamic')
const { HtmlDiffer } = require('html-differ')

const scrapeURL = 'https://support.discord.com/hc/en-us/articles/12620128861463' // Replace with the URL you want to scrape
const scrapeInterval = 10 * 60 * 1000 // 10 minutes

const htmlDiffer = new HtmlDiffer()

async function scrapeSite() {
    try {
        const response = await axios.get(scrapeURL, {
            headers: {
                accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
                'sec-ch-ua': 'Chromium";v="112", "Google Chrome";v="112", "Not:A-Brand";v="99"',
                'sec-ch-ua-platform': '"Windows"',
                'sec-fetch-dest': 'document',
                'sec-fetch-mode': 'navigate',
                'sec-fetch-site': 'none',
                'sec-fetch-user': '?1',
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36',
            },
        })
        return response.data
    } catch (error) {
        console.error(`Error scraping site: ${error}`)
    }
}

async function compareHtml(html1, html2) {
    const differences = htmlDiffer.diffHtml(html1, html2)
    return differences
}

async function scheduleScrape(onChange) {
    let previousHtml = await scrapeSite()

    setIntervalAsync(async () => {
        const currentHtml = await scrapeSite()
        const differences = await compareHtml(previousHtml, currentHtml)

        if (differences.length > 0) {
            onChange(differences)
        }

        previousHtml = currentHtml
    }, scrapeInterval)
}

module.exports = {
    scheduleScrape,
}
