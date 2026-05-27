/**
 * Keep Premium Unlock v1.0
 * App: Keep (com.gotokeep.keep)
 * 
 * Intercepts kprime auth/info endpoints to unlock premium membership.
 * All endpoints return plaintext JSON ✅
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
            // Fix status JSON — replace "expired" with "active" for NORMAL
            if (typeof obj.data.status === "string") {
                try {
                    let statusObj = JSON.parse(obj.data.status);
                    for (let k in statusObj) {
                        if (statusObj[k] === "expired" || statusObj[k] === "none") {
                            statusObj[k] = k === "NORMAL" ? "active" : statusObj[k];
                        }
                    }
                    obj.data.status = JSON.stringify(statusObj);
                } catch (e) {}
            }
            // Fix paidStatus JSON
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

    // 3. /kprime/v2/home/complete/tab — Premium home tab (not /exp)
    if (/\/kprime\/v2\/home\/complete\/tab\b/.test(url) && !/\/tab\/exp/.test(url)) {
        if (obj.data) {
            // Fix memberInfo
            if (obj.data.memberInfo) {
                obj.data.memberInfo.status = 1;
                obj.data.memberInfo.gmtExpire = "2099-01-01T00:00:00.000Z";
                obj.data.memberInfo.autoRenew = true;
            }
            obj.data.headCopy = "尊贵的 Keep 会员";
        }
        $done({ body: JSON.stringify(obj) });
        return;
    }

    // 4. /kprime/v1/plan/primeGlobalTips — show prime tips
    if (/\/kprime\/v1\/plan\/primeGlobalTips/.test(url)) {
        // Already returns null data when expired, no change needed
        $done({ body });
        return;
    }

    // 5. /kprime/v1/suit/tab/bubble — tab bubble
    if (/\/kprime\/v1\/suit\/tab\/bubble/.test(url)) {
        // No change needed for now
        $done({ body });
        return;
    }

    // 6. /agamotto-webapp/v1/coach/role/user — AI coach
    if (/\/agamotto-webapp\/v1\/coach\/role\/user/.test(url)) {
        if (obj.data) {
            obj.data.memberExclusive = true;
        }
        $done({ body: JSON.stringify(obj) });
        return;
    }

    // Default: pass through
    $done({ body });

} catch (e) {
    // If JSON parse fails, pass through
    console.log("Keep Premium Unlock error: " + e.message);
    $done({ body });
}
