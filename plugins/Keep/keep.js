/**
 * Keep Premium Unlock v1.2
 * App: Keep (com.gotokeep.keep) v9.0.20
 * 
 * Intercepts kprime auth/info endpoints to unlock premium membership.
 * All endpoints return plaintext JSON ✅
 * 
 * v1.2: Added /kprime/v1/member/privilege, /kprime/v4/suit/sales/entrance,
 *       /kprime/v5/signup intercepts. Added tab=live/tab=other support.
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
            // Fix memberDTOList
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
            // Fix status JSON string — replace "expired" with "active" for NORMAL
            if (typeof obj.data.status === "string") {
                try {
                    let statusObj = JSON.parse(obj.data.status);
                    for (let k in statusObj) {
                        if (statusObj[k] === "expired") {
                            statusObj[k] = "active";
                        }
                    }
                    obj.data.status = JSON.stringify(statusObj);
                } catch (e) {}
            }
            // Fix paidStatus JSON string
            if (typeof obj.data.paidStatus === "string") {
                try {
                    let paidObj = JSON.parse(obj.data.paidStatus);
                    for (let k in paidObj) {
                        if (paidObj[k] === "none") {
                            paidObj[k] = k === "NORMAL" ? "paid" : paidObj[k];
                        }
                    }
                    obj.data.paidStatus = JSON.stringify(paidObj);
                } catch (e) {}
            }
        }
        $done({ body: JSON.stringify(obj) });
        return;
    }

    // 3. /kprime/v2/home/complete/tab — Premium home tab (any tab type: normal, live, other)
    if (/\/kprime\/v2\/home\/complete\/tab\b/.test(url) && !/\/tab\/exp/.test(url)) {
        if (obj.data && obj.data.tab === "normal") {
            // Normal premium tab
            if (obj.data.memberInfo) {
                obj.data.memberInfo.status = 1;
                obj.data.memberInfo.gmtExpire = PREMIUM_EXPIRE;
                obj.data.memberInfo.autoRenew = true;
            }
            obj.data.headCopy = "尊贵的 Keep 会员";
        } else if (obj.data && obj.data.tab === "live") {
            // Live streaming tab — unlock LIVE membership
            if (obj.data.memberInfo) {
                obj.data.memberInfo.status = 1;
                obj.data.memberInfo.gmtExpire = PREMIUM_EXPIRE;
                obj.data.memberInfo.autoRenew = true;
            }
            obj.data.headCopy = "尊贵的 Keep 直播畅练卡会员";
        }
        $done({ body: JSON.stringify(obj) });
        return;
    }

    // 4. /kprime/v2/home/complete/tab/exp — Premium tab exp endpoint (pass through)
    if (/\/kprime\/v2\/home\/complete\/tab\/exp/.test(url)) {
        $done({ body });
        return;
    }

    // 5. /kprime/v1/plan/primeGlobalTips — show prime tips (pass through)
    if (/\/kprime\/v1\/plan\/primeGlobalTips/.test(url)) {
        $done({ body });
        return;
    }

    // 6. /kprime/v1/suit/tab/bubble — tab bubble (pass through)
    if (/\/kprime\/v1\/suit\/tab\/bubble/.test(url)) {
        $done({ body });
        return;
    }

    // 7. /agamotto-webapp/v1/coach/role/user — AI coach
    if (/\/agamotto-webapp\/v1\/coach\/role\/user/.test(url)) {
        if (obj.data) {
            obj.data.memberExclusive = true;
        }
        $done({ body: JSON.stringify(obj) });
        return;
    }

    // 8. /kprime/v1/member/privilege — Member privilege check
    if (/\/kprime\/v1\/member\/privilege/.test(url)) {
        // data: false → true (unlock TRAIN_SUIT privilege)
        if (obj.data !== undefined) {
            obj.data = true;
        }
        $done({ body: JSON.stringify(obj) });
        return;
    }

    // 9. /kprime/v4/suit/sales/entrance — Suit sales entrance
    if (/\/kprime\/v4\/suit\/sales\/entrance/.test(url)) {
        if (obj.data) {
            if (obj.data.memberEntrance) {
                obj.data.memberEntrance.prime = true;
                obj.data.memberEntrance.memberStatus = 1;
                obj.data.memberEntrance.buttonText = "尊贵会员已解锁";
            }
        }
        $done({ body: JSON.stringify(obj) });
        return;
    }

    // 10. /kprime/v5/signup — Signup/subscription info (pass through, system metadata)
    if (/\/kprime\/v5\/signup/.test(url)) {
        $done({ body });
        return;
    }

    // Default: pass through
    $done({ body });

} catch (e) {
    // If JSON parse fails, pass through
    console.log("Keep Premium Unlock error: " + e.message);
    $done({ body });
}
