#!/bin/sh
# 🐟 鱼吃鱼 — 刷钻石+鱼碎片脚本
# 用法: sh dayu_farm.sh [次数]
# 默认刷100次，每次10钻石 = 1000钻石

TOKEN="kDKCeRJt4y97R5rkVllNfnDjQVqWVWO1LDsFoRz29VESWvmQJsLujwLxxiK60zfucONBWpZVY7UsOwWhHPb1UeZzWk1DNB+WaoFzrIi7TLPHqDSartpDZhIKdwEVyKs7BkneSY5VR7holjEmGO2s0AdWTSI42swyhXHqnHgiev8Wiy155+ero9tHSOKMjiuKPDPrFFQyALf9tEcTQ7xUPkfMT9X3dUtUp1Zmi9ovO5CFL/ahXC6Oc/yJHSr3rBybJ442I0ATHnY+J3hRxIrS0RcuC0IY8y1E31AvSKdpQgU=c7afc796ed9c0f9b3e0be966d4445baf"
UID="6a36db722ec728c57f89faec"
SIGN="8eb7c2b34c55b8242950226e5e8aff66"
TIME="1782017870211"

COUNT=${1:-100}
SUCCESS=0
FAIL=0

echo "=== 🐟 鱼吃鱼 刷钻石脚本 ==="
echo "目标: 刷 $COUNT 次 draw_fish_box"
echo "每次: 10钻石 + 鱼碎片"
echo "预计获得: $((COUNT * 10)) 钻石"
echo "================================="
echo ""

for i in $(seq 1 $COUNT); do
  RESULT=$(curl -s -X POST "https://prod-dayu.lanfeitech.com/api/user/draw_fish_box" \
    -H "Content-Type: application/json" \
    -H "authorization: Bearer $TOKEN" \
    -H "sign: $SIGN" \
    -H "time: $TIME" \
    -d "{\"uid\":\"$UID\",\"type\":0,\"fish_tb\":[{\"id\":11007,\"count\":1}],\"is_free\":1}")
  
  if echo "$RESULT" | grep -q '"code":0'; then
    SUCCESS=$((SUCCESS + 1))
    GEM=$(echo "$RESULT" | sed 's/.*"gem":\([0-9]*\).*/\1/' 2>/dev/null)
    FISH_COUNT=$(echo "$RESULT" | sed 's/.*"count":\([0-9]*\).*/\1/' 2>/dev/null)
    printf "\r[%3d/%3d] ✅ 成功 | 钻石+$GEM | 碎片累计$FISH_COUNT" $i $COUNT
  else
    FAIL=$((FAIL + 1))
    printf "\r[%3d/%3d] ❌ 失败: %s" $i $COUNT "$RESULT"
  fi
  
  sleep 0.3
done

echo ""
echo ""
echo "=== 完成 ==="
echo "成功: $SUCCESS 次"
echo "失败: $FAIL 次"
echo "共计获得钻石: $((SUCCESS * 10))"
echo ""
echo "⚠️ Token 有效期2小时（从 1782017820 开始）"
echo "过期后需要重新抓取新token"
echo "过期时间: $(date -d @$((1782017820 + 7200)) '+%Y-%m-%d %H:%M:%S')"
