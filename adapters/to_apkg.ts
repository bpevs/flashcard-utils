// To a Uint8Array that can be written to a .apkg file
import { Deck } from '@flashcard/core'
import { crypto } from 'jsr:@std/crypto@0.216'
import initSqlJs from 'npm:sql.js@1.10.2'
import JSZip from 'npm:jszip@3.10.1'

type Media = Array<{ name: string; data: Blob }>

export default function toAPKG(
  deck: Deck,
  options: { sortField?: string; media?: Media } = {},
): Promise<Uint8Array> {
  return writeToArray(deck, options.sortField, options.media)
}

/**
 * The following block is adapted from previous iterations of mkanki and genanki
 *
 * [mkanki]{@link https://github.com/nornagon/mkanki}
 * @copyright Copyright (c) 2018 Jeremy Apthorp
 * @license AGPL-3.0 License
 *
 * [genanki]{@link https://github.com/kerrickstaley/genanki}
 * @copyright Copyright (c) Kerrick Staley 2021
 * @license The MIT License
 *
 * [genanki-js]{@link https://github.com/krmanik/genanki-js}
 * @copyright Copyright (c) 2021 Mani
 * @license AGPL-3.0 License
 */
interface DeckProps {
  id: number
  name: string
  newToday: [number, number]
  revToday: [number, number]
  lrnToday: [number, number]
  timeToday: [number, number]
  conf: number
  usn: number
  desc: string
  dyn: boolean | number
  collapsed: boolean
  extendNew: number
  extendRev: number
}

interface AnkiTemplate {
  name: string
  qfmt: string // question template
  afmt: string // answer template
  ord?: number
  did?: number // deckId
  bqfmt?: string
  bafmt?: string
}

interface AnkiField {
  name: string
  ord?: number | null
  sticky?: boolean
  rtl?: boolean
  font?: string
  size?: number
  media?: { name: string; data: string }[]
}

interface Model {
  id: number
  sortf: number // sort field
  did: number // deck id
  latexPre: string
  latexPost: string
  mod: number // modification time
  usn: number // unsure, something to do with sync?
  vers: [] // seems to be unused
  type: number
  css: string
  tags: string[]
  name: string
  flds: Array<AnkiField>
  tmpls: AnkiTemplate[]
  req: Array<[number, 'any' | 'all', number[]]>
}

const defaultDeck: DeckProps = {
  id: 0,
  name: '',
  newToday: [0, 0], // currentDay, count
  revToday: [0, 0],
  lrnToday: [0, 0],
  timeToday: [0, 0], // time in ms
  conf: 1,
  usn: 0,
  desc: '',
  dyn: 0,
  collapsed: false,
  // added in beta11
  extendNew: 10,
  extendRev: 50,
}

async function writeToArray(
  deck: Deck,
  sortField: string | void,
  media: Media = [],
) {
  const { id, fields = [], watch = [] } = deck
  const sortFieldIndex = Math.max(sortField ? fields.indexOf(sortField) : 0, 0)
  const fieldNames = fields.map((name) => ({ name }))
  fieldNames.unshift(fieldNames.splice(sortFieldIndex, 1)[0])

  const guidComponentNames = (watch.length) ? watch : fields

  const decksArr: Array<{
    id: number
    name: string
    desc: string
    notes: Array<{
      model: Model
      fields: string[]
      tags: string[]
      guid: string
    }>
  }> = [{
    id: deck.idNum,
    name: deck.name,
    desc: deck.desc,
    notes: Object.values(deck.notes).map((note) => ({
      model: {
        id: deck.idNum || 0,
        name: deck.name || '',
        did: deck.idNum || 1,
        css: `.card {
          font-family: arial;
          font-size: 20px;
          text-align: center;
          color: black;
          background-color: white;
        }`,
        latexPre: `\\documentclass[12pt]{article}
         \\special{papersize=3in,5in}
         \\usepackage[utf8]{inputenc}
         \\usepackage{amssymb,amsmath}
         \\pagestyle{empty}
         \\setlength{\\parindent}{0in}
         \\begin{document}`,
        latexPost: '\\end{document}',
        sortf: 0,
        tags: [],
        type: 0,
        usn: 0,
        vers: [],
        req: deck.getTemplates().map((_, index) => [index, 'all', [0]]),
        flds: (fieldNames || [])
          .map((field: Partial<AnkiField>, ord: number): AnkiField => ({
            name: field.name || '',
            ord,
            sticky: field.sticky || false,
            rtl: field.rtl || false,
            font: field.font || 'Arial',
            size: field.size || 20,
            media: field.media || [],
          })),
        tmpls: deck.getTemplates()
          .map((template) => ({
            name: template.id,
            qfmt: template.question,
            afmt: template.answer,
          }))
          .map((tmpl: Partial<AnkiTemplate>, ord: number): AnkiTemplate => ({
            name: '',
            qfmt: '',
            afmt: '',
            bqfmt: '',
            bafmt: '',
            ord,
            did: deck.idNum,
            ...tmpl,
          })),
        mod: new Date().getTime() || 0,
      },
      fields: fieldNames.map(({ name }) => String(note.content[name])),
      tags: [],
      guid: ankiHash(
        [id].concat(guidComponentNames
          .map((field) => String(note.content[field]))),
      ),
    })),
  }]

  const SQL = await initSqlJs()
  const db = new SQL.Database()
  db.run(ANKI_SCHEMA)

  const now = new Date()
  const models: { [id: number]: Model } = {}
  const decks: { [id: string]: DeckProps } = {}

  // AnkiDroid failed to import subdeck, So add a Default deck
  decks['1'] = { ...defaultDeck, id: 1, name: 'Default' }

  decksArr.forEach(({ id, name, notes, desc }) => {
    notes.forEach(({ model }) => models[model.id] = model)
    decks[id] = { ...defaultDeck, id, name, desc }
  })

  db.prepare(`INSERT INTO col
       (id, crt, mod, scm, ver, dty, usn, ls, conf, models, decks, dconf, tags)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run([
    null, // id
    (+now / 1000) | 0, // crt
    +now, // mod
    +now, // scm
    11, // ver
    0, // dty
    0, // usn
    0, // ls

    // conf (default Conf)
    JSON.stringify({
      activeDecks: [1],
      curDeck: 1,
      // newSpread: Should new cards be mixed, shown first, or last?
      newSpread: 0, // DISTRIBUTE = 0, LAST, FIRST
      collapseTime: 1200,
      timeLim: 0,
      estTimes: true,
      dueCounts: true,
      curModel: null,
      nextPos: 1,
      sortType: 'noteFld',
      sortBackwards: false,
      addToCur: true, // add new to currently selected deck?
      dayLearnFirst: false,
    }),
    JSON.stringify(models), // models
    JSON.stringify(decks), // decks
    // dconf (default deck configuration)
    JSON.stringify({
      1: {
        id: 1,
        name: 'Default',
        new: {
          delays: [1, 10],
          ints: [1, 4, 7], // 7 is not currently used
          initialFactor: 2500, // STARTING_FACTOR
          separate: true,
          order: 1, // RANDOM = 0, DUE = 1
          perDay: 20,
          bury: false, // may not be set on old decks
        },
        lapse: {
          delays: [10],
          mult: 0,
          minInt: 1,
          leechFails: 8,
          leechAction: 0, // SUSPEND = 0, TAG_ONLY = 1
        },
        rev: {
          perDay: 200,
          ease4: 1.3,
          fuzz: 0.05,
          minSpace: 1, // not currently used
          ivlFct: 1,
          maxIvl: 36500,
          bury: false, // may not be set on old decks
          hardFactor: 1.2,
        },
        maxTaken: 60,
        timer: 0,
        autoplay: true,
        replayq: true,
        mod: 0,
        usn: 0,
      },
    }),
    JSON.stringify({}), // tags
  ])

  const insert_note = db.prepare(`INSERT INTO notes\
    (id, guid, mid, mod, usn, tags, flds, sfld, csum, flags, data)\
    VALUES (null, ?, ?, ?, ?, ?, ?, ?, 0, 0, '')`)

  const insert_card = db.prepare(`INSERT INTO cards\
    (id, nid, did, ord, mod, usn, type, queue, due, ivl, factor, reps, lapses, left, odue, odid, flags, data)\
    VALUES (null, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, 0, 0, 0, 0, 0, 0, '')`)

  let due = 0
  const mod = (+now / 1000) | 0
  const usn = -1
  const sfld = 0

  for (const deck of decksArr) {
    for (const note of deck.notes) {
      const { model, fields } = note
      const { id: mid, req } = model
      const tags = note.tags == null ? '' : note.tags.join(' ')
      const flds = fields.join('\x1f')
      insert_note.run([note.guid, mid, mod, usn, tags, flds, sfld])

      const nid = db.exec('select last_insert_rowid();')[0]['values'][0][0]
      const type = 0 // (0=new, 1=learning, 2=due)
      const queue = 0 // (queue -1 for suspended)

      const exists = (ord: number) =>
        fields[ord] && fields[ord].toString().trim().length

      for (const [tmplIdx, any_or_all, req_fields_index] of req) {
        const passesReqs =
          ((any_or_all === 'any') && req_fields_index.some(exists)) ||
          ((any_or_all === 'all') && req_fields_index.every(exists))
        if (passesReqs) {
          insert_card.run([nid, deck.id, tmplIdx, mod, usn, type, queue, due])
        }
      }

      due++
    }
  }

  const zip = new JSZip()

  zip.file('collection.anki2', new Uint8Array(db.export()).buffer)

  const media_name: { [id: number]: string } = {}

  media.forEach((media, idx) => {
    zip.file(idx.toString(), media.data)
    media_name[idx] = media.name
  })

  zip.file('media', JSON.stringify(media_name))

  const blob = await zip.generateAsync({
    type: 'blob',
    mimeType: 'application/apkg',
  })

  return new Uint8Array(await blob.arrayBuffer())
}

// dumped from an anki with the sqlite3 cli's '.schema' command
const ANKI_SCHEMA = `
PRAGMA foreign_keys=OFF;
BEGIN TRANSACTION;

/* there's only one |col| row in the db. */
CREATE TABLE col (
    id              integer primary key,
    crt             integer not null, /* creation time (seconds since epoch) */
    mod             integer not null, /* modification time (millis since epoch) */
    scm             integer not null, /* schema modified (millis since epoch) */
    ver             integer not null, /* Anki schema version, 11 at time of writing */
    dty             integer not null, /* no longer used */
    usn             integer not null, /* not sure, looks like it has something to do with sync? 0 in new deck. */
    ls              integer not null, /* last sync (millis since epoch) */
    conf            text not null, /* json, see defaultConf */
    models          text not null, /* json, in form { [modelId]: Model }. see defaultModel. */
    decks           text not null,
    dconf           text not null, /* { [deckId]: DeckConf } */
    tags            text not null  /* { [tagName]: usn } */
);

CREATE TABLE notes (
    id              integer primary key,   /* 0 */
    guid            text not null,         /* 1 */
    mid             integer not null,      /* 2 */  /* model id */
    mod             integer not null,      /* 3 */  /* modification time, (seconds since epoch) */
    usn             integer not null,      /* 4 */
    tags            text not null,         /* 5 */  /* space-separated string */
    flds            text not null,         /* 6 */  /* \\x1f-separated field strings */
    sfld            integer not null,      /* 7 */  /* unsure, something to do with sorting? */
    csum            integer not null,      /* 8 */  /* checksum, can be ignored according to genanki */
    flags           integer not null,      /* 9 */  /* unsure, can be 0 though */
    data            text not null          /* 10 */  /* unsure, genanki forces it to '' */
);
CREATE TABLE cards (
    id              integer primary key,   /* 0 */
    nid             integer not null,      /* 1 */  /* note id */
    did             integer not null,      /* 2 */  /* deck id */
    ord             integer not null,      /* 3 */  /* order */
    mod             integer not null,      /* 4 */  /* modification time (seconds since epoch) */
    usn             integer not null,      /* 5 */
    type            integer not null,      /* 6 */  /* 0=new, 1=learning, 2=due */
    queue           integer not null,      /* 7 */  /* -1 if self.suspend else 0 */
    due             integer not null,      /* 8 */  /* 0 */
    ivl             integer not null,      /* 9 */  /* 0 */
    factor          integer not null,      /* 10 */  /* 0 */
    reps            integer not null,      /* 11 */  /* 0 */
    lapses          integer not null,      /* 12 */  /* 0 */
    left            integer not null,      /* 13 */  /* 0 */
    odue            integer not null,      /* 14 */  /* 0 */
    odid            integer not null,      /* 15 */  /* 0 */
    flags           integer not null,      /* 16 */  /* 0 */
    data            text not null          /* 17 */  /* "" */
);
CREATE TABLE revlog (
    id              integer primary key,
    cid             integer not null,
    usn             integer not null,
    ease            integer not null,
    ivl             integer not null,
    lastIvl         integer not null,
    factor          integer not null,
    time            integer not null,
    type            integer not null
);
CREATE TABLE graves (
    usn             integer not null,
    oid             integer not null,
    type            integer not null
);
ANALYZE sqlite_master;
CREATE INDEX ix_notes_usn on notes (usn);
CREATE INDEX ix_cards_usn on cards (usn);
CREATE INDEX ix_revlog_usn on revlog (usn);
CREATE INDEX ix_cards_nid on cards (nid);
CREATE INDEX ix_cards_sched on cards (did, queue, due);
CREATE INDEX ix_revlog_cid on revlog (cid);
CREATE INDEX ix_notes_csum on notes (csum);
COMMIT;
`

/**
 * The AnkiHash is transliterated into JavaScript from genanki's Python version:
 * https://github.com/kerrickstaley/genanki/blob/c0ac89a72ce1c7f778d1543b0b155a16d40572b7/genanki/__init__.py#L18-L44
 *
 * The original is licensed as MIT, and so is this version
 * The following license applies to this block only
 *
 * Copyright (c) 2017 Kerrick Staley and Jeremy Apthorp.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

// deno-fmt-ignore
const BASE91_TABLE = [
  'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o',
  'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D',
  'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S',
  'T', 'U', 'V', 'W', 'X', 'Y', 'Z', '0', '1', '2', '3', '4', '5', '6', '7',
  '8', '9', '!', '#', '$', '%', '&', '(', ')', '*', '+', ',', '-', '.', '/',
  ':', ';', '<', '=', '>', '?', '@', '[', ']', '^', '_', '`', '{', '|', '}',
  '~',
]

function ankiHash(fields: string[]): string {
  const str = fields.join('__')

  const msgUint8 = new TextEncoder().encode(str)
  const hashBuffer = crypto.subtle.digestSync('SHA-256', msgUint8)
  const hashArray = Array.from(new Uint8Array(hashBuffer))

  let hash_int = 0n
  for (let i = 0; i < 8; i++) {
    hash_int *= 256n
    hash_int += BigInt(hashArray[i])
  }

  // convert to the weird base91 format that Anki uses
  const rv_reversed = []
  while (hash_int > 0) {
    rv_reversed.push(BASE91_TABLE[Number(hash_int % 91n)])
    hash_int = hash_int / 91n
  }

  return rv_reversed.reverse().join('')
}
