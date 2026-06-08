// ==CloakNote==
// 得到大脑 GetNotes VIP 解锁 v2.2
// Quantumult X 脚本
// 拦截: dmind.luojilab.com + notes-api.biji.com + get-notes.luojilab.com
// 基于多次实际抓包逐步完善
// ==/CloakNote==

const url = $request.url;
let body = $response.body;

if (!body) {
  $done({});
  return;
}

try {
  let obj = JSON.parse(body);

  // ==========================================================
  // 1. 用户信息 - VIP状态 + 权益配额
  //    dmind.luojilab.com/voicenotes/mind/app/v1/user/info
  //    get-notes.luojilab.com/voicenotes/web/user/info
  // ==========================================================
  if (url.indexOf('/user/info') !== -1) {
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

  // ==========================================================
  // 2. VIP卡信息 - 两个域名
  //    dmind.luojilab.com/shop/mind/app/v1/vipcards/user
  //    notes-api.biji.com/shop/app/v1/vipcards/user
  // ==========================================================
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

  // ==========================================================
  // 3. VIP卡列表 + Max卡 - 已购标记
  //    notes-api.biji.com/shop/app/v1/vipcards
  //    notes-api.biji.com/shop/app/v1/maxcards
  // ==========================================================
  if ((url.indexOf('/shop/app/v1/vipcards') !== -1 && url.indexOf('/user') === -1) || 
      url.indexOf('/shop/app/v1/maxcards') !== -1) {
    if (obj.c && obj.c.cards && Array.isArray(obj.c.cards)) {
      obj.c.cards.forEach(function(card) {
        card.is_purchased = true;
        card.is_bought = true;
        card.available_buy = false;
        card.price = "0.00";
        card.display_price = "0";
        card.origin_price = "0.00";
      });
    }
    console.log('GetNotes: /vipcards|maxcards -> all purchased');
  }

  // ==========================================================
  // 4. 权益使用情况 - 配额展示
  //    dmind.luojilab.com/voicenotes/mind/app/v1/user/rights/usage
  // ==========================================================
  if (url.indexOf('/user/rights/usage') !== -1) {
    if (obj.c) {
      if (obj.c.local_audio) {
        obj.c.local_audio.granted = '999999分钟';
        obj.c.local_audio.remaining = '999999分钟';
        obj.c.local_audio.used = '已用0';
      }
      if (obj.c.knowledge_topic) {
        obj.c.knowledge_topic.granted = '1TB';
        obj.c.knowledge_topic.remaining = '1TB';
      }
      if (obj.c.voice_card) {
        obj.c.voice_card.should_hide = false;
      }
    }
    console.log('GetNotes: /rights/usage -> quotas display maxed');
  }

  // ==========================================================
  // 5. 购买 - 伪造成功
  // ==========================================================
  if (url.indexOf('/vipcards/purchase') !== -1) {
    if (obj.c) {
      obj.c.order_status = 'PAY_SUCCESS';
      obj.c.status = 1;
    }
    console.log('GetNotes: /purchase -> success');
  }

  // ==========================================================
  // 6. 轮询 - 支付成功
  // ==========================================================
  if (url.indexOf('/vipcards/polling') !== -1) {
    if (obj.c) {
      obj.c.status = 1;
      obj.c.order_status = 'PAY_SUCCESS';
    }
    console.log('GetNotes: /polling -> success');
  }

  // ==========================================================
  // 7. 活动检查 - 可领取
  // ==========================================================
  if (url.indexOf('/activity/education_2025/prize/check') !== -1) {
    if (obj.c) {
      obj.c.has_been_edu_certified = true;
      obj.c.has_been_real_name_certified = true;
      obj.c.has_tried_claim = false;
      obj.c.claim_info = { claimed: false, can_claim: true };
    }
    console.log('GetNotes: /prize/check -> can claim');
  }

  // ==========================================================
  // 8. normal/check - 保留原始数据，不做破坏
  // ==========================================================
  if (url.indexOf('/voicenotes/mind/app/v1/normal/check') !== -1) {
    // 透传，不做修改以免破坏活动配置
    console.log('GetNotes: /normal/check -> passthrough');
  }

  $done({body: JSON.stringify(obj)});

} catch(e) {
  console.log('GetNotes script error: ' + e.message);
  $done({});
}
