#include <v8.h>
#include <node.h>
#include <cstdio>
#include "common.h"

typedef struct s_response_header {
	uint32_t length;
	char session_key[SESSION_KEY_LENGTH];
	uint32_t uid;
	int type, subtype;
} response_header;
inline int resolvHexBit(char a) {
	return a > '9' ? a - 'a' + 10 : a - '0';
}
void readBytes(char *dist, char *buf, int& pointer, int length) {
	if (dist != NULL)
		for (int i = 0; i < length; i++)
			dist[i] = (resolvHexBit(buf[pointer + i * 2]) << 4)
					+ resolvHexBit(buf[pointer + i * 2 + 1]);
	pointer += length * 2;
}
Local<Array> JSreadBytes(char *buf, int &pointer, int length) {
	char tmp[2] = { };
	Local<Array> ans = Array::New(0);
	for (int i = 0; i < length; i++) {
		tmp[0] = resolvHexBit(buf[pointer++]) << 4;
		tmp[0] |= resolvHexBit(buf[pointer++]);
		ans->Set(ans->Length(), String::New(tmp));
	}
	return ans;
}
void readAsciiString(char *dist, char *buf, int& pointer, int length) {
	for (int i = 0; i < length; i++)
		dist[i] = (resolvHexBit(buf[pointer + i * 2]) << 4)
				+ resolvHexBit(buf[pointer + i * 2 + 1]);
	pointer += length * 2;
}
Local<String> JSreadAsciiString(char *buf, int &pointer, int length) {
	char *tmp = new char[length];
	for (int i = 0; i < length; i++)
		tmp[i] = (resolvHexBit(buf[pointer + i * 2]) << 4)
				+ resolvHexBit(buf[pointer + i * 2 + 1]);
	pointer += length * 2;
	Local<String> ans = String::New(tmp, length);
	delete[] tmp;
	return ans;
}
void readString(uint16_t *dist, char *buf, int &pointer, int length) {
	length /= 2;
	for (int i = 0; i < length; i++)
		dist[i] = ((resolvHexBit(buf[pointer + i * 4]) << 12)
				| (resolvHexBit(buf[pointer + i * 4 + 1]) << 8)
				| (resolvHexBit(buf[pointer + i * 4 + 2]) << 4)
				| (resolvHexBit(buf[pointer + i * 4 + 3])));
	pointer += length * 4;
}
Local<String> JSreadString(char *buf, int &pointer, int length) {
	length /= 2;
	uint16_t *tmp = new uint16_t[length + 1];
	readString(tmp, buf, pointer, length * 2);
	tmp[length] = 0;
	Local<String> ans = String::New(tmp);
	delete[] tmp;
	return ans;
}
int64_t readInteger(char *buf, int& pointer, int length) {
	int64_t ans = 0;
	for (int i = 0; i < length; i++) {
		ans <<= 4;
		ans |= resolvHexBit(buf[pointer++]);
		ans <<= 4;
		ans |= resolvHexBit(buf[pointer++]);
	}
	return ans;
}
Local<Integer> JSreadInteger(char *buf, int &pointer, int length) {
	int64_t ans = 0;
	for (int i = 0; i < length; i++) {
		ans <<= 4;
		ans |= resolvHexBit(buf[pointer++]);
		ans <<= 4;
		ans |= resolvHexBit(buf[pointer++]);
	}
	if (length == 8) {
		char tmp[40];
		sprintf(tmp, LLD, ans);
		Local<Value> value = Script::Compile(String::New(tmp))->Run();
		return value->ToInteger();
	} else
		return Number::New(ans)->ToInteger();
}
bool readBool(char *buf, int &pointer) {
	char tmp;
	tmp = readInteger(buf, pointer, 1);
	return tmp == 0;
}
Handle<Boolean> JSreadBool(char *buf, int &pointer) {
	return Boolean::New(readBool(buf, pointer));
}
void extract_header(char *buf, response_header* ans) {
	ans->length = 0;
	int pointer = 0;
	readAsciiString(ans->session_key, buf, pointer, SESSION_KEY_LENGTH);
	readBytes(NULL, buf, pointer, 4);
	ans->uid = readInteger(buf, pointer, 4);
	ans->type = readInteger(buf, pointer, 1);
	ans->subtype = readInteger(buf, pointer, 1);
}
Local<Object> formJSHeader(response_header *header) {
	Local<Object> ans = Object::New();
	ans->Set(sym("session_key"),
			String::New(header->session_key, SESSION_KEY_LENGTH));
	ans->Set(sym("uid"), Integer::New(header->uid));
	ans->Set(sym("type"), Integer::New(header->type));
	ans->Set(sym("subtype"), Integer::New(header->subtype));
	return ans;
}

/* Array: uid (int32) */
Local<Array> resolvUIDs(char *pack, int &pointer) {
	uint32_t num = readInteger(pack, pointer, 4);
	Local<Array> ans = Array::New(num);
	for (uint32_t i = 0; i < num; i++)
		ans->Set(i, JSreadInteger(pack, pointer, UID_LENGTH));
	return ans;
}

/* Array: EventID (string) */
Local<Array> resolvEventIDs(char *pack, int &pointer) {
	uint32_t num = readInteger(pack, pointer, 4);
	Local<Array> ans = Array::New(num);
	for (uint32_t i = 0; i < num; i++)
		ans->Set(i, JSreadAsciiString(pack, pointer, EVENTID_LENGTH));
	return ans;
}

/* 0: uid (int32)
 * 1: eventid (string)
 * 2: postid (string) */
Local<Object> resolvPosting(char *pack, int &pointer) {
	Local<Array> ans = Array::New(3);
	ans->Set(0, JSreadInteger(pack, pointer, UID_LENGTH));
	ans->Set(1, JSreadAsciiString(pack, pointer, EVENTID_LENGTH));
	ans->Set(2, JSreadAsciiString(pack, pointer, POSTID_LENGTH));
	return ans;
}

/* Array: Posting */
Local<Array> resolvPostings(char *pack, int &pointer) {
	uint32_t num = readInteger(pack, pointer, 4);
	Local<Array> ans = Array::New(num);
	for (uint32_t i = 0; i < num; i++)
		ans->Set(i, resolvPosting(pack, pointer));
	return ans;
}

/* Array: tag_string (string) */
Local<Array> resolvTags(char *pack, int &pointer) {
	uint32_t num = readInteger(pack, pointer, 4);
	uint32_t length;
	Local<Array> ans = Array::New(num);
	for (uint32_t i = 0; i < num; i++) {
		length = readInteger(pack, pointer, 1);
		ans->Set(i, JSreadString(pack, pointer, length));
	}
	return ans;
}

/* 0: rid (int32)
 * 1: replier_uid (int32)
 * 2: reply_to_uid (int32)
 * 3: replyer_name (string)
 * 4: reply_to_name (string)
 * 5: reply_content (string)
 * 6: reply_date (int32)
 * 7: reply_time (int32)
 * 8: visibility (int8) */
Local<Array> resolvReply(char *pack, int &pointer) {
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

/* Array: Reply */
Local<Array> resolvReplies(char *pack, int &pointer) {
	uint32_t num = readInteger(pack, pointer, 4);
	Local<Array> ans = Array::New(num);
	for (uint32_t i = 0; i < num; i++)
		ans->Set(i, resolvReply(pack, pointer));
	return ans;
}

/* 0: uid (int32)
 * 1: nick_name (string)
 * 2: name (string)
 * 3: birthday (int32)
 * 4: gender (int8)
 * 5: city (string)
 * 6: tags (Tags)
 * 7: friends (UIDs) */
Local<Array> resolvUserSimpleOtherPack(char *pack, int &pointer) {
	Local<Array> ans = Array::New(8);
	ans->Set(0, JSreadInteger(pack, pointer, UID_LENGTH));
	uint32_t length;
	length = readInteger(pack, pointer, 4);
	ans->Set(1, JSreadString(pack, pointer, length));
	length = readInteger(pack, pointer, 4);
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

/* 0: text (string)
 * 1: weight (int64)
 * TODO: int64 */
Local<Array> resolvWeightedTag(char *pack, int &pointer) {
	Local<Array> ans = Array::New(2);
	uint32_t length = readInteger(pack, pointer, 1);
	ans->Set(0, JSreadString(pack, pointer, length));
	ans->Set(1, JSreadInteger(pack, pointer, 8));
	return ans;
}

/* Array: WeightedTag */
Local<Array> resolvWeightedTags(char *pack, int &pointer) {
	uint32_t num = readInteger(pack, pointer, 4);
	Local<Array> ans = Array::New(num);
	for (uint32_t i = 0; i < num; i++)
		ans->Set(i, resolvWeightedTag(pack, pointer));
	return ans;
}

/* Array: honor (int8) */
Local<Array> resolvHonors(char *pack, int &pointer) {
	uint32_t num = readInteger(pack, pointer, 1);
	Local<Array> ans = Array::New(num);
	for (uint32_t i = 0; i < num; i++)
		ans->Set(i, JSreadInteger(pack, pointer, 1));
	return ans;
}

/* 0: eventid (string)
 * 1: name (string)
 * 2: creator_uid (int32)
 * 3: description (string)
 * 4: tags (Tags)
 * 5: city (string)
 * 6: rating (int32)
 * 7: honors (Honors) */
Local<Array> resolvEventSimpleOtherPack(char *pack, int &pointer) {
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

/* 0: uid (int32)
 * 1: name (string)
 * 2: nick_name (string)
 * 3: birthday (int32)
 * 4: tags (Tags)
 * 5: hidden_tags (Tags)
 * 6: honors (Honors)
 * 7: gender (int8)
 * 8: city (string)
 * 9: state (string)
 * 10: country (string) */
Local<Array> resolvUserSimplePack(char *pack, int &pointer) {
	Local<Array> ans = Array::New(11);
	ans->Set(0, JSreadInteger(pack, pointer, UID_LENGTH));
	uint32_t length = readInteger(pack, pointer, 1);
	ans->Set(1, JSreadString(pack, pointer, length));
	length = readInteger(pack, pointer, 1);
	ans->Set(2, JSreadString(pack, pointer, length));
	ans->Set(3, JSreadInteger(pack, pointer, 4));
	ans->Set(4, resolvTags(pack, pointer));
	ans->Set(5, resolvTags(pack, pointer));
	ans->Set(6, resolvHonors(pack, pointer));
	ans->Set(7, JSreadInteger(pack, pointer, 1));
	length = readInteger(pack, pointer, 1);
	ans->Set(8, JSreadString(pack, pointer, length));
	length = readInteger(pack, pointer, 1);
	ans->Set(9, JSreadString(pack, pointer, length));
	length = readInteger(pack, pointer, 1);
	ans->Set(10, JSreadString(pack, pointer, length));
	//TODO Profile picture
	return ans;
}

/* 0: news_visibility (int8)
 * 1: friend_request_setting (int8)
 * 2: event_invitation_setting (int8)
 * 3: message_notification_setting (int8)
 * 4: strangers_message_setting (int8) */
Local<Array> resolvUserSettingPack(char *pack, int &pointer) {
	uint32_t num = readInteger(pack, pointer, 1);
	Local<Array> ans = Array::New();
	for (uint32_t i = 0; i < num; i++) {
		uint32_t type = readInteger(pack, pointer, 1);
		ans->Set(type, JSreadInteger(pack, pointer, 1));
	}
	return ans;
}

/* 0: uid (int32)
 * 1: eventid (string)
 * 2: sid (int32)
 * 3: start_date (int32)
 * 4: start_time (int32)
 * 5: end_date (int32)
 * 6: end_time (int32)
 * 7: place (string)
 * 8: description (string)
 * 9: with_users (UIDs) */
Local<Array> resolvSchedule(char *pack, int &pointer) {
	Local<Array> ans = Array::New(10);
	ans->Set(0, JSreadInteger(pack, pointer, UID_LENGTH));
	ans->Set(1, JSreadString(pack, pointer, EVENTID_LENGTH));
	ans->Set(2, JSreadInteger(pack, pointer, 4));
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

/* Array: Schedules */
Local<Array> resolvSchedules(char *pack, int &pointer) {
	uint32_t num = readInteger(pack, pointer, 4);
	Local<Array> ans = Array::New(num);
	for (uint32_t i = 0; i < num; i++)
		ans->Set(i, resolvSchedule(pack, pointer));
	return ans;
}

/* 0: attribute (int8)
 * 1: success (bool) */
Local<Array> resolvUpdate(char *pack, int &pointer) {
	Local<Array> ans = Array::New(2);
	ans->Set(0, JSreadInteger(pack, pointer, 1));
	ans->Set(1, JSreadBool(pack, pointer));
	return ans;
}
Local<Array> resolvUpdates(char *pack, int &pointer) {
	uint32_t num = readInteger(pack, pointer, 1);
	Local<Array> ans = Array::New(num);
	for (uint32_t i = 0; i < num; i++)
		ans->Set(i, resolvUpdate(pack, pointer));
	return ans;
}
/* 0: subtype2 (int8)
 * 1: seqNo (int32)
 * 2: uid (int32)
 * 3: eventid (string)
 * 4: pid (string)
 * 5: action (int8)
 * 6: msg (string)*/
Local<Array> resolvNotification(char *pack, int &pointer) {
	Local<Object> ans = Array::New(7);
	uint32_t msg_len;
	ans->Set(0, JSreadInteger(pack, pointer, 1));
	ans->Set(1, JSreadInteger(pack, pointer, 4));
	ans->Set(2, JSreadInteger(pack, pointer, UID_LENGTH));
	ans->Set(3, JSreadString(pack, pointer, EVENTID_LENGTH));
	ans->Set(4, JSreadString(pack, pointer, EVENTID_LENGTH));
	ans->Set(5, JSreadInteger(pack, pointer, 1));
	msg_len = readInteger(pack, pointer, 1);
	ans->Set(6, JSreadString(pack, pointer, msg_len));
	return ans;

}
Local<Array> resolvNotifications(char *pack, int &pointer) {
	uint32_t num = readInteger(pack, pointer, 4);
	Local<Array> ans = Array::New(num);
	for (uint32_t i = 0; i < num; i++)
		ans->Set(i, resolvNotification(pack, pointer));
	return ans;
}

/*case 0
 * 0: viewee_uid (int32)
 * 1: mode (int8)
 	* case 0
	* 2: friends (resolvUIDs)
	* case 1	
	* 2: events (resolvEventIDs)
	* case 2
	* 2: postings (resolvPostings)
	* case 4
	* 2: info (resolvUseSimpleOtherPack)
	* case 23
	* case 24*/

/* case 1
 * 0: eventid (asciistring)
 * 1: mode (int8)
 	* case 0
	* 2: members (resolvUIDs)
	* case 2
	* 2: postings (resolvPostings)
	* case 4
	* 2: info (resolvEventSimpleOtherPack)
	* case 5
	* 2: managers (resolvUIDs)
	* case 6
	* case 17
	* 2: schedules (resolvSchedules)
	* case 18
	* 2: opt (int8)
	* 3: circatags (resolvWeightedTags)
	* case 23
	* case 24*/

/* case 2
 * 0: pid (asciistring)
 * 1: poster_uid (int32)
 * 2: event_eid (asciistring)
 * 3: post_date (int32)
 * 4: post_time (int32)
 * 5: content (string)
 * 6: visibility (int8)
 * 7: tags (resolvTags)
 * 8: replies (resolvReplies)*/

/* case 10
 * 0: postings (resolvPostings)*/

/* case 11
 * 0: mode (int8)
 	* case 0
	* 1: friends (resolvUIDs)
	* case 1
	* 1: events (resolvEventIDs)
	* case 2
	* 1: postings (resolvPostings)
	* case 4
	* 1: info (resolvUserSimplePack)
	* case 6
	* 1: settings (resolvUserSettingPack)
	* case 17
	* 1: schedules (resolvSchedules)
	* case 18
	* 1: opt (int8)
	* 2: circatags (resolvWeightedTags)
	* case 23
	* case 24*/

Local<Array> resolvViewPack(char *pack, int subtype) {
	int pointer = HEADER_LENGTH * 2, mode;
	Local<Array> ans = Array::New(9);
	switch (subtype) {
	case 0: //View user
		ans->Set(0, JSreadInteger(pack, pointer, UID_LENGTH));
		mode = readInteger(pack, pointer, 1);
		ans->Set(1, Integer::New(mode));
		switch (mode) {
		case 0: //View user's friends
			ans->Set(2, resolvUIDs(pack, pointer));
			break;
		case 1: //View user's events
			ans->Set(2, resolvEventIDs(pack, pointer));
			break;
		case 2: //View user's posting
			ans->Set(2, resolvPostings(pack, pointer));
			break;
		case 4: //View user's info
			ans->Set(2, resolvUserSimpleOtherPack(pack, pointer));
			break;
		case 18: //View user's circatag
			ans->Set(2, JSreadInteger(pack, pointer, 1));
			ans->Set(3, resolvWeightedTags(pack, pointer));
			break;
		case 23: //View user's avarta big
			//TODO avarta
		case 24:				//View user's avarta small
			//TODO avarta
			break;
		}
		break;

	case 1: //View event
		ans->Set(sym(0),
				JSreadAsciiString(pack, pointer, EVENTID_LENGTH));
		mode = readInteger(pack, pointer, 1);
		ans->Set(1, Integer::New(mode));
		switch (mode) {
		case 0: //View member event
			ans->Set(2, resolvUIDs(pack, pointer));
			break;
		case 2: //View posting event
			ans->Set(2, resolvPostings(pack, pointer));
			break;
		case 4: //View event's info
			ans->Set(2, resolvEventSimpleOtherPack(pack, pointer));
			break;
		case 5: //View managers event
			ans->Set(2, resolvUIDs(pack, pointer));
			break;
		case 6: //TODO View event's setting pack
			break;
		case 17: //View schedule event
			ans->Set(2, resolvSchedules(pack, pointer));
			break;
		case 18: //View Circatag_Pack
			ans->Set(2, JSreadInteger(pack, pointer, 1));
			ans->Set(3, resolvWeightedTags(pack, pointer));
			break;
		case 23: //View user's avarta big
			//TODO avarta
		case 24:				//View user's avarta small
			//TODO avarta
			break;
		}
		break;

	case 2: //View posting
		int content_len;
		ans->Set(0, JSreadAsciiString(pack, pointer, POSTID_LENGTH));
		ans->Set(1, JSreadInteger(pack, pointer, UID_LENGTH));
		ans->Set(2,
				JSreadAsciiString(pack, pointer, EVENTID_LENGTH));
		ans->Set(3, JSreadInteger(pack, pointer, 4));
		ans->Set(4, JSreadInteger(pack, pointer, 4));
		content_len = readInteger(pack, pointer, 2);
		ans->Set(5, JSreadString(pack, pointer, content_len));
		ans->Set(6, JSreadInteger(pack, pointer, 1));
		ans->Set(7, resolvTags(pack, pointer));
		ans->Set(8, resolvReplies(pack, pointer));
		break;
	case 10: //View user's posting
		ans->Set(0, resolvPostings(pack, pointer));
		break;
	case 11: //View self
		mode = readInteger(pack, pointer, 1);
		ans->Set(0), Integer::New(mode));
		switch (mode) {
		case 0: //View self's friends
			ans->Set(1), resolvUIDs(pack, pointer));
			break;
		case 1: //View self's events
			ans->Set(1), resolvEventIDs(pack, pointer));
			break;
		case 2: //View self's posting
			ans->Set(1), resolvPostings(pack, pointer));
			break;
		case 4: //View self's info
			ans->Set(1), resolvUserSimplePack(pack, pointer));
			break;
		case 6:
			ans->Set(1), resolvUserSettingPack(pack, pointer));
			break;
		case 17:
			ans->Set(1), resolvSchedules(pack, pointer));
			break;
		case 18: //View self's circatag
			ans->Set(1, JSreadInteger(pack, pointer, 1));
			ans->Set(2, resolvWeightedTags(pack, pointer));
			break;
		case 23: //View user's avarta big
			//TODO avarta
		case 24:				//View user's avarta small
			//TODO avarta
			break;
		}
	}
	return ans;
}

/* case 0
 * 0: members (resolvUIDs)*/

/*case 1
 * 0: events (resolvEventIDs)*/

/*case 2
 * 0: postings (resolvPostings)*/

Local<Object> resolvSearchPack(char *pack, int subtype) {
	int pointer = HEADER_LENGTH * 2;
	Local<Object> ans = Object::New();
	switch (subtype) {
	case 0:			//Search User
		ans->Set(sym("members"), resolvUIDs(pack, pointer));
		break;
	case 1:			//Search Event
		ans->Set(sym("events"), resolvEventIDs(pack, pointer));
		break;
	case 2:			//Search Posting
		ans->Set(sym("postings"), resolvPostings(pack, pointer));
		break;
	}
	return ans;
}

/* case 0
 * 0: succ (bool)
	if succ
	* 1: uid (int32)
	else 
	* 1: reason (int8)*/

/* case 1
 * 0: succ (bool)
	if succ
	* 1: eventid (string)
	else 
	* 1: reason (int8)*/

/* case 2
 * 0: succ (bool)
	if succ
	* 1: posting (posting)
	else 
	* 1: reason (int8)*/	

/* case 17
 * 0: succ (bool)
	if succ
	* 1: uid (int32)
	* 2: eventid (string)
	* 3: sid (int32)
	else 
	* 1: reason (int8)*/

Local<Array> resolvCreatePack(char *pack, int subtype) {
	int pointer = HEADER_LENGTH * 2;
	bool succ = readBool(pack, pointer);
	Local<Array> ans = Array::New(4);
	ans->Set(0, Boolean::New(succ));
	switch (subtype) {
	case 0: //Create User
		if (succ) {
			ans->Set(1, JSreadInteger(pack, pointer, UID_LENGTH));
		} else {
			ans->Set(1, JSreadInteger(pack, pointer, 1));
		}
		break;
	case 1: //Create Event
		if (succ) {
			ans->Set(1, JSreadString(pack, pointer, EVENTID_LENGTH));
		} else {
			ans->Set(1, JSreadInteger(pack, pointer, 1));
		}
		break;
	case 2: //Create Posting
		if (succ) {
			ans->Set(1, resolvPosting(pack, pointer));
		} else {
			ans->Set(1, JSreadInteger(pack, pointer, 1));
		}
		break;
	case 3: //Create Request
		//TODO CTS-without-requester
		if (succ) {
		} else {
			ans->Set(sym("reason"), JSreadInteger(pack, pointer, 1));
		}
		break;
	case 17: //Create Schedule
		if (succ) {
			ans->Set(sym(1), JSreadInteger(pack, pointer, UID_LENGTH));
			ans->Set(sym(2),
					JSreadString(pack, pointer, EVENTID_LENGTH));
			ans->Set(sym(3), JSreadInteger(pack, pointer, 4));
		} else {
			ans->Set(sym(1), JSreadInteger(pack, pointer, 1));
		}
		break;
	}
	return ans;
}

/* case 0
 * 0: updates (numbers of updates)*/

/* case 1
 * 0: eid (string)
 * 1: updates (numbers of updates)*/

/* case 23
 	* case 0
	* 0: uid (int32)
	* 1: succ (boolean)
		if succ
		* 2: version_date (int32)
		* 3: version_time (int32)
		
   	* case 1
	* 0: uid (int32)
	* 1: eventid (string)
	* 2: succ (boolean)
		if succ
		* 3: version_date (int32)
		* 4: version_time (int32)*/

/* case 24
 	* case 0
	* 0: uid (int32)
	* 1: succ (boolean)
		if succ
		* 2: version_date (int32)
		* 3: version_time (int32)
		
   	* case 1
	* 0: uid (int32)
	* 1: eventid (string)
	* 2: succ (boolean)
		if succ
		* 3: version_date (int32)
		* 4: version_time (int32)*/

Local<Array> resolvUpdatePack(char *pack, int subtype) {
	int pointer = HEADER_LENGTH * 2, mode;
	bool succ;
	Local<Array> ans = Array::New(5);
	switch (subtype) {
	case 0: //updates
		ans->Set(0, resolvUpdates(pack, pointer));
		break;
	case 1: //event updates
		ans->Set(0, JSreadString(pack, pointer, EVENTID_LENGTH));
		ans->Set(1, resolvUpdates(pack, pointer));
		break;
	case 23: //avarta
		mode = readInteger(pack, pointer, 1);
		switch (mode) {
		case 0: //User
			ans->Set(0, JSreadInteger(pack, pointer, UID_LENGTH));
			succ = readBool(pack, pointer);
			ans->Set(1, Boolean::New(succ));
			if (succ) {
				ans->Set(2, JSreadInteger(pack, pointer, 4));
				ans->Set(3, JSreadInteger(pack, pointer, 4));
			}	
			break;
		case 1: //User and Event
			ans->Set(0, JSreadInteger(pack, pointer, UID_LENGTH));
			ans->Set(1,
					JSreadString(pack, pointer, EVENTID_LENGTH));
			succ = readBool(pack, pointer);
			ans->Set(2, Boolean::New(succ));
			if (succ) {
				ans->Set(3, JSreadInteger(pack, pointer, 4));
				ans->Set(4, JSreadInteger(pack, pointer, 4));
			}
			break;
		}
		
		break;

	case 24: //avarta
		mode = readInteger(pack, pointer, 1);
		switch (mode) {
		case 0: //User
			ans->Set(0, JSreadInteger(pack, pointer, UID_LENGTH));
			succ = readBool(pack, pointer);
			ans->Set(1, Boolean::New(succ));
			if (succ) {
				ans->Set(2, JSreadInteger(pack, pointer, 4));
				ans->Set(3, JSreadInteger(pack, pointer, 4));
			}	
			break;
		case 1: //User and Event
			ans->Set(0, JSreadInteger(pack, pointer, UID_LENGTH));
			ans->Set(1,
					JSreadString(pack, pointer, EVENTID_LENGTH));
			succ = readBool(pack, pointer);
			ans->Set(2, Boolean::New(succ));
			if (succ) {
				ans->Set(3, JSreadInteger(pack, pointer, 4));
				ans->Set(4, JSreadInteger(pack, pointer, 4));
			}
			break;
		}
		
		break;
	return ans;
}

/* 0: poster_uid (int32)
 * 1: reply_to_uid (int32)
 * 2: eventid (string)
 * 3: pid (string)
 * 4: acknowledgement (int8)*/

Local<Array> resolvReplyPack(char *pack, int subtype) {
	int pointer = HEADER_LENGTH * 2, mode;
	Local<Array> ans = Object::Array(5);
	ans->Set(0, JSreadInteger(pack, pointer, UID_LENGTH));
	ans->Set(1, JSreadInteger(pack, pointer, UID_LENGTH));
	ans->Set(2, JSreadString(pack, pointer, EVENTID_LENGTH));
	ans->Set(3, JSreadString(pack, pointer, EVENTID_LENGTH));
	ans->Set(4, JSreadInteger(pack, pointer, 1));
	return ans;
}
/* case 0
 * 0: friend_uid (int32)
 * 1: succ (boolean)*/

/* case 2
 * 0: uid (int32)
 * 1: eventid (string)
 * 2: pid (string)
 * 3: succ (boolean)*/

/*case 17
 * 0: uid (int32)
 * 1: eventid (string)
 * 2: sid (int32)
 * 3: succ (boolean)*/

/*case 22
 *0: your_uid (int32)
 *1: uid (int32)
 *2: eventid (string)
 *3: pid (string)
 *4: rid (int32)
 *5: succ (boolean)*/
Local<Array> resolvDeletePack(char *pack, int subtype) {
	int pointer = HEADER_LENGTH * 2;
	Local<Array> ans = Object::Array(6);
	switch (subtype) {
	case 0: //delete friends
		ans->Set(0, JSreadInteger(pack, pointer, UID_LENGTH));
		ans->Set(1, JSreadBool(pack, pointer));
		break;
	case 2: //delete posting
		ans->Set(0, JSreadInteger(pack, pointer, UID_LENGTH));
		ans->Set(1, JSreadString(pack, pointer, EVENTID_LENGTH));
		ans->Set(2, JSreadString(pack, pointer, EVENTID_LENGTH));
		ans->Set(3, JSreadBool(pack, pointer));
		break;
	case 17: //delete schedule
		ans->Set(0, JSreadInteger(pack, pointer, UID_LENGTH));
		ans->Set(1, JSreadString(pack, pointer, EVENTID_LENGTH));
		ans->Set(2, JSreadInteger(pack, pointer, 4));
		ans->Set(3, JSreadBool(pack, pointer));
		break;
	case 22: //delete replies
		ans->Set(0, JSreadInteger(pack, pointer, UID_LENGTH));
		ans->Set(1, JSreadInteger(pack, pointer, UID_LENGTH));
		ans->Set(2, JSreadString(pack, pointer, EVENTID_LENGTH));
		ans->Set(3, JSreadString(pack, pointer, EVENTID_LENGTH));
		ans->Set(4, JSreadInteger(pack, pointer, UID_LENGTH));
		ans->Set(5, JSreadBool(pack, pointer));
		break;
	}
	return ans;
}

/* case 0
 * 0: succ (boolean 1:success 0:fail)
	* case succ true
	* 1:eventid (asciistring)
	
	* case succ false
	* 1:reason (int8)*/

/* case 16
 * 0: succ (boolean 1:success 0:fail)
	* case succ true:
	* 1:eventid (string)
	
	* case succ false:
	* 1:reason (int8)*/

/* case 20*/

/* case 21
 * 0: succ (boolean 1:success 0:fail)
	* case succ false:
	* 1:reason (int8)*/


Local<Array> resolvValidationPack(char *pack, int subtype) {
	int pointer = HEADER_LENGTH * 2;
	Local<Array> ans = Array::New(2);
	bool succ = readBool(pack, pointer);
	ans->Set(0, Boolean::New(succ));
	switch (subtype) {
	case 0: //Login
		switch (succ) {
		case true:
			ans->Set(1, JSreadAsciiString(pack, pointer, 8));
			break;
		case false:
			ans->Set(1, JSreadInteger(pack, pointer, 1));
			break;
		}
		break;
	case 16: //Logout
		switch (succ) {
		case true:
			ans->Set(1,
					JSreadAsciiString(pack, pointer, EVENTID_LENGTH));
			break;
		case false:
			ans->Set(1, JSreadInteger(pack, pointer, 1));
			break;
		}
		break;
	case 20: //Email validation
	case 21: //Identification_code validation
		switch (succ) {
		case false:
			ans->Set(1, JSreadInteger(pack, pointer, 1));
			break;
		}
		break;
	}
	return ans;
}
/* case 1
 * 0: eventid (string)
 * 1: success (bool 1:success 0:fail)*/

Local<Array> resolvQuitPack(char *pack, int subtype) {
	int pointer = HEADER_LENGTH * 2;
	Local<Array> ans = Array::New(2);
	switch (subtype) {
	case 1: //Quit
		ans->Set(0, JSreadAsciiString(pack, pointer, EVENTID_LENGTH));
		ans->Set(1, JSreadBool(pack, pointer));
		break;
	}
	return ans;
}
/* case 5(subtype=5)
 * 0: notifications (Numbers of notifications)*/
Local<Array> resolvSuggestionPack(char *pack, int subtype) {
	int pointer = HEADER_LENGTH * 2;
	Local<Array> ans = Array::New(1);
	switch (subtype) {
	case 0: //TODO friend suggestion
		break;
	case 1: //TODO event suggestion
		break;
	case 4: //TODO tag suggestion
		break;
	case 5: //notification
		ans->Set(0, resolvNotifications(pack, pointer));
		break;
	case 6: //TODO new feature suggestion
		break;
	case 15: //TODO system polling
		break;
	}
	return ans;
}
/* case 1(direction=1)
 * 0: seqNo (int32)
 * 1: status (int8)*/

/* case 2(direction=2) 
 * 0: eventid (string)
 * 1: sender_uid (string)
 * 2: content (string)
 * 3: send_date (int32)
 * 4: send_time (int32)*/

Local<Object> resolvMessagePack(char *pack, int subtype) {
	int pointer = HEADER_LENGTH * 2, content_len;
	Local<Array> ans = Array::New(7);
	uint32_t direction = readInteger(pack, pointer, 1);
	switch (direction) {
	case 1: //for send
		ans->Set(0, JSreadInteger(pack, pointer, 4));
		ans->Set(1, JSreadInteger(pack, pointer, 1));
		break;
	case 2: //for receive
		ans->Set(0, JSreadString(pack, pointer, EVENTID_LENGTH));
		ans->Set(1, JSreadString(pack, pointer, UID_LENGTH));
		content_len = readInteger(pack, pointer, 2);
		ans->Set(2, JSreadString(pack, pointer, content_len));
		ans->Set(3, JSreadInteger(pack, pointer, 4));
		ans->Set(4, JSreadInteger(pack, pointer, 4));
		break;
	}
	return ans;
}
Handle<Value> resolvPack(const Arguments& args) {
	char* pack = new char[args[0]->ToString()->Length()];
	Local<Object> package = Object::New();
	response_header header;
	args[0]->ToString()->WriteAscii(pack, 0, args[0]->ToString()->Length());
	extract_header(pack, &header);
	package->Set(sym("header"), formJSHeader(&header));
	switch (header.type) {
	case 0:
		package->Set(sym("resolved"), resolvViewPack(pack, header.subtype));
		break;
	case 1:
		package->Set(sym("resolved"), resolvSearchPack(pack, header.subtype));
		break;
	case 2:
		package->Set(sym("resolved"), resolvCreatePack(pack, header.subtype));
		break;
	case 3:
		package->Set(sym("resolved"), resolvUpdatePack(pack, header.subtype));
		break;
	case 4: //Reply Posting
		package->Set(sym("resolved"), resolvReplyPack(pack, header.subtype));
		break;
	case 5:
		package->Set(sym("resolved"), resolvDeletePack(pack, header.subtype));
		break;
	case 6:
		package->Set(sym("resolved"),
				resolvValidationPack(pack, header.subtype));
		break;
	case 7:
		package->Set(sym("resolved"), resolvQuitPack(pack, header.subtype));
		break;
	case 10:
		package->Set(sym("resolved"),
				resolvSuggestionPack(pack, header.subtype));
		break;
	case 12:
		package->Set(sym("resolved"), resolvMessagePack(pack, header.subtype));
		break;
	}
	return package;
}
