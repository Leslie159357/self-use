// Cake Premium Unlock v1.2 - Loon Script
// 全覆盖: api.mycake.me + api.cakeapp.me
// v1.2 新增: POST /gw/heart 拦截、/gw/v2/main/keywords、channel/sentences等

const url = $request.url;
const method = $request.method;
let body = $response.body;

if (!body) {
  $done({});
  return;
}

try {
  let obj = JSON.parse(body);
  
  // ============ 1. POST /app/start → membership NONE→PREMIUM ============
  if (/\/app\/start/.test(url)) {
    if (obj.result === 'SUCCESS' && obj.extra) {
      obj.extra.membership = 'PREMIUM';
      obj.extra.membershipBenefitBridgeId = 99999;
      obj.extra.couponCanceled = false;
      // 伪造较老的创建时间（看起来像长期会员）
      obj.extra.createdAt = '2024-01-15 00:00:00';
      console.log('Cake: /app/start membership→PREMIUM');
    }
  }
  
  // ============ 2. GET /heart (api.mycake.me) ============
  else if (/\/heart\b/.test(url) && /api\.mycake\.me/.test(url)) {
    if (obj.result === 'SUCCESS' && obj.data) {
      obj.data.count = 999;
      obj.data.maximumCount = 999;
      obj.data.regenerationTime = 0;
      obj.data.regenerationTimeRemaining = 0;
      if (obj.extra && obj.extra.restriction) {
        obj.extra.restriction.adHeartCount = 999;
        obj.extra.restriction.maxAdViewsPerDay = 999;
      }
      console.log('Cake: /heart → unlimited');
    }
  }
  
  // ============ 3. GET /gw/heart (api.cakeapp.me) ============
  else if (/\/gw\/heart/.test(url) && method === 'GET') {
    if (obj.result === 'SUCCESS' && obj.data) {
      obj.data.count = 999;
      obj.data.maximumCount = 999;
      obj.data.regenerationTime = 0;
      obj.data.regenerationTimeRemaining = 0;
      console.log('Cake: /gw/heart GET → unlimited');
    }
  }

  // ============ 4. POST /gw/heart (api.cakeapp.me) - 消耗红心！新增！============
  else if (/\/gw\/heart/.test(url) && method === 'POST') {
    // 直接改剩余心数（App发count=1消耗，我们要改返回为充足）
    if (obj.result === 'FAILURE') {
      obj.result = 'SUCCESS';
    }
    if (obj.data) {
      obj.data.count = 999;
      obj.data.maximumCount = 999;
      obj.data.regenerationTime = 0;
      obj.data.regenerationTimeRemaining = 0;
    } else if (obj.result === 'SUCCESS') {
      obj.data = {"count": 999, "maximumCount": 999, "regenerationTime": 0, "regenerationTimeRemaining": 0};
    }
    console.log('Cake: /gw/heart POST → SUCCESS + 999');
  }
  
  // ============ 5. GET /tutorbot/ticket/policy ============
  else if (/\/tutorbot\/ticket\/policy/.test(url)) {
    if (obj.result === 'SUCCESS' && obj.data) {
      obj.data.membershipTickets = 99999;
      obj.data.familyMembershipTickets = 99999;
      obj.data.freeTrialTickets = 99999;
      obj.data.familyFreeTrialTickets = 99999;
      console.log('Cake: /tutorbot/ticket/policy → unlimited');
    }
  }
  
  // ============ 6. GET /v2/main/subscription/channel/updated (mycake) ============
  else if (/\/v2\/main\/subscription\/channel\/updated/.test(url) && /api\.mycake\.me/.test(url)) {
    if (obj.result === 'SUCCESS') {
      obj.data = true;
      console.log('Cake: subscription/channel/updated → true');
    }
  }

  // ============ 7. GET /gw/v2/main/subscription/channel/updated (cakeapp) ============
  else if (/\/gw\/v2\/main\/subscription\/channel\/updated/.test(url)) {
    if (obj.result === 'SUCCESS') {
      obj.data = {'channels': [], 'contents': []};
      console.log('Cake: /gw/v2/main/subscription/channel/updated → ok');
    }
  }

  // ============ 8. GET /subscription/timesale/auto ============
  else if (/\/subscription\/timesale\/auto/.test(url)) {
    // 保持原样
  }
  
  // ============ 9. GET /gw/v2/main/today → 解除membershipOnly/restrictedNow ============
  else if (/\/gw\/v2\/main\/today/.test(url)) {
    let changed = false;
    if (obj.result === 'SUCCESS' && Array.isArray(obj.data)) {
      for (const section of obj.data) {
        if (section.type === 'updatedPlaylist' && section.data && section.data.items) {
          for (const item of section.data.items) {
            if (item.sentences) {
              for (const s of item.sentences) {
                if (s.membershipOnly !== false || s.restrictedNow !== false) {
                  s.membershipOnly = false;
                  s.restrictedNow = false;
                  s.restrictedAfterFreeTrial = false;
                  changed = true;
                }
              }
            }
          }
        } else if (section.type === 'snack' && section.data && section.data.items) {
          for (const snack of section.data.items) {
            if (snack.restrictedNow !== false) {
              snack.restrictedNow = false;
              changed = true;
            }
          }
        }
      }
    }
    if (changed) console.log('Cake: /gw/v2/main/today → unlocked');
  }
  
  // ============ 10. GET /gw/v2/sentence/{id}/view/contents/extra ============
  else if (/\/gw\/v2\/sentence\/\d+\/view\/contents\/extra/.test(url)) {
    let changed = false;
    if (obj.result === 'SUCCESS' && obj.data) {
      if (obj.data.restrictedNow !== false) { obj.data.restrictedNow = false; changed = true; }
      if (obj.data.restrictedAfterFreeTrial !== false) { obj.data.restrictedAfterFreeTrial = false; changed = true; }
      if (obj.data.membershipOnly !== false) { obj.data.membershipOnly = false; changed = true; }
      // puzzle里的heart也解锁
      if (obj.data.puzzle && obj.data.puzzle.heart) {
        if (obj.data.puzzle.heart.count !== 999) { obj.data.puzzle.heart.count = 999; changed = true; }
        obj.data.puzzle.heart.maximumCount = 999;
        obj.data.puzzle.heart.regenerationTime = 0;
        obj.data.puzzle.heart.regenerationTimeRemaining = 0;
      }
    }
    if (changed) console.log('Cake: sentence/contents/extra → unlocked');
  }
  
  // ============ 11. GET /gw/v2/sentence/{id}/view/relation ============
  else if (/\/gw\/v2\/sentence\/\d+\/view\/relation/.test(url)) {
    let changed = false;
    if (obj.data && obj.data.playlist) {
      const pl = obj.data.playlist.playlist || obj.data.playlist;
      if (pl.sentences) {
        for (const s of pl.sentences) {
          if (s.restrictedNow !== false) { s.restrictedNow = false; changed = true; }
          if (s.membershipOnly !== false) { s.membershipOnly = false; changed = true; }
          if (s.membershipOnlyPlaylist !== false) { s.membershipOnlyPlaylist = false; changed = true; }
          if (s.membershipOnlySentence !== false) { s.membershipOnlySentence = false; changed = true; }
          s.restrictedAfterFreeTrial = false;
        }
      }
      if (pl.freeCoreQuiz !== undefined && pl.freeCoreQuiz !== true) { pl.freeCoreQuiz = true; changed = true; }
    }
    if (obj.data && obj.data.curriculums) {
      for (const c of obj.data.curriculums) {
        if (c.freeBadge !== true) { c.freeBadge = true; changed = true; }
      }
    }
    if (changed) console.log('Cake: sentence/view/relation → unlocked');
  }
  
  // ============ 12. GET /gw/snacks ============
  else if (/\/gw\/snacks/.test(url)) {
    let changed = false;
    if (obj.result === 'SUCCESS' && obj.data && obj.data.snacks) {
      for (const snack of obj.data.snacks) {
        if (snack.restrictedNow !== false) { snack.restrictedNow = false; changed = true; }
      }
    }
    if (changed) console.log('Cake: /gw/snacks → unlocked');
  }

  // ============ 13. GET /gw/user/dashboard ============
  else if (/\/gw\/user\/dashboard/.test(url)) {
    if (obj.result === 'SUCCESS' && obj.data) {
      obj.data.keys = 99999;
      obj.data.stars = 99999;
      obj.data.rank = 1;
      if (obj.data.attendance) {
        obj.data.attendance.totalDays = 100;
        obj.data.attendance.continuousDays = 100;
      }
      console.log('Cake: /gw/user/dashboard → keys/stars unlocked');
    }
  }

  // ============ 14. GET /gw/ (tutor bot) → membershipSuspended解除 ============
  else if (/^https?:\/\/api\.cakeapp\.me\/gw(\?|$)/.test(url)) {
    if (obj.result === 'SUCCESS' && obj.data && obj.data.membershipSuspended !== undefined) {
      obj.data.membershipSuspended = false;
      console.log('Cake: /gw/ tutor bot → membershipSuspended=false');
    }
  }

  // ============ 15. GET /gw/v2/user/review/main ============
  else if (/\/gw\/v2\/user\/review\/main/.test(url)) {
    if (obj.result === 'SUCCESS' && obj.data) {
      if (obj.data.dictionary) obj.data.dictionary.capacity = 99999;
      if (obj.data.keep) { obj.data.keep.capacity = 99999; }
      if (obj.data.speak) obj.data.speak.capacity = 99999;
      if (obj.data.snack) obj.data.snack.capacity = 99999;
      if (obj.data.video) obj.data.video.capacity = 99999;
      if (obj.data.blankQuiz) obj.data.blankQuiz.capacity = 99999;
      if (obj.data.collectionQuiz) obj.data.collectionQuiz.capacity = 99999;
      console.log('Cake: /gw/v2/user/review/main → unlocked');
    }
  }

  // ============ 16. GET /gw/channel/playlist ============
  else if (/\/gw\/channel\/playlist/.test(url)) {
    let changed = false;
    if (obj.data && obj.data.playlists) {
      for (const pl of obj.data.playlists) {
        if (pl.sentences) {
          for (const s of pl.sentences) {
            if (s.restrictedNow !== false) { s.restrictedNow = false; changed = true; }
            if (s.membershipOnly !== false) { s.membershipOnly = false; changed = true; }
            if (s.membershipOnlyPlaylist !== false) { s.membershipOnlyPlaylist = false; changed = true; }
            if (s.membershipOnlySentence !== false) { s.membershipOnlySentence = false; changed = true; }
            s.restrictedAfterFreeTrial = false;
          }
        }
        if (pl.freeCoreQuiz !== undefined) pl.freeCoreQuiz = true;
      }
    }
    if (changed) console.log('Cake: /gw/channel/playlist → unlocked');
  }

  // ============ 17. GET /gw/v2/channel/{id}/sentences ============
  else if (/\/gw\/v2\/channel\/\d+\/sentences/.test(url)) {
    let changed = false;
    if (Array.isArray(obj.data)) {
      for (const s of obj.data) {
        if (s.restrictedNow !== false) { s.restrictedNow = false; changed = true; }
        if (s.membershipOnly !== false) { s.membershipOnly = false; changed = true; }
        if (s.membershipOnlySentence !== false) { s.membershipOnlySentence = false; changed = true; }
        s.restrictedAfterFreeTrial = false;
      }
    }
    if (changed) console.log('Cake: /gw/v2/channel/*/sentences → unlocked');
  }

  // ============ 18. GET /gw/v2/main/keywords - 新增！关键词搜索全部会员内容 ============
  else if (/\/gw\/v2\/main\/keywords/.test(url)) {
    let changed = false;
    if (obj.result === 'SUCCESS' && obj.data && obj.data.playlists) {
      for (const pl of obj.data.playlists) {
        if (pl.membershipOnlyPlaylist !== false) { pl.membershipOnlyPlaylist = false; changed = true; }
        if (pl.sentences) {
          for (const s of pl.sentences) {
            if (s.membershipOnly !== false) { s.membershipOnly = false; changed = true; }
            if (s.membershipOnlyPlaylist !== false) { s.membershipOnlyPlaylist = false; changed = true; }
            if (s.membershipOnlySentence !== false) { s.membershipOnlySentence = false; changed = true; }
            if (s.restrictedNow !== false) { s.restrictedNow = false; changed = true; }
            s.restrictedAfterFreeTrial = false;
          }
        }
      }
    }
    if (changed) console.log('Cake: /gw/v2/main/keywords → unlocked');
  }

  // ============ 19. GET /gw/user/stars (新增) ============
  else if (/\/gw\/user\/stars/.test(url) || /\/gw\/user\/s\b/.test(url)) {
    // 保持原样或加星星
    if (obj.result === 'SUCCESS' && obj.data) {
      obj.data.stars = 99999;
      obj.data.totalStars = 99999;
      console.log('Cake: /gw/user/stars → max');
    }
  }

  body = JSON.stringify(obj);
} catch (e) {
  console.log('Cake: error - ' + e.message);
}

$done({ body });
