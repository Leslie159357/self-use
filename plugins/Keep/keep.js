/**
 * Keep Premium Unlock v1.3
 * App: Keep (com.gotokeep.keep) v9.0.20
 * 
 * Intercepts all known plaintext JSON endpoints to unlock premium membership.
 * All endpoints return plaintext JSON ✅
 * 
 * v1.3: Added /arke-webapp/v2/suit/smart/customize/preview (primeStatus+memberStatus),
 *       /suit/v1/recommend/top/module/info, /suit/v3/baseInfo, /suit/v5/questions
 */

const PREMIUM_EXPIRE = 4070908800000; // 2099-01-01

const url = $request.url;
const body = $response.body;

try {
    let obj = JSON.parse(body);

    // 1. /kprime/v1/auth — Main premium auth
    if (/\/kprime\/v1\/auth/.test(url)) {
        if (obj.data) {
            obj.data.memberType = "SENIOR";
            obj.data.membershipType = "ANNUAL_CARD";
            obj.data.status = 1;
            obj.data.statusTrack = "active";
            obj.data.paidStatus = 1;
            obj.data.paidStatusTrack = "paid";
            obj.data.autoRenew = true;
            obj.data.gmtCurrentTypeExpire = PREMIUM_EXPIRE;
            obj.data.gmtPaidTypeExpire = PREMIUM_EXPIRE;
            obj.data.gmtExpire = PREMIUM_EXPIRE;
            obj.data.totalEffectiveDays = 99999;
            obj.data.currentEffectiveDays = 99999;
        }
        $done({ body: JSON.stringify(obj) });
        return;
    }

    // 2. /kprime/v2/infoForClient — Premium client info
    if (/\/kprime\/v2\/infoForClient/.test(url)) {
        if (obj.data) {
            obj.data.primeStatus = "active";
            if (Array.isArray(obj.data.memberDTOList)) {
                obj.data.memberDTOList.forEach(m => {
                    m.memberType = "SENIOR";
                    m.membershipType = "ANNUAL_CARD";
                    m.status = 1;
                    m.statusTrack = "active";
                    m.paidStatus = 1;
                    m.paidStatusTrack = "paid";
                    m.autoRenew = true;
                    m.gmtCurrentTypeExpire = PREMIUM_EXPIRE;
                    m.gmtPaidTypeExpire = PREMIUM_EXPIRE;
                    m.gmtExpire = PREMIUM_EXPIRE;
                    m.totalEffectiveDays = 99999;
                    m.currentEffectiveDays = 99999;
                });
            }
            if (typeof obj.data.status === "string") {
                try {
                    let statusObj = JSON.parse(obj.data.status);
                    for (let k in statusObj) {
                        if (statusObj[k] === "expired") statusObj[k] = "active";
                    }
                    obj.data.status = JSON.stringify(statusObj);
                } catch (e) {}
            }
            if (typeof obj.data.paidStatus === "string") {
                try {
                    let paidObj = JSON.parse(obj.data.paidStatus);
                    for (let k in paidObj) {
                        if (paidObj[k] === "none") paidObj[k] = k === "NORMAL" ? "paid" : paidObj[k];
                    }
                    obj.data.paidStatus = JSON.stringify(paidObj);
                } catch (e) {}
            }
        }
        $done({ body: JSON.stringify(obj) });
        return;
    }

    // 3. /kprime/v2/home/complete/tab (any tab: normal, live, other)
    if (/\/kprime\/v2\/home\/complete\/tab\b/.test(url) && !/\/tab\/exp/.test(url)) {
        if (obj.data) {
            if (obj.data.tab === "normal" || obj.data.tab === "live") {
                if (obj.data.memberInfo) {
                    obj.data.memberInfo.status = 1;
                    obj.data.memberInfo.gmtExpire = PREMIUM_EXPIRE;
                    obj.data.memberInfo.autoRenew = true;
                }
                obj.data.headCopy = obj.data.tab === "live" 
                    ? "尊贵的 Keep 直播畅练卡会员" 
                    : "尊贵的 Keep 会员";
            }
        }
        $done({ body: JSON.stringify(obj) });
        return;
    }

    // 4. /kprime/v2/home/complete/tab/exp — pass through
    if (/\/kprime\/v2\/home\/complete\/tab\/exp/.test(url)) {
        $done({ body });
        return;
    }

    // 5. /kprime/v1/plan/primeGlobalTips — pass through
    if (/\/kprime\/v1\/plan\/primeGlobalTips/.test(url)) {
        $done({ body });
        return;
    }

    // 6. /kprime/v1/suit/tab/bubble — pass through
    if (/\/kprime\/v1\/suit\/tab\/bubble/.test(url)) {
        $done({ body });
        return;
    }

    // 7. /agamotto-webapp/v1/coach/role/user — AI coach
    if (/\/agamotto-webapp\/v1\/coach\/role\/user/.test(url)) {
        if (obj.data) obj.data.memberExclusive = true;
        $done({ body: JSON.stringify(obj) });
        return;
    }

    // 8. /kprime/v1/member/privilege — privilege check
    if (/\/kprime\/v1\/member\/privilege/.test(url)) {
        if (obj.data !== undefined) obj.data = true;
        $done({ body: JSON.stringify(obj) });
        return;
    }

    // 9. /kprime/v4/suit/sales/entrance — suit sales entrance
    if (/\/kprime\/v4\/suit\/sales\/entrance/.test(url)) {
        if (obj.data && obj.data.memberEntrance) {
            obj.data.memberEntrance.prime = true;
            obj.data.memberEntrance.memberStatus = 1;
            obj.data.memberEntrance.buttonText = "尊贵会员已解锁";
        }
        $done({ body: JSON.stringify(obj) });
        return;
    }

    // 10. /kprime/v5/signup — pass through
    if (/\/kprime\/v5\/signup/.test(url)) {
        $done({ body });
        return;
    }

    // 11. /arke-webapp/v2/suit/smart/customize/preview — Suit preview (primeStatus + memberStatus)
    if (/\/arke-webapp\/v2\/suit\/smart\/customize\/preview/.test(url)) {
        if (obj.data) {
            if (obj.data.eventTrackInfo) {
                obj.data.eventTrackInfo.primeStatus = "active";
                obj.data.eventTrackInfo.isFree = 1;
            }
            if (obj.data.config) {
                obj.data.config.memberStatus = 1;
            }
        }
        $done({ body: JSON.stringify(obj) });
        return;
    }

    // 12. /suit/v1/recommend/top/module/info — Suit recommendations (pass through, no member fields to change)
    if (/\/suit\/v1\/recommend\/top\/module\/info/.test(url)) {
        $done({ body });
        return;
    }

    // 13. /suit/v3/baseInfo — Suit base info
    if (/\/suit\/v3\/baseInfo/.test(url)) {
        $done({ body });
        return;
    }

    // 14. /suit/v5/questions — Suit questions
    if (/\/suit\/v5\/questions/.test(url)) {
        $done({ body });
        return;
    }

    // 15. /account/v2/dashboard — User dashboard
    if (/\/account\/v2\/dashboard/.test(url)) {
        // memberStatus is already null for this user, no change needed
        $done({ body });
        return;
    }

    // Default: pass through
    $done({ body });

} catch (e) {
    console.log("Keep Premium Unlock error: " + e.message);
    $done({ body });
}
