// InkerSpeak (引客英语 / 造句说) Premium Unlock v1.3
// API: yinke.jinguizi07.cn - 全部明文JSON ✅ 无签名验证

const url = $request.url;
const method = $request.method;
const body = $response.body;

if (!url.includes('yinke.jinguizi07.cn')) {
  $done({ body });
  return;
}

let obj = JSON.parse(body);
let modified = false;

// helper: unlock isVip in array/object
function unlockVIP(data) {
  if (!data) return false;
  if (Array.isArray(data)) {
    let count = 0;
    for (const item of data) {
      if (item && typeof item === 'object' && item.isVip === true) {
        item.isVip = false;
        count++;
      }
    }
    if (count > 0) { console.log(`解锁 ${count} 个VIP项目`); return true; }
  } else if (typeof data === 'object') {
    for (const key of ['page', 'content', 'stories', 'items', 'list', 'records']) {
      const arr = data[key];
      if (Array.isArray(arr)) {
        let count = 0;
        for (const item of arr) {
          if (item && typeof item === 'object' && item.isVip === true) {
            item.isVip = false;
            count++;
          }
        }
        if (count > 0) { console.log(`解锁 ${count} 个VIP项目(${key})`); return true; }
      }
    }
  }
  return false;
}

// 将data对象设为premium
function setPremium(d) {
  if (!d) return false;
  d.memberType = 'premium';
  d.isMember = true;
  d.membershipEndDate = 4092599349000;
  d.membershipStartDate = Date.now();
  d.remainingTimeQuota = 999999;
  return true;
}

// 1. Apple登录 → premium + 强制设置remainingTimeQuota
if (url.includes('/api/auth/apple-login') && method === 'POST') {
  if (obj.data) {
    setPremium(obj.data);
    modified = true;
    console.log('登录 → premium');
  }
}

// 2. user-info → premium (支持GET和POST)
if (url.includes('/api/user/user-info')) {
  if (obj.data) {
    setPremium(obj.data);
    modified = true;
    console.log('user-info → premium');
  }
}

// 3. 所有 story-series → 解锁isVip
if (url.includes('/api/story-series/')) {
  if (unlockVIP(obj.data)) modified = true;
}

// 4. distribution/summary → 金币
if (url.includes('/api/distribution/summary')) {
  if (obj.data) {
    obj.data.flowCoins = 99999;
    modified = true;
    console.log('flowCoins → 99999');
  }
}

// 5. video-segments → 解锁课程视频片段
if (url.includes('/api/video-segments/')) {
  if (obj.data?.page?.content && Array.isArray(obj.data.page.content)) {
    let c = 0;
    for (const item of obj.data.page.content) {
      if (item.isVip === true) { item.isVip = false; c++; }
    }
    if (c > 0) { modified = true; console.log(`video: 解锁 ${c} 个VIP片段`); }
  }
}

$done({ body: JSON.stringify(obj) });
