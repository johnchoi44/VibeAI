const PlayHT = require('playht');
const fs = require('fs');

PlayHT.init({
    apiKey: 'bc90d27b726c49f99926d52d2332581f',
    userId: 'Lvx8l5PtyeZ0NfosCYmoNkd4Jal2',
    defaultVoiceId: 's3://voice-cloning-zero-shot/d82d246c-148b-457f-9668-37b789520891/adolfosaad/manifest.json',
    defaultVoiceEngine: 'PlayHT2.0',
});

async function main() {
    // Generate audio
    const generated = await PlayHT.generate('Computers can speak now!');
    const { audioUrl } = generated;
    console.log('The url for the audio file is', audioUrl);

    // Clone voice
    const fileBlob = fs.readFileSync('voice-to-clone.mp3');
    const clonedVoice = await PlayHT.clone('Trump', fileBlob, 'male');
    console.log('Cloned voice info\n', JSON.stringify(clonedVoice, null, 2));

    // Stream cloned voice
    const fileStream = fs.createWriteStream('hello-trump.mp3');
    const stream = await PlayHT.stream('Cloned voices sound realistic too.', {
        voiceEngine: clonedVoice.voiceEngine,
        voiceId: clonedVoice.id,
    });
    stream.pipe(fileStream);
}

// Call the async function
main().catch(err => console.error('Error:', err));

