const YtDlpWrap = require('yt-dlp-wrap').default
const path = require('path')
const fs = require('fs')
const { spawn } = require('child_process')

// Ensure paths are correct
const YT_DLP_PATH = 'C:\\bin\\yt-dlp.exe'
const FFMPEG_PATH = 'C:\\bin\\ffmpeg.exe'
const DOWNLOAD_DIRECTORY = path.join(__dirname, '..', '..', '..', 'downloads')

const ytDlpWrap = new YtDlpWrap(YT_DLP_PATH)

if (!fs.existsSync(DOWNLOAD_DIRECTORY)) {
    fs.mkdirSync(DOWNLOAD_DIRECTORY, { recursive: true })
}

function sanitizeFileName(fileName) {
    return fileName.replace(/[<>:"\/\\|?*\x00-\x1F]/g, '_').replace(/[\u{0080}-\u{FFFF}]/gu, '_')
}

async function reencodeVideo(inputPath, outputPath) {
    return new Promise((resolve, reject) => {
        const args = ['-i', inputPath, '-c:v', 'libx264', '-crf', '23', '-preset', 'medium', '-c:a', 'aac', '-b:a', '128k', outputPath]
        const ffmpegProcess = spawn(FFMPEG_PATH, args, { windowsHide: true })

        ffmpegProcess.on('error', (error) => {
            console.error(`Error re-encoding video: ${error.message}`)
            reject(`Error re-encoding video: ${error.message}`)
        })

        ffmpegProcess.on('close', (code) => {
            if (code !== 0) {
                reject(`ffmpeg process exited with code ${code}`)
            } else {
                resolve()
            }
        })
    })
}

async function downloadVideo(url) {
    const outputTemplate = path.join(DOWNLOAD_DIRECTORY, '%(id)s.%(ext)s')
    try {
        const output = await new Promise((resolve, reject) => {
            const ytDlpProcess = spawn(
                YT_DLP_PATH,
                [url, '-f', 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/mp4', '-o', outputTemplate, '--merge-output-format', 'mp4'],
                { windowsHide: true }
            )

            ytDlpProcess.on('error', (error) => {
                console.error(`Error downloading video: ${error.message}`)
                reject(error)
            })

            ytDlpProcess.on('close', (code) => {
                if (code !== 0) {
                    reject(new Error(`yt-dlp process exited with code ${code}`))
                } else {
                    resolve()
                }
            })
        })

        // Get the latest downloaded file, ignoring temporary or incomplete files
        const files = fs.readdirSync(DOWNLOAD_DIRECTORY).filter((file) => !file.endsWith('.part') && !file.includes('Frag') && !file.includes('ytdl'))
        console.log(`Files in download directory: ${files}`)

        if (files.length === 0) {
            throw new Error('No valid files found in download directory')
        }

        const latestFile = files
            .map((file) => ({
                name: file,
                time: fs.statSync(`${DOWNLOAD_DIRECTORY}/${file}`).mtime.getTime(),
            }))
            .sort((a, b) => b.time - a.time)[0].name
        console.log(`Latest downloaded file: ${latestFile}`)

        const inputPath = path.join(DOWNLOAD_DIRECTORY, latestFile)
        const sanitizedFileName = sanitizeFileName(path.parse(latestFile).name)
        const outputPath = path.join(DOWNLOAD_DIRECTORY, `${sanitizedFileName}_encoded.mp4`)
        console.log(`Sanitized file name: ${sanitizedFileName}`)

        await reencodeVideo(inputPath, outputPath)
        fs.unlinkSync(inputPath) // Remove the original file after re-encoding

        return outputPath
    } catch (error) {
        console.error(`Error in downloadVideo function:`, error)
        throw new Error(`Error downloading video: ${error.message || error}`)
    }
}

module.exports = { downloadVideo }
