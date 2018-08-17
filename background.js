const base = 'https://logkeeper.mongodb.org/lobster';
const initiator = 'https://evergreen.mongodb.com';
const lineNumber = new RegExp('#L([0-9]+)$');

function toLobsterType(s) {
  switch(s) {
    case 'T':
      return 'task';

    case 'A':
      return 'agent';

    case 'S':
      return 'system';

    default:
      return 'all';
  }
}

const taskLog = new RegExp('https?:\/\/evergreen\.mongodb\.com\/task_log_raw\/(.*)\/([0-9]+)');
const typeRegExp = new RegExp('\\?type=(ALL|T|A|S)');

chrome.webRequest.onBeforeRequest.addListener(
  function(details) {
    console.log(details)
    if (details.initiator != null && details.initiator !== initiator) {
      return;
    }
    const matches = taskLog.exec(details.url);
    const typeMatch = typeRegExp.exec(details.url);
    if (matches == null || typeMatch == null) {
      return;
    }
    let url = `${base}/evergreen/task/${matches[1]}/${matches[2]}/${toLobsterType(matches[1])}`

    const linematches = lineNumber.exec(details.url);
    if (linematches != null && linematches[1].length > 0) {
      url = `${url}#scroll=${linematches[1]}`;
    }
      console.log(url);

    return { redirectUrl: url };
  },
  {
    urls: [
      "*://evergreen.mongodb.com/task_log_raw/*"
    ],
    types: [
      "main_frame"
    ]
  },
  ["blocking"]
);

const testLog = new RegExp('https?:\/\/evergreen\.mongodb.com\/test_log\/([a-z0-9]+)', 'i');

function testLogMatches(url) {
  const matches = testLog.exec(url);
  const out = {
    id: matches[1],
    scroll : null
  };
  const linematches = lineNumber.exec(url);
  if (linematches != null && linematches[1].length > 0) {
    out.scroll = linematches[1];
  }

  return out;
}

chrome.webRequest.onBeforeRequest.addListener(
  function(details) {
    console.log(details)
    if (details.initiator != null && details.initiator !== initiator) {
      return;
    }
    const match = testLogMatches(details.url);
    if (!match) {
      return;
    }

    let url = `${base}/evergreen/test/${match.id}`;
    if(match.scroll != null) {
      url = `${url}#scroll=${match.scroll}`;
    }

    return { redirectUrl: url };
  },
  {
    urls: [
      "*://evergreen.mongodb.com/test_log/*"
    ],
    types: [
      "main_frame"
    ]
  },
  ["blocking"]
)
