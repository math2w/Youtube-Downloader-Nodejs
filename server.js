// app.js
const express = require('express');
const ytdl = require('ytdl-core');
const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');
const { request } = require('http');
const ffmpegPath = require('ffmpeg-static').path;
process.on('uncaughtException', function (err) {
  console.error(err);
});

const app = express();
var ytname = "";
// Serve static files (optional)
app.use(express.static('public'));
//ffmpeg.setFfmpegPath(ffmpegPath);


async function getYTInfo(url) {
    await ytdl.getInfo(url).then(info => {
        console.log(info.videoDetails.title);
        title = info.videoDetails.title
        ytname = title;
    })
}

// Define a route for downloading and streaming YouTube videos
app.get('/downloadmp3', async (req, res) => {
    // Get the video URL from the query parameters
    const videoURL = req.query.url; 
  
    // Validate the URL
    if (!ytdl.validateURL(videoURL)) {
      res.status(400).send('Invalid YouTube URL');
      return;
    }
  


    try {
      await getYTInfo(videoURL);  
  
      const sanitizedTitle = ytname.replace(/[^a-zA-Z0-9]/g, '_');
    // Set response headers for video streaming

      // Set response headers for video streaming


      // Pipe the video stream to ffmpeg for conversion and then to response object
      

          const file = ytdl(videoURL, {
            format: 'mp4',
            quality: 'highest'
        })
          res.set('Content-Disposition', `attachment; filename="${sanitizedTitle}.mp3"`);
          res.set('Content-Type', 'audio/mp3');

         ffmpeg(file).toFormat('mp3').save("Videos/" + sanitizedTitle + ".mp3").on("end", (err) => {
          if (err) {
            console.log(err);
          }
          res.sendFile((__dirname + "/Videos/" + sanitizedTitle + ".mp3"), (err) => {
            if (err) {
              console.log("Error " + err)
            } else {
              fs.unlink(("Videos/" + sanitizedTitle + ".mp3"), (err) => {
                if (err) {
                  console.log("error "  + err);
                }
              });
            }
          });

         });
      


      

    } catch (error) {
      console.log('Error:', error);
      res.status(200);
  }

    


});

app.get('/downloadmp4', async (req, res) => {
    // Get the video URL from the query parameters
    const videoURL = req.query.url;
  
    // Validate the URL
    if (!ytdl.validateURL(videoURL)) {
      res.status(400).send('Invalid YouTube URL');
      return;
    }
  
      await getYTInfo(videoURL);  
  
      const sanitizedTitle = ytname.replace(/[^a-zA-Z0-9]/g, '_');
    // Set response headers for video streaming
    res.header('Content-Disposition', `attachment; filename="${sanitizedTitle}.mp4"`);
    res.header('Content-Type', 'video/mp4');
  
    // Pipe the video stream to the response object
    ytdl(videoURL, {
      format: 'mp4',
      quality: 'highest'
    }).pipe(res);
  
  });

// Start the server
const PORT = process.env.PORT || 2000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});