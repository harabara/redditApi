var app = require('./app')
var R = require('ramda')

const subreditsURL = 'https://www.reddit.com/r/The_Donald.json'
const topicURL = 'https://www.reddit.com/r/The_Donald.json'
const nrOfSubredits = 20

describe('test readNEntities', () => {
  var subs
  beforeAll(async () => {
    subs = await app.readNEntities(subreditsURL, nrOfSubredits)
  })

  test('read n subbredits', () => {
    expect(subs.length).toBeLessThanOrEqual(nrOfSubredits)
  })

  test('should be uniquie', () => {
    const names = R.map(R.prop(['name']))(subs)
    expect(Array.from(new Set(names))).toEqual(names)
  })
})

describe('test readNEntities', () => {
  var subs

  beforeAll(async () => {
    subs = await app.readNEntities(topicURL, nrOfSubredits)
  })

  test('read n subbredits', () => {
    expect(subs.length).toBeLessThanOrEqual(nrOfSubredits)
  })

  test('should be uniquie', () => {
    const names = R.map(R.prop(['name']))(subs)
    expect(Array.from(new Set(names))).toEqual(names)
  })
})
