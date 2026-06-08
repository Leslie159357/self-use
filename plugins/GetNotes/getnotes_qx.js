// ==CloakNote==
// 得到大脑 GetNotes VIP 解锁 v2.0
// Quantumult X 脚本
// 拦截: dmind.luojilab.com + notes-api.biji.com + get-notes.luojilab.com
// 基于实际抓包数据结构重写
// ==/CloakNote==

const url = $request.url;
let body = $response.body;

if (!body) {
  $done({});
  return;
}

try {
  let obj = JSON.parse(body);

  // 1. dmind.luojilab.com: /voicenotes/mind/app/v1/user/info
  //    返回: {"h":{...},"c":{"data":{"user_info":...,"vip_info":{...}}}}
  if (url.indexOf('/voicenotes/mind/app/v1/user/info') !== -1) {
    if (obj.c && obj.c.data && obj.c.data.vip_info) {
      let vip = obj.c.data.vip_info;
      vip.is_vip = true;
      vip.is_expire = false;
      vip.begin_time = 1780906248;
      vip.end_time = 4092599349;
      vip.expire_time = 4092599349;
      vip.surplus_days = 36500;
      vip.subscribed_days = 36500;
      vip.is_ever_subscribed = true;
      vip.current_tier = 'pro';
      vip.equity_intro = 'PRO会员';
    }
    if (obj.c && obj.c.data && obj.c.data.rights_info) {
      let r = obj.c.data.rights_info;
      r.meeting_audio_duration_ms = 999999999;
      r.audio_duration_ms = 999999999;
      r.class_duration_ms = 999999999;
      r.ai_trial_count = 99999;
      r.local_audio_max_duration_ms = 999999999;
      r.local_audio_max_file_size_byte = 999999999;
    }
    if (obj.c && obj.c.data && obj.c.data.quota_info) {
      let q = obj.c.data.quota_info;
      if (q.local_audio_quota) {
        q.local_audio_quota.guide_user_get_more = true;
        q.local_audio_quota.granted_duration = 999999999;
        q.local_audio_quota.remained_duration = 999999999;
      }
      if (q.asr_hot_words_quota) {
        q.asr_hot_words_quota.granted_count = 999;
      }
    }
    console.log('GetNotes: /user/info -> VIP unlocked + quotas maxed');
  }

  // 2. get-notes.luojilab.com: /voicenotes/web/user/info
  //    结构同 /voicenotes/mind/app/v1/user/info
  if (url.indexOf('/voicenotes/web/user/info') !== -1) {
    if (obj.c && obj.c.data && obj.c.data.vip_info) {
      let vip = obj.c.data.vip_info;
      vip.is_vip = true;
      vip.is_expire = false;
      vip.begin_time = 1780906248;
      vip.end_time = 4092599349;
      vip.expire_time = 4092599349;
      vip.surplus_days = 36500;
      vip.subscribed_days = 36500;
      vip.is_ever_subscribed = true;
      vip.current_tier = 'pro';
    }
    if (obj.c && obj.c.data && obj.c.data.rights_info) {
      let r = obj.c.data.rights_info;
      r.meeting_audio_duration_ms = 999999999;
      r.audio_duration_ms = 999999999;
      r.class_duration_ms = 999999999;
      r.ai_trial_count = 99999;
    }
    if (obj.c && obj.c.data && obj.c.data.quota_info) {
      let q = obj.c.data.quota_info;
      if (q.local_audio_quota) {
        q.local_audio_quota.granted_duration = 999999999;
        q.local_audio_quota.remained_duration = 999999999;
      }
    }
    console.log('GetNotes: /voicenotes/web/user/info -> VIP unlocked');
  }

  // 3. notes-api.biji.com: /shop/app/v1/vipcards/user
  //    返回: {"h":{...},"c":{"user":{...},"vip_info":{...}}}
  if (url.indexOf('/vipcards/user') !== -1) {
    if (obj.c && obj.c.vip_info) {
      let vip = obj.c.vip_info;
      vip.is_vip = true;
      vip.is_expire = false;
      vip.begin_time = 1780906248;
      vip.end_time = 4092599349;
      vip.expire_time = 4092599349;
      vip.surplus_days = 36500;
      vip.subscribed_days = 36500;
      vip.is_ever_subscribed = true;
      vip.current_tier = 'pro';
    }
    if (obj.c && obj.c.user) {
      obj.c.user.vip_status = 'paid';
      obj.c.user.is_paid_user = true;
      obj.c.user.user_group = 'vip';
    }
    console.log('GetNotes: /vipcards/user -> VIP unlocked');
  }

  // 4. notes-api.biji.com: /shop/app/v1/vipcards (列表)
  if (url.indexOf('/shop/app/v1/vipcards') !== -1 && url.indexOf('/user') === -1) {
    if (obj.c && Array.isArray(obj.c)) {
      // 所有商品标记为已购买
      obj.c.forEach(function(card) {
        card.is_purchased = true;
        card.is_bought = true;
        card.eligibility_rule = null;
        card.price = 0;
      });
    }
    console.log('GetNotes: /vipcards -> all purchased');
  }

  // 5. notes-api.biji.com: /shop/app/v1/maxcards
  if (url.indexOf('/shop/app/v1/maxcards') !== -1) {
    if (obj.c && Array.isArray(obj.c)) {
      obj.c.forEach(function(card) {
        card.is_purchased = true;
        card.price = 0;
      });
    }
    console.log('GetNotes: /maxcards -> all purchased');
  }

  // 6. dmind.luojilab.com: /shop/mind/app/v1/vipcards/purchase
  if (url.indexOf('/vipcards/purchase') !== -1) {
    if (obj.c) {
      obj.c.order_status = 'PAY_SUCCESS';
      obj.c.status = 1;
    }
    console.log('GetNotes: /purchase -> success');
  }

  // 7. dmind.luojilab.com: /shop/mind/app/v1/vipcards/polling
  if (url.indexOf('/vipcards/polling') !== -1) {
    if (obj.c) {
      obj.c.status = 1;
      obj.c.order_status = 'PAY_SUCCESS';
    }
    console.log('GetNotes: /polling -> success');
  }

  // 8. dmind.luojilab.com: /shop/mind/app/v1/activity/education_2025/prize/check
  if (url.indexOf('/activity/education_2025/prize/check') !== -1) {
    if (obj.c) {
      obj.c.has_been_edu_certified = true;
      obj.c.has_been_real_name_certified = true;
      obj.c.has_tried_claim = false;
      obj.c.claim_info = { claimed: false, can_claim: true };
    }
    console.log('GetNotes: /prize/check -> can claim');
  }

  // 9. dmind.luojilab.com: /voicenotes/mind/app/v1/normal/check
  if (url.indexOf('/voicenotes/mind/app/v1/normal/check') !== -1) {
    if (obj.c) {
      obj.c.is_normal = true;
    }
    console.log('GetNotes: /normal/check -> ok');
  }

  $done({body: JSON.stringify(obj)});

} catch(e) {
  console.log('GetNotes script error: ' + e.message);
  $done({});
}
