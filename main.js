const express = require('express');
const { spawn } = require('child_process');
const app = express();
const zip = require('./zip-file');
const upload = require('./upload');
const axios = require('axios');

app.get('/', (req, res) => {
    res.send('Globe generation service is operational.');
});

app.get('/generate', (req, res) => {
    const commandHead = 'xvfb-run';
    const commandArguments = ['-a', 'blender', '-b', 'globe.blend', '-P', 'rotate.py', '--render-output', '/tmp/output/globe-', '-a', '--'];

    // Applies arguments that have been provided
    if (req.query.destination_frame) commandArguments.push('--destination_frame', req.query.destination_frame);
    if (req.query.origin_latitude) commandArguments.push('--origin_latitude', req.query.origin_latitude);
    if (req.query.origin_longitude) commandArguments.push('--origin_longitude', req.query.origin_longitude);
    if (req.query.destination_latitude) commandArguments.push('--destination_latitude', req.query.destination_latitude);
    if (req.query.destination_longitude) commandArguments.push('--destination_longitude', req.query.destination_longitude);

    const childProcess = spawn(commandHead, commandArguments, {
        cwd: process.cwd(),
    });

    const commandString = commandHead + ' ' + commandArguments.join(' ');
    console.log(`Running command: ${commandString}`);
    childProcess.stdout.on('data', (data) => {
        console.log(data.toString());
    });

    childProcess.stderr.on('data', (data) => {
        console.error(data.toString());
    });

    childProcess.on('close', async (code) => {
        console.log(`child process exited with code ${code}`);

        const zipResult = zip('/tmp/output/');
        const uploadResult = upload('/tmp/archive.zip');

        const iftttResult = axios
            .post('https://maker.ifttt.com/trigger/file_uploaded/with/key/' + process.env.IFTTT_KEY, {
                value1: uploadResult.link,
            })
            .then((response) => {
                console.log('IFTTT webhook successfully sent.');
            })
            .catch((error) => {
                console.error('IFTTT webhook could not be sent.');
            });

        console.log(uploadResult);
    });

    res.send({ data: { message: 'Rendering process has started', arguments: commandArguments } });
});

const port = 3000;
app.listen(port, () => {
    console.log(`Globe generation service listening at http://localhost:${port}`);
});
