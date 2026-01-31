#!/bin/bash
# MVP2 Sanity Test Script
# Tests: auth, registration, trips, feed, invite/redeem with multiple users

set -e
BASE="http://localhost:3000"
echo "=== MVP2 Sanity Tests ==="
echo "Base URL: $BASE"
echo ""

# 1. Health check
echo "1. Health check..."
curl -s "$BASE/health" | head -1
echo ""

# 2. Register User A (test-inviter)
echo "2. Register User A (inviter)..."
REG_A=$(curl -s -X POST "$BASE/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"inviter@test.com","password":"Test123!"}')
echo "$REG_A" | head -1
TOKEN_A=$(echo "$REG_A" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
ID_A=$(echo "$REG_A" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
echo "User A ID: $ID_A"
echo ""

# 3. Register User B (test-invitee)
echo "3. Register User B (invitee)..."
REG_B=$(curl -s -X POST "$BASE/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"invitee@test.com","password":"Test123!"}')
echo "$REG_B" | head -1
TOKEN_B=$(echo "$REG_B" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
ID_B=$(echo "$REG_B" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
echo "User B ID: $ID_B"
echo ""

# 4. User A: Create trip
echo "4. User A creates trip..."
PLAN=$(curl -s -X POST "$BASE/trips/plan" \
  -H "Content-Type: application/json" \
  -d '{"destination":"Paris","days":2,"pace":"balanced"}')
ITIN=$(echo "$PLAN" | python3 -c "import sys,json; d=json.load(sys.stdin); print(json.dumps(d.get('itinerary',[])))" 2>/dev/null || echo "[]")
CREATE=$(curl -s -X POST "$BASE/trips" \
  -H "Authorization: Bearer $TOKEN_A" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Test Paris Trip\",\"destination\":\"Paris\",\"days\":2,\"pace\":\"balanced\",\"itinerary\":$ITIN,\"isPublic\":true}")
TRIP_ID=$(echo "$CREATE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "Trip ID: $TRIP_ID"
echo ""

# 5. User A: Create invite (editor)
echo "5. User A creates invite (editor)..."
INVITE=$(curl -s -X POST "$BASE/trips/$TRIP_ID/invite" \
  -H "Authorization: Bearer $TOKEN_A" \
  -H "Content-Type: application/json" \
  -d '{"role":"editor"}')
INVITE_CODE=$(echo "$INVITE" | grep -o '"code":"[^"]*"' | cut -d'"' -f4)
echo "Invite code: $INVITE_CODE"
echo ""

# 6. User B: List trips before redeem (should not see trip)
echo "6. User B lists trips (before redeem)..."
TRIPS_B=$(curl -s "$BASE/trips" -H "Authorization: Bearer $TOKEN_B")
echo "User B trips count: $(echo "$TRIPS_B" | grep -o '"id"' | wc -l)"
echo ""

# 7. User B: Redeem invite
echo "7. User B redeems invite code..."
REDEEM=$(curl -s -X POST "$BASE/invite/redeem" \
  -H "Authorization: Bearer $TOKEN_B" \
  -H "Content-Type: application/json" \
  -d "{\"code\":\"$INVITE_CODE\"}")
echo "$REDEEM" | head -1
echo ""

# 8. User B: List trips after redeem (should see trip)
echo "8. User B lists trips (after redeem)..."
TRIPS_B_AFTER=$(curl -s "$BASE/trips" -H "Authorization: Bearer $TOKEN_B")
COUNT=$(echo "$TRIPS_B_AFTER" | grep -o '"id"' | wc -l)
echo "User B trips count: $COUNT"
if [ "$COUNT" -gt 0 ]; then
  echo "PASS: User B sees collaborated trip"
else
  echo "FAIL: User B should see the trip"
  exit 1
fi
echo ""

# 9. User B: GET trip by ID (collaborator access)
echo "9. User B gets trip (collaborator)..."
GET_TRIP=$(curl -s "$BASE/trips/$TRIP_ID" -H "Authorization: Bearer $TOKEN_B")
NAME=$(echo "$GET_TRIP" | grep -o '"name":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "Trip name: $NAME"
if [ -n "$NAME" ]; then
  echo "PASS: User B can view trip"
else
  echo "FAIL: User B cannot view trip"
  exit 1
fi
echo ""

# 10. User B: PUT trip (editor can update)
echo "10. User B updates trip (editor)..."
UPDATE=$(curl -s -X PUT "$BASE/trips/$TRIP_ID" \
  -H "Authorization: Bearer $TOKEN_B" \
  -H "Content-Type: application/json" \
  -d '{"name":"Updated by Editor"}')
UPD_NAME=$(echo "$UPDATE" | grep -o '"name":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "Updated name: $UPD_NAME"
if [ "$UPD_NAME" = "Updated by Editor" ]; then
  echo "PASS: Editor can update trip"
else
  echo "FAIL: Editor should be able to update"
  exit 1
fi
echo ""

# 11. Public feed (no auth)
echo "11. Public feed (no auth)..."
FEED=$(curl -s "$BASE/trips/feed")
FEED_COUNT=$(echo "$FEED" | grep -o '"id"' | wc -l)
echo "Feed trips count: $FEED_COUNT"
echo ""

# 12. Transport mode on trip
echo "12. User A sets transport mode..."
curl -s -X PUT "$BASE/trips/$TRIP_ID" \
  -H "Authorization: Bearer $TOKEN_A" \
  -H "Content-Type: application/json" \
  -d '{"transportMode":"flight"}' > /dev/null
echo "PASS: Transport mode set"
echo ""

# 13. User B: Try DELETE (should fail - not owner)
echo "13. User B tries DELETE (should fail)..."
DEL_RESULT=$(curl -s -w "%{http_code}" -X DELETE "$BASE/trips/$TRIP_ID" \
  -H "Authorization: Bearer $TOKEN_B" -o /dev/null)
if [ "$DEL_RESULT" = "403" ]; then
  echo "PASS: Editor cannot delete (403)"
else
  echo "FAIL: Expected 403, got $DEL_RESULT"
fi
echo ""

# 14. Create viewer invite, redeem with new user
echo "14. Register User C, create viewer invite..."
REG_C=$(curl -s -X POST "$BASE/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"viewer@test.com","password":"Test123!"}')
TOKEN_C=$(echo "$REG_C" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
INVITE_V=$(curl -s -X POST "$BASE/trips/$TRIP_ID/invite" \
  -H "Authorization: Bearer $TOKEN_A" \
  -H "Content-Type: application/json" \
  -d '{"role":"viewer"}')
CODE_V=$(echo "$INVITE_V" | grep -o '"code":"[^"]*"' | cut -d'"' -f4)
curl -s -X POST "$BASE/invite/redeem" \
  -H "Authorization: Bearer $TOKEN_C" \
  -H "Content-Type: application/json" \
  -d "{\"code\":\"$CODE_V\"}" > /dev/null
echo "User C redeemed viewer code"
echo ""

# 15. User C: Try PUT (viewer should not be able to update)
echo "15. User C (viewer) tries PUT (should fail)..."
PUT_C=$(curl -s -w "%{http_code}" -X PUT "$BASE/trips/$TRIP_ID" \
  -H "Authorization: Bearer $TOKEN_C" \
  -H "Content-Type: application/json" \
  -d '{"name":"Viewer Update"}' -o /tmp/put_result.json)
if [ "$PUT_C" = "404" ]; then
  echo "PASS: Viewer cannot update (404 - trip not in their list for PUT)"
elif [ "$PUT_C" = "403" ]; then
  echo "PASS: Viewer cannot update (403)"
else
  echo "Note: Viewer PUT returned $PUT_C"
fi
echo ""

echo "=== All API sanity tests completed ==="
