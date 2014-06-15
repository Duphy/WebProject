/**
 * \file resolv.cpp
 */

#include <v8.h>
#include <node.h>
#include <cstdio>
#include <cstdlib>
#include <sstream>
#include <node_buffer.h>
#include "common.h"

#define HEADER_LENGTH	22
typedef struct s_response_header {
	uint32_t length;
	char session_key[SESSION_KEY_LENGTH * 2];
	uint32_t uid;
	int type, subtype;
} response_header;

static void extract_header(const char *buf, response_header* ans) {
	ans->length = 0;
	int pointer = 0;
	ans->length = readInteger(buf, pointer, 4);
	readAsciiString(ans->session_key, buf, pointer, SESSION_KEY_LENGTH);
	readBytes(NULL, buf, pointer, 4);
	ans->uid = readInteger(buf, pointer, UID_LENGTH);
	ans->type = readInteger(buf, pointer, 1);
	ans->subtype = readInteger(buf, pointer, 1);
}
static Local<Array> formJSHeader(const response_header *header) {
	Local<Array> ans = Array::New(5);
	ans->Set(0, Integer::New(header->length));
	ans->Set(1, String::New(header->session_key, SESSION_KEY_LENGTH * 2));
	ans->Set(2, Integer::New(header->uid));
	ans->Set(3, Integer::New(header->type));
	ans->Set(4, Integer::New(header->subtype));
	return ans;
}

/**
 * Array: uid (int32)
 */
Local<Array> resolvUIDs(const char *pack, int &pointer) {
	uint32_t num = readInteger(pack, pointer, 4);
	Local<Array> ans = Array::New(num);
	for (uint32_t i = 0; i < num; i++)
		ans->Set(i, JSreadInteger(pack, pointer, UID_LENGTH));
	return ans;
}

/**
 * Array: EventID (string)
 */
Local<Array> resolvEventIDs(const char *pack, int &pointer) {
	uint32_t num = readInteger(pack, pointer, 4);
	Local<Array> ans = Array::New(num);
	for (uint32_t i = 0; i < num; i++)
		ans->Set(i, JSreadAsciiString(pack, pointer, EVENTID_LENGTH));
	return ans;
}

/**
 * - 0: uid (int32)
 * - 1: eventid (string)
 * - 2: postid (string)
 */
Local<Array> resolvPosting(const char *pack, int &pointer) {
	Local<Array> ans = Array::New(3);
	ans->Set(0, JSreadInteger(pack, pointer, UID_LENGTH));
	ans->Set(1, JSreadAsciiString(pack, pointer, EVENTID_LENGTH));
	ans->Set(2, JSreadAsciiString(pack, pointer, POSTID_LENGTH));
	return ans;
}

/**
 * Array: posting (::resolvPosting)
 */
Local<Array> resolvPostings(const char *pack, int &pointer) {
	uint32_t num = readInteger(pack, pointer, 4);
	Local<Array> ans = Array::New(num);
	for (uint32_t i = 0; i < num; i++)
		ans->Set(i, resolvPosting(pack, pointer));
	return ans;
}

/**
 * Array: tag_string (string)
 */
Local<Array> resolvTags(const char *pack, int &pointer) {
	uint32_t num = readInteger(pack, pointer, 4);
	uint32_t length;
	Local<Array> ans = Array::New(num);
	for (uint32_t i = 0; i < num; i++) {
		length = readInteger(pack, pointer, 1);
		ans->Set(i, JSreadString(pack, pointer, length));
	}
	return ans;
}

/**
 * - 0: rid (int32)
 * - 1: replier_uid (int32)
 * - 2: reply_to_uid (int32)
 * - 3: replyer_name (string)
 * - 4: reply_to_name (string)
 * - 5: reply_content (string)
 * - 6: reply_date (int32)
 * - 7: reply_time (int32)
 * - 8: visibility (int8)
 */
Local<Array> resolvReply(const char *pack, int &pointer) {
	Local<Array> ans = Array::New(9);
	uint32_t replyer_name_len, reply_to_name_len, reply_content_len;
	ans->Set(0, JSreadInteger(pack, pointer, RID_LENGTH));
	ans->Set(1, JSreadInteger(pack, pointer, UID_LENGTH));
	ans->Set(2, JSreadInteger(pack, pointer, UID_LENGTH));
	replyer_name_len = readInteger(pack, pointer, 1);
	ans->Set(3, JSreadString(pack, pointer, replyer_name_len));
	reply_to_name_len = readInteger(pack, pointer, 1);
	ans->Set(4, JSreadString(pack, pointer, reply_to_name_len));
	reply_content_len = readInteger(pack, pointer, 1);
	ans->Set(5, JSreadString(pack, pointer, reply_content_len));
	ans->Set(6, JSreadInteger(pack, pointer, 4));
	ans->Set(7, JSreadInteger(pack, pointer, 4));
	ans->Set(8, JSreadInteger(pack, pointer, 1));
	return ans;
}

/**
 * Array: reply (::resolvReply)
 */
Local<Array> resolvReplies(const char *pack, int &pointer) {
	uint32_t num = readInteger(pack, pointer, 4);
	Local<Array> ans = Array::New(num);
	for (uint32_t i = 0; i < num; i++)
		ans->Set(i, resolvReply(pack, pointer));
	return ans;
}

/**
 * - 0: uid (int32)
 * - 1: nick_name (string)
 * - 2: name (string)
 * - 3: birthday (int32)
 * - 4: gender (int8)
 * - 5: city (string)
 * - 6: tags (::resolvTags)
 * - 7: friends (::resolvUIDs)
 */
Local<Array> resolvUserSimpleOtherPack(const char *pack, int &pointer) {
	Local<Array> ans = Array::New(8);
	ans->Set(0, JSreadInteger(pack, pointer, UID_LENGTH));
	uint32_t length;
	length = readInteger(pack, pointer, 1);
	ans->Set(1, JSreadString(pack, pointer, length));
	length = readInteger(pack, pointer, 1);
	ans->Set(2, JSreadString(pack, pointer, length));
	ans->Set(3, JSreadInteger(pack, pointer, 4));
	ans->Set(4, JSreadInteger(pack, pointer, 1));
	length = readInteger(pack, pointer, 1);
	ans->Set(5, JSreadString(pack, pointer, length));
	ans->Set(6, resolvTags(pack, pointer));
	ans->Set(7, resolvUIDs(pack, pointer));
//TODO Profile picture
	return ans;
}

/**
 * 0: text (string)
 * 1: weight (int64)
 * \todo TODO: int64
 */
Local<Array> resolvWeightedTag(const char *pack, int &pointer) {
	Local<Array> ans = Array::New(2);
	uint32_t length = readInteger(pack, pointer, 1);
	ans->Set(0, JSreadString(pack, pointer, length));
	ans->Set(1, JSreadInteger(pack, pointer, 8));
	return ans;
}

/**
 * Array: weighted_tags (::resolvWeightedTags)
 */
Local<Array> resolvWeightedTags(const char *pack, int &pointer) {
	uint32_t num = readInteger(pack, pointer, 4);
	Local<Array> ans = Array::New(num);
	for (uint32_t i = 0; i < num; i++)
		ans->Set(i, resolvWeightedTag(pack, pointer));
	return ans;
}

/**
 * Array: honor (int8)
 */
Local<Array> resolvHonors(const char *pack, int &pointer) {
	uint32_t num = readInteger(pack, pointer, 1);
	Local<Array> ans = Array::New(num);
	for (uint32_t i = 0; i < num; i++)
		ans->Set(i, JSreadInteger(pack, pointer, 1));
	return ans;
}

/**
 * - 0: eventid (string)
 * - 1: name (string)
 * - 2: creator_uid (int32)
 * - 3: description (string)
 * - 4: tags (::resolvTags)
 * - 5: city (string)
 * - 6: rating (int32)
 * - 7: honors (::resolvHonors)
 */
Local<Array> resolvEventSimpleOtherPack(const char *pack, int &pointer) {
	Local<Array> ans = Array::New(8);
	ans->Set(0, JSreadAsciiString(pack, pointer, EVENTID_LENGTH));
	uint32_t length = readInteger(pack, pointer, 1);
	ans->Set(1, JSreadString(pack, pointer, length));
	ans->Set(2, JSreadInteger(pack, pointer, UID_LENGTH));
	length = readInteger(pack, pointer, 1);
	ans->Set(3, JSreadString(pack, pointer, length));
	ans->Set(4, resolvTags(pack, pointer));
	length = readInteger(pack, pointer, 1);
	ans->Set(5, JSreadString(pack, pointer, length));
	ans->Set(6, JSreadInteger(pack, pointer, 4));
	ans->Set(7, resolvHonors(pack, pointer));
	return ans;
}

/**
 * - 0: uid (int32)
 * - 1: name (string)
 * - 2: nick_name (string)
 * - 3: birthday (int32)
 * - 4: tags (::resolvTags)
 * - 5: hidden_tags (::resolvTags)
 * - 6: rating (int32)
 * - 7: honors (::resolvHonors)
 * - 8: gender (int8)
 * - 9: city (string)
 * - 10: state (string)
 * - 11: country (string)
 */
Local<Array> resolvUserSimplePack(const char *pack, int &pointer) {
	Local<Array> ans = Array::New(12);
	ans->Set(0, JSreadInteger(pack, pointer, UID_LENGTH));
	uint32_t length = readInteger(pack, pointer, 1);
	ans->Set(1, JSreadString(pack, pointer, length));
	length = readInteger(pack, pointer, 1);
	ans->Set(2, JSreadString(pack, pointer, length));
	ans->Set(3, JSreadInteger(pack, pointer, 4));
	ans->Set(4, resolvTags(pack, pointer));
	ans->Set(5, resolvTags(pack, pointer));
	ans->Set(6, JSreadInteger(pack, pointer, 4));
	ans->Set(7, resolvHonors(pack, pointer));
	ans->Set(8, JSreadInteger(pack, pointer, 1));
	length = readInteger(pack, pointer, 1);
	ans->Set(9, JSreadString(pack, pointer, length));
	length = readInteger(pack, pointer, 1);
	ans->Set(10, JSreadString(pack, pointer, length));
	length = readInteger(pack, pointer, 1);
	ans->Set(11, JSreadString(pack, pointer, length));
//TODO Profile picture
	return ans;
}

/**
 * - 0: news_visibility (int8)
 * - 1: friend_request_setting (int8)
 * - 2: event_invitation_setting (int8)
 * - 3: message_notification_setting (int8)
 * - 4: strangers_message_setting (int8)
 */
Local<Array> resolvUserSettingPack(const char *pack, int &pointer) {
	uint32_t num = readInteger(pack, pointer, 1);
	Local<Array> ans = Array::New();
	for (uint32_t i = 0; i < num; i++) {
		uint32_t type = readInteger(pack, pointer, 1);
		ans->Set(type, JSreadInteger(pack, pointer, 1));
	}
	return ans;
}

/**
 * - 0: uid (int32)
 * - 1: eventid (string)
 * - 2: sid (int32)
 * - 3: start_date (int32)
 * - 4: start_time (int32)
 * - 5: end_date (int32)
 * - 6: end_time (int32)
 * - 7: place (string)
 * - 8: description (string)
 * - 9: with_users (::resolvUIDs)
 */
Local<Array> resolvSchedule(const char *pack, int &pointer) {
	Local<Array> ans = Array::New(10);
	ans->Set(0, JSreadInteger(pack, pointer, UID_LENGTH));
	ans->Set(1, JSreadAsciiString(pack, pointer, EVENTID_LENGTH));
	ans->Set(2, JSreadInteger(pack, pointer, SID_LENGTH));
	ans->Set(3, JSreadInteger(pack, pointer, 4));
	ans->Set(4, JSreadInteger(pack, pointer, 4));
	ans->Set(5, JSreadInteger(pack, pointer, 4));
	ans->Set(6, JSreadInteger(pack, pointer, 4));
	uint32_t length = readInteger(pack, pointer, 1);
	ans->Set(7, JSreadString(pack, pointer, length));
	length = readInteger(pack, pointer, 1);
	ans->Set(8, JSreadString(pack, pointer, length));
	ans->Set(9, resolvUIDs(pack, pointer));
	return ans;
}

/**
 * Array: schedule (::resolvSchedule)
 */
Local<Array> resolvSchedules(const char *pack, int &pointer) {
	uint32_t num = readInteger(pack, pointer, 4);
	Local<Array> ans = Array::New(num);
	for (uint32_t i = 0; i < num; i++)
		ans->Set(i, resolvSchedule(pack, pointer));
	return ans;
}

/**
 * - 0: attribute (int8)
 * - 1: success (boolean)
 */
Local<Array> resolvUpdate(const char *pack, int &pointer) {
	Local<Array> ans = Array::New(2);
	ans->Set(0, JSreadInteger(pack, pointer, 1));
	ans->Set(1, JSreadBool(pack, pointer));
	return ans;
}

/**
 * Array: update (::resolvUpdate)
 */
Local<Array> resolvUpdates(const char *pack, int &pointer) {
	uint32_t num = readInteger(pack, pointer, 1);
	Local<Array> ans = Array::New(num);
	for (uint32_t i = 0; i < num; i++)
		ans->Set(i, resolvUpdate(pack, pointer));
	return ans;
}

/**
 * - 0: subtype2 (int8)
 * - 1: seqNo (int32)
 * - 2: uid (int32)
 * - 3: eventid (string)
 * - 4: pid (string)
 * - 5: action (int8)
 * - friend-request:
 * 		- 6: sender_name (string)
 * 		- 7: message (string)
 * - event-membership-request:
 * 		- 6: sender_name (string)
 * 		- 7: event_name (string)
 * 		- 8: message (string)
 * - reply-posting:
 * 		- 6: sender_name (string)
 * 		- 7: message (string)
 * - other:
 * 		- 6: message (string)
 */
Local<Array> resolvNotification(const char *pack, int &pointer) {
	Local<Array> ans = Array::New(7);
	uint32_t msg_len;
	uint32_t subtype = readInteger(pack, pointer, 1);
	ans->Set(0, Integer::New(subtype));
	ans->Set(1, JSreadInteger(pack, pointer, 4));
	ans->Set(2, JSreadInteger(pack, pointer, UID_LENGTH));
	ans->Set(3, JSreadAsciiString(pack, pointer, EVENTID_LENGTH));
	ans->Set(4, JSreadAsciiString(pack, pointer, POSTID_LENGTH));
	ans->Set(5, JSreadInteger(pack, pointer, 1));
	msg_len = readInteger(pack, pointer, 1);
	switch (subtype) {
	case 0:
		ans->Set(6, JSreadString(pack, pointer, 40));
		ans->Set(7, JSreadString(pack, pointer, msg_len - 40));
		break;
	case 1:
		ans->Set(6, JSreadString(pack, pointer, 30));
		ans->Set(7, JSreadString(pack, pointer, 40));
		ans->Set(8, JSreadString(pack, pointer, msg_len - 70));
		break;
	case 2:
		ans->Set(6, JSreadString(pack, pointer, 48));
		ans->Set(7, JSreadString(pack, pointer, msg_len - 48));
		break;
	default:
		ans->Set(6, JSreadString(pack, pointer, msg_len));
		break;
	}
	return ans;
}

/**
 * Array: notification (::resolvNotification)
 */
Local<Array> resolvNotifications(const char *pack, int &pointer) {
	uint32_t num = readInteger(pack, pointer, 4);
	Local<Array> ans = Array::New(num);
	for (uint32_t i = 0; i < num; i++)
		ans->Set(i, resolvNotification(pack, pointer));
	return ans;
}

/**
 * Array: picid (string)
 */
Local<Array> resolvPictures(const char *pack, int &pointer) {
	uint32_t num = readInteger(pack, pointer, 4);
	Local<Array> ans = Array::New(num);
	for (uint32_t i = 0; i < num; i++)
		ans->Set(i, JSreadAsciiString(pack, pointer, PICID_LENGTH));
	return ans;
}

/**
 * Array: fileid (string)
 */
Local<Array> resolvFiles(const char *pack, int &pointer) {
	uint32_t num = readInteger(pack, pointer, 4);
	Local<Array> ans = Array::New(num);
	for (uint32_t i = 0; i < num; i++)
		ans->Set(i, JSreadAsciiString(pack, pointer, FILEID_LENGTH));
	return ans;
}

/**
 * Array: pubid (string)
 */
Local<Array> resolvPubpages(const char *pack, int &pointer) {
	uint32_t num = readInteger(pack, pointer, 4);
	Local<Array> ans = Array::New(num);
	for (uint32_t i = 0; i < num; i++)
		ans->Set(i, JSreadAsciiString(pack, pointer, PUBID_LENGTH));
	return ans;
}

/**
 * 0: pubid
 * 1: ad_id
 */
Local<Array> resolvAdvertisement(const char *pack, int &pointer) {
	Local<Array> ans = Array::New(2);
	ans->Set(0, JSreadAsciiString(pack, pointer, PUBID_LENGTH));
	ans->Set(1, JSreadAsciiString(pack, pointer, ADID_LENGTH));
	return ans;
}

/**
 * Array: advertisement (::resolvAdvertisement)
 */
Local<Array> resolvAdvertisements(const char *pack, int &pointer) {
	uint32_t num = readInteger(pack, pointer, 4);
	Local<Array> ans = Array::New(num);
	for (uint32_t i = 0; i < num; i++)
		ans->Set(i, resolvAdvertisement(pack, pointer));
	return ans;
}
/**
 * - \b "0 0 View User"
 * 		- 0: viewee_uid (int32)
 * 		- 1: mode (int8)
 * 		- \b "0 0 0 View user's friends"
 * 			- 2: friends (::resolvUIDs)
 * 		- \b "0 0 1 View user's events"
 * 			- 2: events (::resolvEventIDs)
 * 		- \b "0 0 2 View user's postings"
 * 			- 2: postings (::resolvPostings)
 * 		- \b "0 0 4 View user's info"
 * 			- 2: info (::resolvUserSimpleOtherPack)
 * 		- \b "0 0 23 View user's big avarta"
 * 		- \b "0 0 24 View user's small avarta"
 * 			- 2: version_date (int32)
 * 			- 3: version_time (int32)
 * 			- 4: avarta_file_path (string)
 */

/**
 * - \b "0 1 View event"
 * 		- 0: eventid (asciistring)
 * 		- 1: mode (int8)
 * 		- \b "0 1 0 View event's members"
 * 			- 2: members (::resolvUIDs)
 * 		- \b "0 1 2 View event's postings"
 * 			- 2: postings (::resolvPostings)
 * 		- \b "0 1 4 View event's info"
 * 			- 2: info (::resolvEventSimpleOtherPack)
 * 		- \b "0 1 5 View event's managers"
 * 			- 2: managers (::resolvUIDs)
 * 		- \b "0 1 6 View event's settings"
 * 		- \b "0 1 17 View event's schedules"
 * 			- 2: schedules (::resolvSchedules)
 * 		- \b "0 1 18 View event's circatags"
 * 			- 2: opt (int8)
 * 			- 3: circatags (::resolvWeightedTags)
 * 		- \b "0 1 23 View event's big avarta"
 * 		- \b "0 1 24 View event's small avarta"
 */

/**
 * - \b "0 2 View posting"
 * 		- 0: pid (string)
 * 		- 1: poster_uid (int32)
 * 		- 2: event_eid (string)
 * 		- 3: post_date (int32)
 * 		- 4: post_time (int32)
 * 		- 5: poster_name (string)
 * 		- 6: event_name (string)
 * 		- 7: content (string)
 * 		- 8: visibility (int8)
 * 		- 9: tags (::resolvTags)
 * 		- 10: replies (::resolvReplies)
 * 		- 11: pictures (::resolvPictures)
 * 		- 12: files (::resolvFiles)
 */

/**
 * - \b "0 10 View mass postings"
 * 		- Array: posting (::resolvPosting)
 */

/**
 * - \b "0 11 View self"
 * 		- 0: mode (int8)
 * 		- \b "0 11 0 View self's friends"
 * 			- 1: friends (::resolvUIDs)
 * 		- \b "0 11 1 View self's events"
 * 			- 1: events (::resolvEventIDs)
 * 		- \b "0 11 2 View self's postings"
 * 			- 1: postings (::resolvPostings)
 * 		- \b "0 11 4 View self's info"
 * 			- 1: info (::resolvUserSimplePack)
 * 		- \b "0 11 6 View self's settings"
 * 			- 1: settings (::resolvUserSettingPack)
 * 		- \b "0 11 17 View self's schedules"
 * 			- 1: schedules (resolvSchedules)
 * 		- \b "0 11 18 View self's circatags"
 * 			- 1: opt (int8)
 * 			- 2: circatags (::resolvWeightedTags)
 * 		- \b "0 11 23 View self's big avarta"
 * 		- \b "0 11 24 View self's small avarta"
 * 		- \b "0 11 30 View self's pubpages"
 * 			- 1: pubpages (::resolvPubpages)
 */

/**
 * - \b "0 30 View pubpage"
 * 		- 0: eid (string)
 * 		- 1: subtype2 (int8)
 * 		- \b "0 30 4 View pubpage's info"
 * 			- 2: eid (string)
 * 			- 3: name (string)
 * 			- 4: creator (int32)
 * 			- 5: description (string)
 * 			- 6: tags (::resolvTags)
 * 			- 7: city (string)
 *			- 8: rating (int32)
 *			- 9: honors (::resolvHonors)
 * 		- \b "0 30 23 View pubpage's big avarta"
 * 		- \b "0 30 24 View pubpage's small avarta"
 * 			- 2: version_date (int32)
 * 			- 3: version_time (int32)
 * 			- 4: avarta_file_path (string)
 * 		- \b "0 30 31 View pubpage's advertisement"
 * 			- 2: ads (::resolvAdvertisements)
 */

/**
 * - \b "0 31 View advertisement"
 * 		- 0: ad_id (string)
 * 		- 1: poster_uid (int32)
 * 		- 2: pubid (string)
 * 		- 3: post_date (int32)
 * 		- 4: post_time (int32)
 * 		- 5: pubpage_name (string)
 * 		- 6: content (string)
 * 		- 7: visibility (int8)
 * 		- 8: tags (::resolvTags)
 * 		- 9: pictures (::resolvPictures)
 */

/**
 * - \b "0 40 View picture"
 * 		- 0: picid (string)
 * 		- 1: picture_path (string)
 */
Handle<Value> resolvViewPack(const char *pack, const response_header &header) {
	int pointer = HEADER_LENGTH, mode;
	Local<Array> ans;
	switch (header.subtype) {
	case 0: // View user
	{
		ans = Array::New(2);
		uint32_t viewee = readInteger(pack, pointer, UID_LENGTH);
		ans->Set(0, Integer::New(viewee)); // viewee_uid
		mode = readInteger(pack, pointer, 1);
		ans->Set(1, Integer::New(mode)); // subtype2
		switch (mode) {
		case 0: // View user's friends
			ans->Set(2, resolvUIDs(pack, pointer)); // friends
			break;
		case 1: // View user's events
			ans->Set(2, resolvEventIDs(pack, pointer)); // events
			break;
		case 2: // View user's posting
			ans->Set(2, resolvPostings(pack, pointer)); // postings
			break;
		case 4: // View user's info
			ans->Set(2, resolvUserSimpleOtherPack(pack, pointer)); // user simple other pack
			break;
		case 9: // View common friends
			ans->Set(2, resolvUIDs(pack, pointer));
			break;
		case 18: // View user's circatag
			ans->Set(2, JSreadInteger(pack, pointer, 1)); // opt
			ans->Set(3, resolvWeightedTags(pack, pointer)); // circatag pack
			break;
		case 23: // View user's avarta big
		case 24: // View user's avarta small
		{
			unsigned int date = readInteger(pack, pointer, 4);
			ans->Set(2, Integer::New(date)); // version date
			unsigned int time = readInteger(pack, pointer, 4);
			ans->Set(3, Integer::New(time)); // version time
			std::ostringstream os;
			os << "public/data/" << viewee << "/avarta/" << date << "_" << time
					<< (mode == 23 ? "" : "_small") << ".jpg";
			ans->Set(4, JSreadFile(pack, pointer, os.str()));
			break;
		}
		}
		break;
	}
	case 1: // View event
		ans = Array::New(2);
		ans->Set(0, JSreadAsciiString(pack, pointer, EVENTID_LENGTH)); // eid
		mode = readInteger(pack, pointer, 1);
		ans->Set(1, Integer::New(mode)); // subtype2
		switch (mode) {
		case 0: // View member event
			ans->Set(2, resolvUIDs(pack, pointer)); // members
			break;
		case 2: // View posting event
			ans->Set(2, resolvPostings(pack, pointer)); // postings
			break;
		case 4: // View event's info
			ans->Set(2, resolvEventSimpleOtherPack(pack, pointer)); // event simple other pack
			break;
		case 5: // View managers event
			ans->Set(2, resolvUIDs(pack, pointer)); // managers
			break;
		case 6: // TODO View event's setting pack
			break;
		case 17: // View schedule event
			ans->Set(2, resolvSchedules(pack, pointer)); // schedules
			break;
		case 18: // View Circatag_Pack
			ans->Set(2, JSreadInteger(pack, pointer, 1)); // opt
			ans->Set(3, resolvWeightedTags(pack, pointer)); // circatags
			break;
		case 23: // View user's avarta big
			// TODO avarta
		case 24:			// View user's avarta small
			// TODO avarta
			break;
		}
		break;
	case 2: // View posting
		if (header.length <= HEADER_LENGTH + 1)
			return Undefined();
		ans = Array::New(11);
		int length;
		ans->Set(0, JSreadAsciiString(pack, pointer, POSTID_LENGTH)); // pid
		ans->Set(1, JSreadInteger(pack, pointer, UID_LENGTH)); // poster
		ans->Set(2, JSreadAsciiString(pack, pointer, EVENTID_LENGTH)); // eid
		ans->Set(3, JSreadInteger(pack, pointer, 4)); // post_date
		ans->Set(4, JSreadInteger(pack, pointer, 4)); // post_time
		length = readInteger(pack, pointer, 1);
		ans->Set(5, JSreadString(pack, pointer, length)); // poster name
		length = readInteger(pack, pointer, 1);
		ans->Set(6, JSreadString(pack, pointer, length)); // event name
		length = readInteger(pack, pointer, 2);
		ans->Set(7, JSreadString(pack, pointer, length)); // content
		ans->Set(8, JSreadInteger(pack, pointer, 1)); // visibility
		ans->Set(9, resolvTags(pack, pointer)); // tags
		ans->Set(10, resolvReplies(pack, pointer)); // replies
		ans->Set(11, resolvPictures(pack, pointer)); // pictures
		ans->Set(12, resolvFiles(pack, pointer)); // files
		break;
	case 10: // View user's posting
		return resolvPostings(pack, pointer);
		break;
	case 11: // View self
		ans = Array::New(2);
		mode = readInteger(pack, pointer, 1);
		ans->Set(0, Integer::New(mode));
		switch (mode) {
		case 0: // View self's friends
			ans->Set(1, resolvUIDs(pack, pointer)); // friends
			break;
		case 1: // View self's events
			ans->Set(1, resolvEventIDs(pack, pointer)); // events
			break;
		case 2: // View self's posting
			ans->Set(1, resolvPostings(pack, pointer)); // postings
			break;
		case 4: // View self's info
			ans->Set(1, resolvUserSimplePack(pack, pointer)); // info
			break;
		case 6: // View self's settings
			ans->Set(1, resolvUserSettingPack(pack, pointer)); // settings
			break;
		case 17: // View self's schedules
			ans->Set(1, resolvSchedules(pack, pointer)); // schedules
			break;
		case 18: // View self's circatag
			ans->Set(1, JSreadInteger(pack, pointer, 1)); // opt
			ans->Set(2, resolvWeightedTags(pack, pointer)); // circatags
			break;
		case 23: //View self's avarta big
		case 24: //View self's avarta small
		{
			unsigned int date = readInteger(pack, pointer, 4);
			ans->Set(1, Integer::New(date)); // version date
			unsigned int time = readInteger(pack, pointer, 4);
			ans->Set(2, Integer::New(time)); // version time
			std::ostringstream os;
			os << "public/data/" << header.uid << "/avarta/" << date << "_"
					<< time << (mode == 23 ? "" : "_small") << ".jpg";
			ans->Set(3, JSreadFile(pack, pointer, os.str()));
			break;
		}
		case 30: // View self's pubpages
			ans->Set(1, resolvPubpages(pack, pointer)); // pubpages
			break;
		}
		break;
	case 30: // View pubpage
		ans = Array::New(2);
		ans->Set(0, JSreadAsciiString(pack, pointer, EVENTID_LENGTH)); // eid
		mode = readInteger(pack, pointer, 1);
		ans->Set(1, Integer::New(mode)); // subtype2
		switch (mode) {
		case 4: // View pubpage's info
			ans->Set(2, JSreadAsciiString(pack, pointer, EVENTID_LENGTH)); // eid
			length = readInteger(pack, pointer, 1);
			ans->Set(3, JSreadString(pack, pointer, length)); // name
			ans->Set(4, JSreadInteger(pack, pointer, UID_LENGTH)); // creater
			length = readInteger(pack, pointer, 1);
			ans->Set(5, JSreadString(pack, pointer, length)); // description
			ans->Set(6, resolvTags(pack, pointer)); // tags
			length = readInteger(pack, pointer, 1);
			ans->Set(7, JSreadString(pack, pointer, length)); // city
			ans->Set(8, JSreadInteger(pack, pointer, 4)); // rating
			ans->Set(9, resolvHonors(pack, pointer)); // honors
			break;
		case 23: // View pubpage's big avarta
		case 24: // View pubpage's small avarta
			// TODO: avarta
			break;
		case 31: // View pubpage's advertisement
			ans->Set(2, resolvAdvertisements(pack, pointer));
			break;
		}
		break;
	case 31: // View advertisement
		ans = Array::New(10);
		ans->Set(0, JSreadAsciiString(pack, pointer, ADID_LENGTH));
		ans->Set(1, JSreadInteger(pack, pointer, UID_LENGTH));
		ans->Set(2, JSreadAsciiString(pack, pointer, PUBID_LENGTH));
		ans->Set(3, JSreadInteger(pack, pointer, 4));
		ans->Set(4, JSreadInteger(pack, pointer, 4));
		length = readInteger(pack, pointer, 1);
		ans->Set(5, JSreadString(pack, pointer, length));
		length = readInteger(pack, pointer, 2);
		ans->Set(6, JSreadString(pack, pointer, length));
		ans->Set(7, JSreadInteger(pack, pointer, 1));
		ans->Set(8, resolvTags(pack, pointer));
		ans->Set(9, resolvPictures(pack, pointer));
		break;
	}
	return ans;
}

/**
 * - \b "1 0 Search user"
 * 		- Array: member (int32)
 */

/**
 * - \b "1 1 Search event"
 * 		- Array: eventid (string)
 */

/**
 * - \b "1 2 Search posting"
 * 		- Array: posting (::resolvPosting)
 */

/**
 * - \b "1 30 Search pubpage"
 * 		- Array: pub_eid (string)
 */

/**
 * - \b "1 31 Search ads"
 * 		- Array: advertisement (::resolvAdvertisement)
 */
Handle<Value> resolvSearchPack(const char *pack,
		const response_header &header) {
	int pointer = HEADER_LENGTH;
	switch (header.subtype) {
	case 0:			//Search User
		return resolvUIDs(pack, pointer);
		break;
	case 1:			//Search Event
		return resolvEventIDs(pack, pointer);
		break;
	case 2:			//Search Posting
		return resolvPostings(pack, pointer);
		break;
	case 30: // Search pubpage
		return resolvPubpages(pack, pointer);
		break;
	case 31: // Search advertisement
		return resolvAdvertisements(pack, pointer);
		break;
	}
	return Undefined();
}

/**
 * - \b "2 0 Create user"
 * 		- 0: success (boolean)
 * 		- \b "if success"
 * 			- 1: uid (int32)
 * 		- \b "else"
 * 			- 1: reason (int8)
 */

/**
 * - \b "2 1 Create event"
 * 		- 0: success (boolean)
 * 		- \b "if success"
 * 			- 1: eventid (string)
 * 		- \b "else"
 * 			- 1: reason (int8)
 */

/**
 * - \b "2 2 Create posting"
 * 		- 0: success (boolean)
 * 		- \b "if success"
 * 			- 1: posting (posting)
 * 		- \b "else"
 * 			- 1: reason (int8)
 */

/**
 * - \b "2 3 Create request"
 * 		- 0: success (boolean)
 * 		- 1: type (int8)
 * 		- \b "2 3 0 Create friend request"
 * 			- 2: requested_uid (int32)
 * 			- 3: message (string)
 * 			- \b "if not success"
 * 				- 4: reason (int8)
 * 		- \b "2 3 1 Create join event"
 * 			- 2: eventid (string)
 * 			- 3: message (string)
 * 			- \b "if not success"
 * 				- 4: reason (int8)
 * 		- \b "2 3 2 Create invitation to event"
 * 			- 2: uid (int32)
 * 			- 3: eventid (string)
 * 			- 4: message (string)
 * 			- \b "if not success"
 * 				- 5: reason (int8)
 */

/**
 * - \b "2 17 Create schedule"
 *		- 0: success (boolean)
 *		- \b "if success"
 *			- 1: uid (int32)
 *			- 2: eventid (string)
 *			- 3: sid (int32)
 *		- \b "else"
 * 			- 1: reason (int8)
 */

/**
 * - \b "2 31 Create advertisement"
 * 		- 0: success (boolean)
 * 		- \b "if success"
 * 			- 1: uid (int32)
 * 			- 2: eventid (string)
 * 			- 3: pid (string)
 * 		- \b "else"
 * 			- 1: reason(int8)
 */
Local<Array> resolvCreatePack(const char *pack, const response_header &header) {
	int pointer = HEADER_LENGTH;
	bool succ;
	Local<Array> ans = Array::New(1);
	int type, length;
	switch (header.subtype) {
	case 0: // Create User
		succ = readBool(pack, pointer);
		ans->Set(0, Boolean::New(succ));
		if (succ) {
			ans->Set(1, JSreadInteger(pack, pointer, UID_LENGTH));
		} else {
			ans->Set(1, JSreadInteger(pack, pointer, 1));
		}
		break;
	case 1: // Create Event
		succ = readBool(pack, pointer);
		ans->Set(0, Boolean::New(succ));
		if (succ) {
			ans->Set(1, JSreadAsciiString(pack, pointer, EVENTID_LENGTH));
		} else {
			ans->Set(1, JSreadInteger(pack, pointer, 1));
		}
		break;
	case 2: // Create Posting
		succ = readBool(pack, pointer);
		ans->Set(0, Boolean::New(succ));
		if (succ) {
			ans->Set(1, resolvPosting(pack, pointer));
		} else {
			ans->Set(1, JSreadInteger(pack, pointer, 1));
		}
		break;
	case 3: // Create Request
		type = readInteger(pack, pointer, 1);
		ans->Set(1, Integer::New(type));
		switch (type) {
		case 0:
			ans->Set(2, JSreadInteger(pack, pointer, UID_LENGTH));
			length = readInteger(pack, pointer, 1);
			ans->Set(3, JSreadString(pack, pointer, length));
			succ = readBool(pack, pointer);
			ans->Set(0, Boolean::New(succ));
			if (!succ)
				ans->Set(4, JSreadInteger(pack, pointer, 1));
			break;
		case 1:
			ans->Set(2, JSreadAsciiString(pack, pointer, EVENTID_LENGTH));
			length = readInteger(pack, pointer, 1);
			ans->Set(3, JSreadString(pack, pointer, length));
			succ = readBool(pack, pointer);
			ans->Set(0, Boolean::New(succ));
			if (!succ)
				ans->Set(4, JSreadInteger(pack, pointer, 1));
			break;
		case 2:
			ans->Set(2, JSreadInteger(pack, pointer, UID_LENGTH));
			ans->Set(3, JSreadAsciiString(pack, pointer, EVENTID_LENGTH));
			length = readInteger(pack, pointer, 1);
			ans->Set(4, JSreadString(pack, pointer, length));
			succ = readBool(pack, pointer);
			ans->Set(0, Boolean::New(succ));
			if (!succ)
				ans->Set(5, JSreadInteger(pack, pointer, 1));
			break;
		}
		break;
	case 17: // Create Schedule
		succ = readBool(pack, pointer);
		ans->Set(0, Boolean::New(succ));
		if (succ) {
			ans->Set(1, JSreadInteger(pack, pointer, UID_LENGTH));
			ans->Set(2, JSreadAsciiString(pack, pointer, EVENTID_LENGTH));
			ans->Set(3, JSreadInteger(pack, pointer, 4));
		} else {
			ans->Set(1, JSreadInteger(pack, pointer, 1));
		}
		break;
	case 31: // Create advertisement
		succ = readBool(pack, pointer);
		ans->Set(0, Boolean::New(succ));
		if (succ) {
			ans->Set(1, JSreadInteger(pack, pointer, UID_LENGTH));
			ans->Set(2, JSreadAsciiString(pack, pointer, EVENTID_LENGTH));
			ans->Set(3, JSreadInteger(pack, pointer, 4));
		} else {
			ans->Set(1, JSreadInteger(pack, pointer, 1));
		}
	}
	return ans;
}

/**
 * - \b "3 0 Update user"
 * 		- Array: updates (::resolvUpdates)
 */

/**
 * - \b "3 1 Update event"
 * 		- 0: eventid (string)
 * 		- 1: updates (::resolvUpdates)
 */

/**
 * - \b "3 23 Update big avarta"
 * 		- 0: mode (int8)
 * 		- \b "3 23 0 Update big avarta for user"
 * 			- 1: uid (int32)
 * 			- 2: success (boolean)
 *			- \b "if success"
 * 				- 3: version_date (int32)
 * 				- 4: version_time (int32)
 * 		- \b "3 23 1 Update big avarta for event"
 * 			- 1: uid (int32)
 * 			- 2: eventid (string)
 * 			- 3: success (boolean)
 *			- \b "if success"
 * 				- 4: version_date (int32)
 * 				- 5: version_time (int32)
 */

/**
 * - \b "3 24 Update small avarta"
 * 		- 0: mode (int8)
 * 		- \b "3 24 0 Update small avarta for user"
 * 			- 1: uid (int32)
 * 			- 2: success (boolean)
 *			- \b "if success"
 * 				- 3: version_date (int32)
 * 				- 4: version_time (int32)
 * 		- \b "3 24 1 Update small avarta for event"
 * 			- 1: uid (int32)
 * 			- 2: eventid (string)
 * 			- 3: success (boolean)
 *			- \b "if success"
 * 				- 4: version_date (int32)
 * 				- 5: version_time (int32)
 */

/**
 * - \b "3 30 Update advertisement"
 * 		- 0: eid (string)
 * 		- 1: updates (::resolvUpdates)
 */
Local<Array> resolvUpdatePack(const char *pack, const response_header &header) {
	int pointer = HEADER_LENGTH, mode;
	bool succ;
	Local<Array> ans;
	switch (header.subtype) {
	case 0: //updates
		return resolvUpdates(pack, pointer);
		break;
	case 1: //event updates
		ans = Array::New(2);
		ans->Set(0, JSreadAsciiString(pack, pointer, EVENTID_LENGTH));
		ans->Set(1, resolvUpdates(pack, pointer));
		break;
	case 23: //avarta
		mode = readInteger(pack, pointer, 1);
		switch (mode) {
		case 0: //User
			ans = Array::New(3);
			ans->Set(0, Integer::New(mode));
			ans->Set(1, JSreadInteger(pack, pointer, UID_LENGTH));
			succ = readBool(pack, pointer);
			ans->Set(2, Boolean::New(succ));
			if (succ) {
				ans->Set(3, JSreadInteger(pack, pointer, 4));
				ans->Set(4, JSreadInteger(pack, pointer, 4));
			}
			break;
		case 1: //User and Event
			ans = Array::New(4);
			ans->Set(0, Integer::New(mode));
			ans->Set(1, JSreadInteger(pack, pointer, UID_LENGTH));
			ans->Set(2, JSreadAsciiString(pack, pointer, EVENTID_LENGTH));
			succ = readBool(pack, pointer);
			ans->Set(3, Boolean::New(succ));
			if (succ) {
				ans->Set(4, JSreadInteger(pack, pointer, 4));
				ans->Set(5, JSreadInteger(pack, pointer, 4));
			}
			break;
		}
		break;
	case 24: //avarta
		mode = readInteger(pack, pointer, 1);
		switch (mode) {
		case 0: //User
			ans = Array::New(3);
			ans->Set(0, Integer::New(mode));
			ans->Set(1, JSreadInteger(pack, pointer, UID_LENGTH));
			succ = readBool(pack, pointer);
			ans->Set(2, Boolean::New(succ));
			if (succ) {
				ans->Set(3, JSreadInteger(pack, pointer, 4));
				ans->Set(4, JSreadInteger(pack, pointer, 4));
			}
			break;
		case 1: //User and Event
			ans = Array::New(4);
			ans->Set(0, Integer::New(mode));
			ans->Set(1, JSreadInteger(pack, pointer, UID_LENGTH));
			ans->Set(2, JSreadAsciiString(pack, pointer, EVENTID_LENGTH));
			succ = readBool(pack, pointer);
			ans->Set(3, Boolean::New(succ));
			if (succ) {
				ans->Set(4, JSreadInteger(pack, pointer, 4));
				ans->Set(5, JSreadInteger(pack, pointer, 4));
			}
			break;
		}
		break;
	case 30: // Update advertisement
		ans->Set(0, JSreadAsciiString(pack, pointer, EVENTID_LENGTH));
		ans->Set(1, resolvUpdates(pack, pointer));
		break;
	}
	return ans;
}

/**
 * - \b "4 2 Reply posting
 * 		- 0: poster_uid (int32)
 * 		- 1: reply_to_uid (int32)
 * 		- 2: eventid (string)
 * 		- 3: pid (string)
 * 		- 4: acknowledgement (int8)
 */
Local<Array> resolvReplyPack(const char *pack, const response_header &header) {
	int pointer = HEADER_LENGTH;
	Local<Array> ans = Array::New(5);
	ans->Set(0, JSreadInteger(pack, pointer, UID_LENGTH));
	ans->Set(1, JSreadInteger(pack, pointer, UID_LENGTH));
	ans->Set(2, JSreadAsciiString(pack, pointer, EVENTID_LENGTH));
	ans->Set(3, JSreadAsciiString(pack, pointer, EVENTID_LENGTH));
	ans->Set(4, JSreadInteger(pack, pointer, 1));
	return ans;
}

/**
 * - \b "5 0 Delete friend"
 * 		- 0: friend_uid (int32)
 * 		- 1: success (boolean)
 */

/**
 * - \b "5 2 Delete posting"
 * 		- 0: uid (int32)
 * 		- 1: eventid (string)
 * 		- 2: pid (string)
 * 		- 3: success (boolean)
 */

/**
 * - \b "5 17 Delete schedule"
 * 		- 0: uid (int32)
 * 		- 1: eventid (string)
 * 		- 2: sid (int32)
 * 		- 3: success (boolean)
 */

/**
 * - \b "5 22 Delete replies"
 *		- 0: your_uid (int32)
 *		- 1: target_uid (int32)
 *		- 2: eventid (string)
 *		- 3: pid (string)
 *		- 4: rid (int32)
 *		- 5: success (boolean)
 */

/**
 * - \b "5 31 Delete advertisement"
 * 		- 0: pubid (string)
 * 		- 1: ad_id (string)
 * 		- 2: success (boolean)
 */
Local<Array> resolvDeletePack(const char *pack, const response_header &header) {
	int pointer = HEADER_LENGTH;
	Local<Array> ans;
	switch (header.subtype) {
	case 0: //delete friends
		ans = Array::New(2);
		ans->Set(0, JSreadInteger(pack, pointer, UID_LENGTH));
		ans->Set(1, JSreadBool(pack, pointer));
		break;
	case 2: //delete posting
		ans = Array::New(4);
		ans->Set(0, JSreadInteger(pack, pointer, UID_LENGTH));
		ans->Set(1, JSreadAsciiString(pack, pointer, EVENTID_LENGTH));
		ans->Set(2, JSreadAsciiString(pack, pointer, POSTID_LENGTH));
		ans->Set(3, JSreadBool(pack, pointer));
		break;
	case 17: //delete schedule
		ans = Array::New(4);
		ans->Set(0, JSreadInteger(pack, pointer, UID_LENGTH));
		ans->Set(1, JSreadAsciiString(pack, pointer, EVENTID_LENGTH));
		ans->Set(2, JSreadInteger(pack, pointer, SID_LENGTH));
		ans->Set(3, JSreadBool(pack, pointer));
		break;
	case 22: //delete replies
		ans = Array::New(6);
		ans->Set(0, JSreadInteger(pack, pointer, UID_LENGTH));
		ans->Set(1, JSreadInteger(pack, pointer, UID_LENGTH));
		ans->Set(2, JSreadAsciiString(pack, pointer, EVENTID_LENGTH));
		ans->Set(3, JSreadAsciiString(pack, pointer, POSTID_LENGTH));
		ans->Set(4, JSreadInteger(pack, pointer, RID_LENGTH));
		ans->Set(5, JSreadBool(pack, pointer));
		break;
	case 31: // Delete advertisement
		ans = Array::New(3);
		ans->Set(0, JSreadAsciiString(pack, pointer, PUBID_LENGTH));
		ans->Set(1, JSreadAsciiString(pack, pointer, ADID_LENGTH));
		ans->Set(2, JSreadBool(pack, pointer));
		break;
	}
	return ans;
}

/**
 * - \b "6 0 Validation"
 * 		- 0: success (boolean)
 * 			- 1: session_key (string)
 * 		- \b "if not success"
 * 			- 1: reason (int8)
 */

/**
 * - \b "6 1 Logout"
 * 		- 0: success (boolean)
 * 		- \b "if not success"
 * 			- 1:reason (int8)
 */

/**
 * - \b "6 20 Email validation"
 * 		- 0: success (boolean)
 * 		- \b "if not success"
 * 			- 1:reason (int8)
 */

/**
 * - \b "6 21 Identification code validation"
 * 		- 0: success (boolean)
 * 		- \b "if not success"
 * 			- 1:reason (int8)
 */
Local<Array> resolvValidationPack(const char *pack,
		const response_header &header) {
	int pointer = HEADER_LENGTH;
	Local<Array> ans = Array::New(1);
	bool succ = readBool(pack, pointer);
	ans->Set(0, Boolean::New(succ));
	switch (header.subtype) {
	case 0: //Login
		if (succ)
			ans->Set(1, JSreadAsciiString(pack, pointer, 8));
		else
			ans->Set(1, JSreadInteger(pack, pointer, 1));
		break;
	case 16: //Logout
	case 20: //Email validation
	case 21: //Identification_code validation
		if (!succ)
			ans->Set(1, JSreadInteger(pack, pointer, 1));
		break;
	}
	return ans;
}

/**
 * - \b "7 1 Quit"
 * 		- 0: eventid (string)
 * 		- 1: success (boolean)
 */
Local<Array> resolvQuitPack(const char *pack, const response_header &header) {
	int pointer = HEADER_LENGTH;
	Local<Array> ans;
	switch (header.subtype) {
	case 1: //Quit
		ans = Array::New(2);
		ans->Set(0, JSreadAsciiString(pack, pointer, EVENTID_LENGTH));
		ans->Set(1, JSreadBool(pack, pointer));
		break;
	}
	return ans;
}

/**
 * - \b "10 5 Notification"
 * 		- Array: notification (::resolvNotification)
 * - \todo \b "10 0 Friend suggestion"
 * - \todo \b "10 1 Event suggestion"
 * - \todo \b "10 4 Tag suggestion"
 * - \todo \b "10 6 New feature suggestion"
 * - \todo \b "10 15 System polling"
 */
Handle<Value> resolvSuggestionPack(const char *pack,
		const response_header &header) {
	int pointer = HEADER_LENGTH;
	switch (header.subtype) {
	case 0: //TODO friend suggestion
		break;
	case 1: //TODO event suggestion
		break;
	case 4: //TODO tag suggestion
		break;
	case 5: //notification
		return resolvNotifications(pack, pointer);
		break;
	case 6: //TODO new feature suggestion
		break;
	case 15: //TODO system polling
		break;
	}
	return Undefined();
}

/**
 * - \b "12 0 Message to user"
 * 		- 0: direction (int8 0=send 1=receive)
 * 		- \b "12 0 0 Send message to user"
 * 			- 1: seqNo (int32)
 * 			- 2: status (int8)
 * 		- \b "12 0 1 Receive message from user"
 * 			- 1: sender_uid (int32)
 * 			- 2: content (string)
 * 			- 3: send_date (int32)
 * 			- 4: send_time (int32)
 */

/**
 * - \b "12 1 Message to event"
 * 		- 0: direction (int8 0=send 1=receive)
 * 		- \b "12 0 0 Send message to event"
 * 			- 1: seqNo (int32)
 * 			- 2: status (int8)
 * 		- \b "12 0 1 Receive message from event"
 * 			- 1: eventid (string)
 * 			- 2: sender_uid (int32)
 * 			- 3: content (string)
 * 			- 4: send_date (int32)
 * 			- 5: send_time (int32)
 */
Local<Object> resolvMessagePack(const char *pack,
		const response_header &header) {
	int pointer = HEADER_LENGTH, content_len;
	Local<Array> ans = Array::New(1);
	uint32_t direction = readInteger(pack, pointer, 1);
	ans->Set(0, Integer::New(direction));
	switch (header.subtype) {
	case 0: // for user
		switch (direction) {
		case 0: //for send
			ans->Set(1, JSreadInteger(pack, pointer, 4));
			ans->Set(2, JSreadInteger(pack, pointer, 1));
			break;
		case 1: //for receive
			ans->Set(1, JSreadInteger(pack, pointer, UID_LENGTH));
			content_len = readInteger(pack, pointer, 2);
			ans->Set(2, JSreadString(pack, pointer, content_len));
			ans->Set(3, JSreadInteger(pack, pointer, 4));
			ans->Set(4, JSreadInteger(pack, pointer, 4));
			break;
		}
		break;
	case 1: // for event
		switch (direction) {
		case 0: //for send
			ans->Set(1, JSreadInteger(pack, pointer, 4));
			ans->Set(2, JSreadInteger(pack, pointer, 1));
			break;
		case 1: //for receive
			ans->Set(1, JSreadAsciiString(pack, pointer, EVENTID_LENGTH));
			ans->Set(2, JSreadInteger(pack, pointer, UID_LENGTH));
			content_len = readInteger(pack, pointer, 2);
			ans->Set(3, JSreadString(pack, pointer, content_len));
			ans->Set(4, JSreadInteger(pack, pointer, 4));
			ans->Set(5, JSreadInteger(pack, pointer, 4));
			break;
		}
		break;
	}
	return ans;
}

/**
 * - \b "15 0 Upload picture"
 * 		- 0: picid (string)
 */

/**
 * - \b "15 1 View picture"
 * 		- 0: picid (string)
 * 		- 1: picture_path (string)
 */
Local<Object> resolvPicturePack(const char *pack,
		const response_header &header) {
	int pointer = HEADER_LENGTH;
	Local<Array> ans = Array::New(1);
	char picid[PICID_LENGTH * 2 + 1];
	readAsciiString(picid, pack, pointer, PICID_LENGTH);
	picid[PICID_LENGTH * 2] = 0;
	ans->Set(0, String::New(picid, PICID_LENGTH * 2));
	switch (header.subtype) {
	case 0: // for upload
		break;
	case 1: // for view
	{
		std::ostringstream os;
		os << "public/data/pictures/" << picid << ".jpg";
		ans->Set(1, JSreadFile(pack, pointer, os.str()));
		break;
	}
	}
	return ans;
}

/**
 * - \b "15 0 Upload file"
 * 		- 0: fileid (string)
 */

/**
 * - \b "15 1 Download file"
 * 		- 0: fileid (string)
 * 		- 1: file_path (string)
 */
Local<Object> resolvFilePack(const char *pack,
		const response_header &header) {
	int pointer = HEADER_LENGTH;
	Local<Array> ans = Array::New(1);
	char fileid[FILEID_LENGTH * 2 + 1];
	readAsciiString(fileid, pack, pointer, FILEID_LENGTH);
	fileid[FILEID_LENGTH * 2] = 0;
	ans->Set(0, String::New(fileid, FILEID_LENGTH * 2));
	switch (header.subtype) {
	case 0: // for upload
		break;
	case 1: // for download
	{
		std::ostringstream os;
		os << "public/data/files/" << fileid;
		ans->Set(1, JSreadFile(pack, pointer, os.str()));
		break;
	}
	}
	return ans;
}

/**
 * - 0: header
 * 		- 0: length
 * 		- 1: session_key
 * 		- 2: uid
 * 		- 3: type
 * 		- 4: subtype
 * - 1: resolved_package
 * 		- \b "0 View" (::resolvViewPack)
 * 		- \b "1 Search" (::resolvSearchPack)
 * 		- \b "2 Create" (::resolvCreatePack)
 * 		- \b "3 Update" (::resolvUpdatePack)
 * 		- \b "4 Reply" (::resolvReplyPack)
 * 		- \b "5 Delete" (::resolvDeletePack)
 * 		- \b "6 Validation" (::resolvValidationPack)
 * 		- \b "7 Quit" (::resolvQuitPack)
 * 		- \b "10 Suggestion" (::resolvSuggestionPack)
 * 		- \b "12 Message" (::resolvMessagePack)
 * 		- \b "15 Picture" (::resolvPicturePack)
 * 		- \b "16 File" (::resolvFilePack)
 */
Handle<Value> resolvPack(const Arguments& args) {
	const char *pack = node::Buffer::Data(args[0]);
	Local<Array> package = Array::New(2);
	response_header header;
	extract_header(pack, &header);
	package->Set(0, formJSHeader(&header));
	switch (header.type) {
	case 0:
		package->Set(1, resolvViewPack(pack, header));
		break;
	case 1:
		package->Set(1, resolvSearchPack(pack, header));
		break;
	case 2:
		package->Set(1, resolvCreatePack(pack, header));
		break;
	case 3:
		package->Set(1, resolvUpdatePack(pack, header));
		break;
	case 4: //Reply Posting
		package->Set(1, resolvReplyPack(pack, header));
		break;
	case 5:
		package->Set(1, resolvDeletePack(pack, header));
		break;
	case 6:
		package->Set(1, resolvValidationPack(pack, header));
		break;
	case 7:
		package->Set(1, resolvQuitPack(pack, header));
		break;
	case 10:
		package->Set(1, resolvSuggestionPack(pack, header));
		break;
	case 12:
		package->Set(1, resolvMessagePack(pack, header));
		break;
	case 15:
		package->Set(1, resolvPicturePack(pack, header));
		break;
	case 16:
		package->Set(1, resolvFilePack(pack, header));
		break;
	default:
		package->Delete(1);
		break;
	}
	return package;
}

/**
 * 	- 0: length
 * 	- 1: session_key
 * 	- 2: uid
 * 	- 3: type
 * 	- 4: subtype
 */
Handle<Value> resolvSTCHeader(const Arguments& args) {
	const char* pack = node::Buffer::Data(args[0]);
	response_header header;
	extract_header(pack, &header);
	return formJSHeader(&header);
}
