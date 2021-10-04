const { demuxProbe, createAudioResource } = require('@discordjs/voice');

const createAudio = async (readableStream) => {
	const { stream, type } = await demuxProbe(readableStream);
	return createAudioResource(stream, { inputType: type });
}

module.exports = createAudio;