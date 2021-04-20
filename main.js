const express = require('express');
const { spawn } = require('child_process');
const app = express();

app.get('/', (req, res) => {
    res.send('Globe generation service is operational.');
});

app.get('/generate', (req, res) => {
    const commandHead = '/Applications/Blender.app/Contents/MacOS/Blender';
    const commandArguments = ['-b', 'globe.blend', '-P', 'rotate.py', '-a', '--'];

    // Applies arguments that have been provided
    if (req.query.destination_frame) commandArguments.push('--destination_frame', req.query.destination_frame);
    if (req.query.origin_latitude) commandArguments.push('--origin_latitude', req.query.origin_latitude);
    if (req.query.origin_longitude) commandArguments.push('--origin_longitude', req.query.origin_longitude);
    if (req.query.destination_latitude) commandArguments.push('--destination_latitude', req.query.destination_latitude);
    if (req.query.destination_longitude) commandArguments.push('--destination_longitude', req.query.destination_longitude);

    const childProcess = spawn(commandHead, commandArguments);

    const commandString = commandHead + ' ' + commandArguments.join(' ');
    console.log(`Running command: ${commandString}`);
    childProcess.stdout.on('data', (data) => {
        console.log(data.toString());
    });

    childProcess.stderr.on('data', (data) => {
        console.error(data.toString());
    });

    childProcess.on('close', (code) => {
        console.log(`child process exited with code ${code}`);
    });

    res.send({ data: { message: 'Rendering process has started', arguments: commandArguments } });
});

const port = 3000;
app.listen(port, () => {
    console.log(`Globe generation service listening at http://localhost:${port}`);
});
