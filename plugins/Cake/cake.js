// Cake Premium Unlock v1.3 - Loon Script
// 全覆盖: api.mycake.me + api.cakeapp.me
// v1.3: 修复POST /gw/heart导致的心形问题

const url = $request.url;
const method = $request.method;
let body = $response.body;

if (!body) {
  $done({ body });
  return;
}

try {
  let obj = JSON.parse(body);
  let changed = false;

  // ===== 1. /app/start → membership =====
  if (obj.result === 'SUCCESS' && obj.extra && /app\/start/.test(url)) {
    if (obj.extra.membership !== 'PREMIUM') {
      obj.extra.membership = 'PREMIUM';
      obj.extra.membershipBenefitBridgeId = 99999;
      obj.extra.couponCanceled = false;
      changed = true;
      console.log('Cake: membership→PREMIUM');
    }
  }

  // ===== 2. Heart（GET/POST 都处理） =====
  if (obj.result && obj.data && obj.data.maximumCount && !obj.data.parts && /heart\b/.test(url)) {
    if (obj.data.count !== 999) {
      obj.data.count = 999;
      obj.data.maximumCount = 999;
      obj.data.regenerationTime = 0;
      obj.data.regenerationTimeRemaining = 0;
      if (obj.extra && obj.extra.restriction) {
        obj.extra.restriction.adHeartCount = 999;
        obj.extra.restriction.maxAdViewsPerDay = 999;
      }
      changed = true;
      console.log('Cake: heart→999');
    }
  }
  // 处理POST /gw/heart 返回 FAILURE
  if (obj.result === 'FAILURE' && /\/gw\/heart/.test(url)) {
    obj.result = 'SUCCESS';
    obj.data = {"count": 999, "maximumCount": 999, "regenerationTime": 0, "regenerationTimeRemaining": 0};
    changed = true;
    console.log('Cake: POST heart FAILURE→SUCCESS');
  }

  // ===== 3. tutorbot ticket =====
  if (obj.result === 'SUCCESS' && obj.data && obj.data.membershipTickets && /tutorbot\/ticket\/policy/.test(url)) {
    if (obj.data.membershipTickets !== 99999) {
      obj.data.membershipTickets = 99999;
      obj.data.familyMembershipTickets = 99999;
      obj.data.freeTrialTickets = 99999;
      obj.data.familyFreeTrialTickets = 99999;
      changed = true;
      console.log('Cake: tickets→99999');
    }
  }

  // ===== 4. subscription/channel/updated =====
  if (obj.result === 'SUCCESS' && /subscription\/channel\/updated/.test(url)) {
    if (obj.data !== true && obj.data !== false) {
      // cakeapp版本 - data是对象
      if (typeof obj.data === 'object') {
        obj.data = {'channels': [], 'contents': []};
        changed = true;
      }
    } else if (obj.data !== true) {
      obj.data = true;
      changed = true;
    }
    if (changed) console.log('Cake: subscription/channel/updated');
  }

  // ===== 5. /gw/v2/main/today → 解锁句子 =====
  if (obj.result === 'SUCCESS' && Array.isArray(obj.data) && /\/gw\/v2\/main\/today/.test(url)) {
    for (const section of obj.data) {
      if (section.type === 'updatedPlaylist' && section.data && section.data.items) {
        for (const item of section.data.items) {
          if (item.sentences) {
            for (const s of item.sentences) {
              if (s.membershipOnly !== false) { s.membershipOnly = false; changed = true; }
              if (s.restrictedNow !== false) { s.restrictedNow = false; changed = true; }
              s.restrictedAfterFreeTrial = false;
            }
          }
        }
      } else if (section.type === 'snack' && section.data && section.data.items) {
        for (const snack of section.data.items) {
          if (snack.restrictedNow !== false) { snack.restrictedNow = false; changed = true; }
        }
      }
    }
    if (changed) console.log('Cake: today→unlocked');
  }

  // ===== 6. /gw/v2/sentence/{id}/view/contents/extra =====
  if (obj.result === 'SUCCESS' && obj.data && obj.data.commentary !== undefined && /contents\/extra/.test(url)) {
    if (obj.data.restrictedNow !== false) { obj.data.restrictedNow = false; changed = true; }
    if (obj.data.membershipOnly !== false) { obj.data.membershipOnly = false; changed = true; }
    if (obj.data.restrictedAfterFreeTrial !== false) { obj.data.restrictedAfterFreeTrial = false; changed = true; }
    // puzzle heart
    if (obj.data.puzzle && obj.data.puzzle.heart) {
      obj.data.puzzle.heart.maximumCount = 999;
      obj.data.puzzle.heart.regenerationTime = 0;
      obj.data.puzzle.heart.regenerationTimeRemaining = 0;
    }
    if (changed) console.log('Cake: contents/extra→unlocked');
  }

  // ===== 7. /gw/v2/sentence/{id}/view/relation =====
  if (obj.data && obj.data.playlist && /view\/relation/.test(url)) {
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
    if (obj.data.curriculums) {
      for (const c of obj.data.curriculums) {
        if (c.freeBadge !== true) { c.freeBadge = true; changed = true; }
      }
    }
    if (changed) console.log('Cake: relation→unlocked');
  }

  // ===== 8. /gw/v2/main/keywords =====
  if (obj.result === 'SUCCESS' && obj.data && obj.data.playlists && /\/gw\/v2\/main\/keywords/.test(url)) {
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
    if (changed) console.log('Cake: keywords→unlocked');
  }

  // ===== 9. /gw/snacks =====
  if (obj.result === 'SUCCESS' && obj.data && obj.data.snacks && /\/gw\/snacks/.test(url)) {
    for (const snack of obj.data.snacks) {
      if (snack.restrictedNow !== false) { snack.restrictedNow = false; changed = true; }
    }
    if (changed) console.log('Cake: snacks→unlocked');
  }

  // ===== 10. /gw/user/dashboard =====
  if (obj.result === 'SUCCESS' && obj.data && obj.data.login && /\/gw\/user\/dashboard/.test(url)) {
    obj.data.keys = 99999;
    obj.data.stars = 99999;
    obj.data.rank = 1;
    if (obj.data.attendance) {
      obj.data.attendance.totalDays = 100;
      obj.data.attendance.continuousDays = 100;
    }
    changed = true;
    console.log('Cake: dashboard→max');
  }

  // ===== 11. /gw/ (tutor bot) =====
  if (obj.result === 'SUCCESS' && obj.data && obj.data.membershipSuspended !== undefined && /^https?:\/\/api\.cakeapp\.me\/gw(\?|$)/.test(url)) {
    if (obj.data.membershipSuspended !== false) {
      obj.data.membershipSuspended = false;
      changed = true;
      console.log('Cake: tutor→membershipSuspended=false');
    }
  }

  // ===== 12. /gw/v2/user/review/main =====
  if (obj.result === 'SUCCESS' && obj.data && obj.data.dictionary && /\/gw\/v2\/user\/review\/main/.test(url)) {
    obj.data.dictionary.capacity = 99999;
    if (obj.data.keep) obj.data.keep.capacity = 99999;
    if (obj.data.speak) obj.data.speak.capacity = 99999;
    if (obj.data.snack) obj.data.snack.capacity = 99999;
    if (obj.data.video) obj.data.video.capacity = 99999;
    if (obj.data.blankQuiz) obj.data.blankQuiz.capacity = 99999;
    if (obj.data.collectionQuiz) obj.data.collectionQuiz.capacity = 99999;
    changed = true;
    console.log('Cake: review→unlocked');
  }

  // ===== 13. /gw/channel/playlist =====
  if (obj.data && obj.data.playlists && /\/gw\/channel\/playlist/.test(url)) {
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
    if (changed) console.log('Cake: channel/playlist→unlocked');
  }

  // ===== 14. /gw/v2/channel/{id}/sentences =====
  if (Array.isArray(obj.data) && /\/gw\/v2\/channel\/\d+\/sentences/.test(url)) {
    for (const s of obj.data) {
      if (s.restrictedNow !== false) { s.restrictedNow = false; changed = true; }
      if (s.membershipOnly !== false) { s.membershipOnly = false; changed = true; }
      if (s.membershipOnlySentence !== false) { s.membershipOnlySentence = false; changed = true; }
      s.restrictedAfterFreeTrial = false;
    }
    if (changed) console.log('Cake: channel sentences→unlocked');
  }

  // ===== 15. /gw/user/stars or /gw/user/s =====
  if (obj.result === 'SUCCESS' && obj.data && (obj.data.totalStars !== undefined || obj.data.stars !== undefined) && /\/gw\/user\/(stars|s$)/.test(url)) {
    obj.data.stars = 99999;
    obj.data.totalStars = 99999;
    changed = true;
  }

  if (changed) body = JSON.stringify(obj);
} catch (e) {
  console.log('Cake: error - ' + e.message);
}

$done({ body });
