const { spawnSync } = require('child_process');

const zipFile = (pathToFolder) => {
    // zip /tmp/archive.zip /tmp/output/*
    const result = spawnSync('zip', ['-r', '/tmp/archive.zip', pathToFolder], {
        cwd: process.cwd(),
    });

    if (result.status == 0) {
        console.log(result.output.toString());
        return 'File successfully zipped.';
    }

    throw new Error('File could not be zipped: ' + result.output.toString());
};

module.exports = zipFile;
