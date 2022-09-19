const TikTokScraper = require('tiktok-scraper');
const got = require('got');
const { createWriteStream } = require("fs");
const puppeteer = require('puppeteer');
const tiktokChannels = ['765560518155960351', '900750065977655316']

module.exports = {
    name: 'messageCreate',
    async execute(message) {
        if (tiktokChannels.includes(message.channelId) && message.content.includes('tiktok.com')) {
            this.getTiktokVideo(message)
        }
    },
    async getTiktokVideo(message) {
        var tiktok_URL = message.content.match(/\bhttps?:\/\/\S+/gi)[0];

        // Tiktok Information
        const headers = {
            "User-Agent": "dab-bot2",
            "Referer": "https://www.tiktok.com/",
            "Cookie": "tt_webid_v2=dab-bot2"
        }
        var url, videoMeta = "";

        // Puppeteer
        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36');
        page.goto(tiktok_URL);
        await page.waitForNavigation();
        url = await page.url();
        await browser.close();

        // Set information for Tiktok-Scraper
        try {
            videoMeta = await TikTokScraper.getVideoMeta(url, headers);
            url = videoMeta.collector[0].videoUrl
        } catch (err) {
            console.log(err);
            return;
        }

        // Stream download & IO handling
        const downloadStream = got.stream(url, { headers: videoMeta.headers });
        const fileWriterStream = createWriteStream('out.mp4');

        fileWriterStream
            .on("error", (error) => {
                console.error(`Could not write file to system: ${error.message}`);
            })
            .on("finish", () => {
                message.channel.send({
                    files: ['./out.mp4']
                })
            });

        downloadStream.pipe(fileWriterStream);
    }
}