var fs = require('fs')
var fetch = require('node-fetch')
var R = require('ramda')
var rimraf = require('rimraf')

const ROOT_URL = 'https://www.reddit.com'
const SUBREDDITS_EDPOINT = ROOT_URL + '/subreddits.json'

const LIMIT = 100
const DIR = './dist'

// utility function
function cleanFiles() {
  rimraf(DIR, function () {
    console.log('Target directry cleard')
    if (!fs.existsSync(DIR)) {
      fs.mkdirSync(DIR)
      console.log('Target directry created')
    }
  })
}

// utility function
function readArguments() {
  return {
    subreddits: process.argv[2] || 10,
    topics: process.argv[3] || 10
  }
}

// utility function
async function callAPI(endpoint) {
  try {
    const response = await fetch(endpoint)
    const json = await response.json()
    return json
  } catch (error) {
    console.log(error)
  }
}

// utility function
function writeSubbredditToFile(fileName, content) {
  const filepath = DIR + '/' + fileName + '.txt'
  fs.writeFile(filepath, content, err => {
    if (err) throw err
    console.log(filepath, 'created')
  })
}

// extract name field of the last childred
// this field is used as *after* URL param
const getAfter = R.compose(R.path(['data', 'name']), R.last, R.path(['data', 'children']))

// extracts data from chieldren
const getChildren = R.compose(R.map(R.prop(['data'])), R.path(['data', 'children']))

// select 'name', 'title', 'url' fields
const select = R.map(R.pick(['name', 'title', 'url']))

// requests Entities once or a few times deppending on limit
// after first request the after variable is calculated, it used in folowing requests
// the slice() at the end is used because reddit not always adheear to *limit* param
// and can actually send more etries,
// e.g. https://www.reddit.com/r/The_Donald.json?limit=1 has 3 children
async function readNEntities(endpoint, n) {
  let subreddits = []
  let after
  let count = n
  while (count > 0) {
    const limit = count < LIMIT ? count : LIMIT
    count -= limit
    const url = endpoint + '?limit=' + limit + (after ? '&after=' + after : '')
    const json = await callAPI(url)
    after = getAfter(json)
    subreddits = subreddits.concat(getChildren(json))
  }
  return subreddits.slice(0, n)
}

// entry point of application
async function main() {
  // first
  cleanFiles()

  // get the arguments
  const args = readArguments()

  // read n entries and select only required fields
  let subreddits = select(await readNEntities(SUBREDDITS_EDPOINT, args.subreddits))

  // loop over the responce
  subreddits.forEach(async subreddit => {
    const topicURL = ROOT_URL + R.dropLast(1, subreddit.url) + '.json'

    // read sub entries and select only required fields
    const topics = select(await readNEntities(topicURL, args.topics))

    //write responce to files
    writeSubbredditToFile(subreddit.name, JSON.stringify(topics, null, 4))
  })
}

main()

// export for testing purpose
module.exports.readNEntities = readNEntities