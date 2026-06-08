import json, os, sys, urllib.request, urllib.error

token = os.environ.get('GITHUB_TOKEN', '')
js_file = open('/var/minis/workspace/ef_hello.js').read()
plugin_file = open('/var/minis/workspace/ef_hello_final.plugin').read()

payload = {
    "description": "EF Hello Premium Unlock v10.1 - 解锁PREMIUM会员 + 65门课程 + 进度伪造",
    "public": False,
    "files": {
        "ef_hello.js": {"content": js_file},
        "ef_hello.plugin": {"content": plugin_file}
    }
}

data = json.dumps(payload).encode('utf-8')
req = urllib.request.Request(
    'https://api.github.com/gists',
    data=data,
    headers={
        'Authorization': 'Bearer ' + token,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        'User-Agent': 'Minis'
    }
)

try:
    with urllib.request.urlopen(req, timeout=30) as resp:
        result = json.loads(resp.read())
        gist_id = result['id']
        print("GIST_ID=" + gist_id)
        print("PLUGIN_URL=https://raw.githubusercontent.com/gist/raw/" + gist_id + "/ef_hello.plugin")
        print("JS_URL=https://raw.githubusercontent.com/gist/raw/" + gist_id + "/ef_hello.js")
        print("GIST_URL=" + result['html_url'])
except urllib.error.HTTPError as e:
    print("HTTP Error: " + str(e.code))
    print(e.read().decode('utf-8'))
    sys.exit(1)
