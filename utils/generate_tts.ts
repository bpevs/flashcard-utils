import { join } from 'jsr:@std/path@0.216'
import { ensureDir } from 'jsr:@std/fs@0.216'
import { writeAll } from 'jsr:@std/io@0.216'
import { Deck, Note } from 'jsr:@flashcard/core@0.0.1'

const audioDir = './audio'

export default async function generateAudio(
  deck: Deck,
  options: {
    locale: string
    voiceId: string
    apiRegion: string
    apiKey: string
    fromField: string
  },
): Promise<Deck> {
  const { locale, voiceId, apiRegion, apiKey, fromField } = options
  await ensureDir(audioDir)
  const existingAudioFiles: Set<string> = new Set()

  Array.from(Deno.readDirSync(audioDir))
    .filter(({ name }) => /.*\.mp3$/.test(name))
    .forEach((file) => existingAudioFiles.add(file.name.normalize('NFC')))

  const notes = Object.values(deck.notes)
    .filter((note: Note) => !existingAudioFiles.has(getAudioFilename(note.id)))
    .slice(0, 100)

  const texts = notes.map((note: Note) => note.content[fromField])
  const tempAudio = await ttsAzure(texts, locale, voiceId, apiRegion, apiKey)
  console.log('source audio id: ', JSON.stringify(tempAudio))
  if (!tempAudio) throw new Error('tts failed')
  console.log('source audio saved: ', tempAudio)
  await writeAudioFiles(notes, tempAudio)
  await Deno.remove('temp.mp3')
  return deck
}

async function ttsAzure(
  texts: string[],
  locale: string,
  voiceId: string,
  apiRegion: string,
  apiKey: string,
): Promise<string | null> {
  const SILENCE_REQUEST = 2
  const url =
    `https://${apiRegion}.tts.speech.microsoft.com/cognitiveservices/v1`
  console.log(apiRegion, apiKey, voiceId, locale, texts)
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Ocp-Apim-Subscription-Key': apiKey,
      'Content-Type': 'application/ssml+xml',
      'X-Microsoft-OutputFormat': 'audio-16khz-128kbitrate-mono-mp3',
      'User-Agent': 'curl',
    },
    body: `
      <speak version='1.0' xml:lang='${locale}'>
        <voice name='${voiceId}' xml:lang='${locale}'>
          ${texts.join(`, <break time="${SILENCE_REQUEST}s"/> `)}
        </voice>
      </speak>
    `,
  })
  if (response.status > 399) {
    console.warn(response)
    return null
  }
  const filePath = `./temp.mp3`
  const file = await Deno.open(filePath, { create: true, write: true })
  const arrayBuffer = new Uint8Array(await response.arrayBuffer())
  await writeAll(file, arrayBuffer)
  return filePath
}

//  1. Splits a joined translation audio clip
//  2. Writes files for each translation, naming appropriately
async function writeAudioFiles(notes: Note[], sourceURL: string) {
  const MATCH_SILENCE =
    /silence_start: ([\w\.]+)[\s\S]+?silence_end: ([\w\.]+)/g
  const MAX_NOISE_LEVEL = -40
  const SILENCE_SPLIT = 1
  const DETECT_STR =
    `silencedetect=noise=${MAX_NOISE_LEVEL}dB:d=${SILENCE_SPLIT}`

  try {
    await Deno.mkdir(audioDir, { recursive: true })
  } catch { /* Dir Exists */ }

  const detectSilence = new Deno.Command('ffmpeg', {
    stdout: 'piped',
    args: ['-i', sourceURL, '-af', DETECT_STR, '-f', 'null', '-'],
  })

  const detectSilenceResult = (await detectSilence.output()).stderr
  const detectSilenceOutput = new TextDecoder().decode(detectSilenceResult)

  let match = MATCH_SILENCE.exec(detectSilenceOutput)
  let clipStartMS = 0
  let count = 0

  while (match) {
    const [_, nextSilenceStartS, nextSilenceEndS] = match
    const nextSilenceStartMS = Math.round(1000 * parseFloat(nextSilenceStartS))

    // 0.1 is so we don't clip the beginning of the audio gen
    const nextSilenceEndMS = Math.round(
      1000 * (parseFloat(nextSilenceEndS) - 0.1),
    )

    const key = notes[count].id
    count = count + 1

    const outFile = join(audioDir, getAudioFilename(key))
    const seek = Math.max(0, clipStartMS) + 'ms'

    // 0.1 to maintain length after shifting nextSilenceEndMS
    const len = nextSilenceStartMS - (clipStartMS + 0.1) + 'ms'

    const convert = new Deno.Command('ffmpeg', {
      stdout: 'piped',
      args: ['-ss', seek, '-t', len, '-i', sourceURL, '-c:a', 'copy', outFile],
    })
    await convert.output()
    clipStartMS = nextSilenceEndMS
    match = MATCH_SILENCE.exec(detectSilenceOutput)
  }

  // last file
  const key = notes[count]?.id
  if (!key) {
    console.warn(`Careful about mismatching: ${sourceURL}`)
    return
  }
  count = count + 1

  const outFile = join(audioDir, getAudioFilename(key))
  const seek = Math.max(0, clipStartMS) + 'ms'
  const args = ['-ss', seek, '-i', sourceURL, '-c:a', 'copy', outFile]
  const convert = new Deno.Command('ffmpeg', { stdout: 'piped', args })
  await convert.output()

  console.log(notes.length, count)
}

export function getAudioFilename(key: string): string {
  const replacement = ''
  return `${key}.mp3`
    .toLowerCase()
    .normalize('NFC')
    .replace(/[\/\?<>\\:\*\|"]/g, replacement) // illegal
    // deno-lint-ignore no-control-regex
    .replace(/[\x00-\x1f\x80-\x9f]/g, replacement) // control
    .replace(/^\.+$/, replacement) // reserved
    .replace(/^(con|prn|aux|nul|com[0-9]|lpt[0-9])(\..*)?$/i, replacement) // windowsReserved
    .replace(/[\. ]+$/, replacement) // windowsTrailingRe
    .replace(/(\,|\;|\:|\s|\(|\))+/g, '-')
}
