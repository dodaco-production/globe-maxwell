const { spawnSync } = require('child_process');

const uploadFile = (filePath) => {
    const result = spawnSync('curl', ['-F', 'file=@' + filePath, 'https://file.io'], {
        cwd: process.cwd(),
    });
    console.log(result.output.toString());

    if (result.status == 0) {
        const resultString = result.stdout.toString();
        const resultJson = JSON.parse(resultString);

        console.log('File has been uploaded on link ' + resultJson.link);
        return { success: true, link: resultJson.link };
    }

    throw new Error('File could not be uploaded: ' + result.output.toString());
};

module.exports = uploadFile;
