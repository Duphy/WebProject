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
		std::sprintf(tmp, LLD, ans);
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
Local<Array> resolvUIDs(char *pack, int &pointer) {
	uint32_t num = readInteger(pack, pointer, 4);
	Local<Array> ans = Array::New(num);
	for (uint32_t i = 0; i < num; i++)
		ans->Set(i, JSreadInteger(pack, pointer, UID_LENGTH));
	return ans;
}
Local<Array> resolvEventIDs(char *pack, int &pointer) {
	uint32_t num = readInteger(pack, pointer, 4);
	Local<Array> ans = Array::New(num);
	for (uint32_t i = 0; i < num; i++)
		ans->Set(i, JSreadAsciiString(pack, pointer, EVENTID_LENGTH));
	return ans;
}
Local<Object> resolvPosting(char *pack, int &pointer) {
	Local<Object> ans = Object::New();
	ans->Set(sym("uid"), JSreadInteger(pack, pointer, UID_LENGTH));
	ans->Set(sym("eventid"), JSreadAsciiString(pack, pointer, EVENTID_LENGTH));
	ans->Set(sym("postid"), JSreadInteger(pack, pointer, POSTID_LENGTH));
	return ans;
}
Local<Array> resolvPostings(char *pack, int &pointer) {
	uint32_t num = readInteger(pack, pointer, 4);
	Local<Array> ans = Array::New(num);
	for (uint32_t i = 0; i < num; i++)
		ans->Set(i, resolvPosting(pack, pointer));
	return ans;
}
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
Local<Array> resolvReplies(char *pack, int &pointer) {
	uint32_t num = readInteger(pack, pointer, 4);
	uint32_t length;
	uint32_t replyer_name_len, reply_to_name_len, reply_content_len;
	Local<Array> ans = Array::New(num);
	for (uint32_t i = 0; i < num; i++) {
		ans->Set(sym("rid"), JSreadInteger(pack, pointer, RID_LENGTH));
		ans->Set(sym("replier_uid"), JSreadInteger(pack, pointer, UID_LENGTH));
		ans->Set(sym("reply_to_uid"), JSreadInteger(pack, pointer, UID_LENGTH));
		replyer_name_len = readInteger(pack, pointer, 1);
		ans->Set(sym("replyer_name"),
				JSreadString(pack, pointer, replyer_name_len));
		reply_to_name_len = readInteger(pack, pointer, 1);
		ans->Set(sym("reply_to_name"),
				JSreadString(pack, pointer, reply_to_name_len));
		reply_content_len = readInteger(pack, pointer, 1);
		ans->Set(sym("reply_content"),
				JSreadString(pack, pointer, reply_content_len));
		ans->Set(sym("reply_date"), JSreadInteger(pack, pointer, 4));
		ans->Set(sym("reply_time"), JSreadInteger(pack, pointer, 4));
		ans->Set(sym("visibility"), JSreadInteger(pack, pointer, 1));
	}
	return ans;
}
Local<Object> resolvUserSimpleOtherPack(char *pack, int &pointer) {
	Local<Object> ans = Object::New();
	ans->Set(sym("uid"), JSreadInteger(pack, pointer, UID_LENGTH));
	uint32_t length;
	length = readInteger(pack, pointer, 4);
	ans->Set(sym("nick_name"), JSreadString(pack, pointer, length));
	length = readInteger(pack, pointer, 4);
	ans->Set(sym("name"), JSreadString(pack, pointer, length));
	ans->Set(sym("birthday"), JSreadInteger(pack, pointer, 4));
	ans->Set(sym("gender"), JSreadInteger(pack, pointer, 1));
	length = readInteger(pack, pointer, 1);
	ans->Set(sym("city"), JSreadString(pack, pointer, length));
	ans->Set(sym("tags"), resolvTags(pack, pointer));
	ans->Set(sym("friends"), resolvUIDs(pack, pointer));
	//TODO Profile picture
	return ans;
}
Local<Object> resolvWeightedTag(char *pack, int &pointer) {
	Local<Object> ans = Object::New();
	uint32_t length = readInteger(pack, pointer, 1);
	ans->Set(sym("text"), JSreadString(pack, pointer, length));
	ans->Set(sym("weight"), JSreadInteger(pack, pointer, 8));
	return ans;
}
Local<Array> resolvWeightedTags(char *pack, int &pointer) {
	uint32_t num = readInteger(pack, pointer, 4);
	Local<Array> ans = Array::New(num);
	for (uint32_t i = 0; i < num; i++)
		ans->Set(i, resolvWeightedTag(pack, pointer));
	return ans;
}
Local<Array> resolvHonors(char *pack, int &pointer) {
	uint32_t num = readInteger(pack, pointer, 1);
	Local<Array> ans = Array::New(num);
	for (uint32_t i = 0; i < num; i++)
		ans->Set(i, JSreadInteger(pack, pointer, 1));
	return ans;
}
Local<Object> resolvEventSimpleOtherPack(char *pack, int &pointer) {
	Local<Object> ans = Object::New();
	ans->Set(sym("eventid"), JSreadAsciiString(pack, pointer, EVENTID_LENGTH));
	uint32_t length = readInteger(pack, pointer, 1);
	ans->Set(sym("name"), JSreadString(pack, pointer, length));
	ans->Set(sym("creator"), JSreadInteger(pack, pointer, UID_LENGTH));
	length = readInteger(pack, pointer, 1);
	ans->Set(sym("description"), JSreadString(pack, pointer, length));
	ans->Set(sym("tags"), resolvTags(pack, pointer));
	length = readInteger(pack, pointer, 1);
	ans->Set(sym("city"), JSreadString(pack, pointer, length));
	ans->Set(sym("rating"), JSreadInteger(pack, pointer, 4));
	ans->Set(sym("honors"), resolvHonors(pack, pointer));
	return ans;
}
Local<Object> resolvUserSimplePack(char *pack, int &pointer) {
	Local<Object> ans = Object::New();
	ans->Set(sym("uid"), JSreadInteger(pack, pointer, UID_LENGTH));
	uint32_t length = readInteger(pack, pointer, 1);
	ans->Set(sym("name"), JSreadString(pack, pointer, length));
	length = readInteger(pack, pointer, 1);
	ans->Set(sym("nick_name"), JSreadString(pack, pointer, length));
	ans->Set(sym("birthday"), JSreadInteger(pack, pointer, 4));
	ans->Set(sym("tags"), resolvTags(pack, pointer));
	ans->Set(sym("hidden_tags"), resolvTags(pack, pointer));
	ans->Set(sym("honors"), resolvHonors(pack, pointer));
	ans->Set(sym("gender"), JSreadInteger(pack, pointer, 1));
	length = readInteger(pack, pointer, 1);
	ans->Set(sym("city"), JSreadString(pack, pointer, length));
	length = readInteger(pack, pointer, 1);
	ans->Set(sym("state"), JSreadString(pack, pointer, length));
	length = readInteger(pack, pointer, 1);
	ans->Set(sym("country"), JSreadString(pack, pointer, length));
	//TODO Profile picture
	return ans;
}
Local<Object> resolvUserSettingPack(char *pack, int &pointer) {
	uint32_t num = readInteger(pack, pointer, 1);
	Local<Object> ans = Object::New();
	for (uint32_t i = 0; i < num; i++) {
		uint32_t type = readInteger(pack, pointer, 1);
		switch (type) {
		case 0:
			ans->Set(sym("news_visibility"), JSreadInteger(pack, pointer, 1));
			break;
		case 1:
			ans->Set(sym("friend_request_setting"),
					JSreadInteger(pack, pointer, 1));
			break;
		case 2:
			ans->Set(sym("event_invitation_setting"),
					JSreadInteger(pack, pointer, 1));
			break;
		case 3:
			ans->Set(sym("message_notification_setting"),
					JSreadInteger(pack, pointer, 1));
			break;
		case 4:
			ans->Set(sym("strangers_message_setting"),
					JSreadInteger(pack, pointer, 1));
			break;
		}
	}
	return ans;
}
Local<Object> resolvSchedule(char *pack, int &pointer) {
	Local<Object> ans = Object::New();
	ans->Set(sym("uid"), JSreadInteger(pack, pointer, UID_LENGTH));
	ans->Set(sym("eventid"), JSreadString(pack, pointer, EVENTID_LENGTH));
	ans->Set(sym("sid"), JSreadInteger(pack, pointer, 4));
	ans->Set(sym("start_date"), JSreadInteger(pack, pointer, 4));
	ans->Set(sym("start_time"), JSreadInteger(pack, pointer, 4));
	ans->Set(sym("end_date"), JSreadInteger(pack, pointer, 4));
	ans->Set(sym("end_time"), JSreadInteger(pack, pointer, 4));
	uint32_t length = readInteger(pack, pointer, 1);
	ans->Set(sym("place"), JSreadString(pack, pointer, length));
	length = readInteger(pack, pointer, 1);
	ans->Set(sym("description"), JSreadString(pack, pointer, length));
	ans->Set(sym("with_users"), resolvUIDs(pack, pointer));
	return ans;
}
Local<Array> resolvSchedules(char *pack, int &pointer) {
	uint32_t num = readInteger(pack, pointer, 4);
	Local<Array> ans = Array::New(num);
	for (uint32_t i = 0; i < num; i++)
		ans->Set(i, resolvSchedule(pack, pointer));
	return ans;
}
Local<Object> resolvUpdate(char *pack, int &pointer) {
	Local<Object> ans = Object::New();
	ans->Set(sym("attribute"), JSreadInteger(pack, pointer, 1));
	ans->Set(sym("success"), JSreadBool(pack, pointer, 1));
	return ans;
}
Local<Array> resolvUpdates(char *pack, int &pointer) {
	uint32_t num = readInteger(pack, pointer, 1);
	Local<Array> ans = Array::New(num);
	for (uint32_t i = 0; i < num; i++)
		ans->Set(i, resolvUpdate(pack, pointer));		
	return ans;
}
Local<Object> resolvViewPack(char *pack, int subtype) {
	int pointer = HEADER_LENGTH * 2, mode;
	Local<Object> ans = Object::New();
	switch (subtype) {
	case 0: //View user
		ans->Set(sym("viewee_uid"), JSreadInteger(pack, pointer, UID_LENGTH));
		mode = readInteger(pack, pointer, 1);
		ans->Set(sym("mode"), Integer::New(mode));
		switch (mode) {
		case 0: //View user's friends
			ans->Set(sym("friends"), resolvUIDs(pack, pointer));
			break;
		case 1: //View user's events
			ans->Set(sym("events"), resolvEventIDs(pack, pointer));
			break;
		case 2: //View user's posting
			ans->Set(sym("postings"), resolvPostings(pack, pointer));
			break;
		case 4: //View user's info
			ans->Set(sym("info"), resolvUserSimpleOtherPack(pack, pointer));
			break;
		case 18: //View user's circatag
			ans->Set(sym("opt"), JSreadInteger(pack, pointer, 1));
			ans->Set(sym("circatags"), resolvWeightedTags(pack, pointer));
			break;
		case 23: //View user's avarta big
			//TODO avarta
		case 24:				//View user's avarta small
			//TODO avarta
			break;
		}
		break;
	case 1: //View event
		ans->Set(sym("eventid"),
				JSreadAsciiString(pack, pointer, EVENTID_LENGTH));
		mode = readInteger(pack, pointer, 1);
		ans->Set(sym("mode"), Integer::New(mode));
		switch (mode) {
		case 0: //View member event
			ans->Set(sym("members"), resolvUIDs(pack, pointer));
			break;
		case 2: //View posting event
			ans->Set(sym("postings"), resolvPostings(pack, pointer));
			break;
		case 4: //View event's info
			ans->Set(sym("info"), resolvEventSimpleOtherPack(pack, pointer));
			break;
		case 5: //View managers event
			ans->Set(sym("managers"), resolvUIDs(pack, pointer));
			break;
		case 6: //TODO View event's setting pack
			break;
		case 17: //View schedule event
			ans->Set(sym("schedules"), resolvSchedules(pack, pointer));
			break;
		case 18: //View Circatag_Pack
			ans->Set(sym("opt"), JSreadInteger(pack, pointer, 1));
			ans->Set(sym("circatags"), resolvWeightedTags(pack, pointer));
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
		ans->Set(sym("pid"), JSreadAsciiString(pack, pointer, POSTID_LENGTH));
		ans->Set(sym("poster_uid"), JSreadInteger(pack, pointer, UID_LENGTH));
		ans->Set(sym("event_eid"),JSreadAsciiString(pack, pointer, EVENTID_LENGTH));
		ans->Set(sym("post_date"), JSreadInteger(pack, pointer, 4));
		ans->Set(sym("post_time"), JSreadInteger(pack, pointer, 4));
		content_len = readInteger(pack, pointer, 2);
		ans->Set(sym("content"), JSreadString(pack, pointer, content_len));
		ans->Set(sym("visibility"), JSreadInteger(pack, pointer, 1));
		ans->Set(sym("tags"), resolvTags(pack, pointer));
		ans->Set(sym("replies"), resolvReplies(pack, pointer));
		break;
	case 10://View user's posting
		ans->Set(sym("postings"), resolvPostings(pack, pointer));
		break;
	case 11: //View self
		mode = readInteger(pack, pointer, 1);
		ans->Set(sym("mode"), Integer::New(mode));
		switch (mode) {
		case 0: //View self's friends
			ans->Set(sym("friends"), resolvUIDs(pack, pointer));
			break;
		case 1: //View self's events
			ans->Set(sym("events"), resolvEventIDs(pack, pointer));
			break;
		case 2: //View self's posting
			ans->Set(sym("postings"), resolvPostings(pack, pointer));
			break;
		case 4: //View self's info
			ans->Set(sym("info"), resolvUserSimplePack(pack, pointer));
			break;
		case 6:
			ans->Set(sym("settings"), resolvUserSettingPack(pack, pointer));
			break;
		case 17:
			ans->Set(sym("schedules"), resolvSchedules(pack, pointer));
			break;
		case 18: //View self's circatag
			ans->Set(sym("opt"), JSreadInteger(pack, pointer, 1));
			ans->Set(sym("circatags"), resolvWeightedTags(pack, pointer));
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
Local<Object> resolvSearch(char *pack, int subtype) {
	int pointer = HEADER_LENGTH * 2, mode;
	Local<Object> ans = Object::New();
	switch (subtype) {
	case 0://Search User
		ans->Set(sym("members"), resolvUIDs(pack, pointer));
		break;
	case 1://Search Event
		ans->Set(sym("events"), resolvEventIDs(pack, pointer));
		break;
	case 2://Search Posting
		ans->Set(sym("postings"), resolvPostings(pack, pointer));
		break;
	}
	return ans;
}
Local<Object> resolvCreate(char *pack, int subtype) {
	int pointer = HEADER_LENGTH * 2;
	bool succ = readBool(pack, pointer);
	ans->Set(sym("success"), Boolean::New(succ));
	Local<Object> ans = Object::New();
	switch (subtype) {
	case 0: //Create User
	        if (succ)
		{
			ans->Set(sym("uid"), JSreadInteger(pack, pointer, UID_LENGTH));
		}else{
			ans->Set(sym("reason"), JSreadInteger(pack, pointer, 1));
		}
		break;
	case 1: //Create Event
		if (succ)
		{
			ans->Set(sym("uid"), JSreadString(pack, pointer, EVENTID_LENGTH));
		}else{
			ans->Set(sym("reason"), JSreadInteger(pack, pointer, 1));
		}
		break;
	case 2: //Create Posting
		if (succ)
		{
			ans->Set(sym("posting"), resolvPosting(pack, pointer));
		}else{
			ans->Set(sym("reason"), JSreadInteger(pack, pointer, 1));
		}
		break;
	case 3: //Create Request
		//TODO CTS-without-requester
		if (succ)
		{
		}else {
			ans->Set(sym("reason"), JSreadInteger(pack, pointer, 1));
		}
		break;
	case 17: //Create Schedule
		if (succ)
		{
			ans->Set(sym("uid"), JSreadInteger(pack, pointer, UID_LENGTH));
			ans->Set(sym("eventid"), JSreadString(pack, pointer, EVENTID_LENGTH));
			ans->Set(sym("sid"), JSreadInteger(pack, pointer, 4));	
		}else{
			ans->Set(sym("reason"), JSreadInteger(pack, pointer, 1));
		}
		break;
	}
	return ans;
}
Local<Object> resolvUpdatePack(char *pack, int subtype) {
	int pointer = HEADER_LENGTH * 2, mode;
	bool succ;
	Local<Object> ans = Object::New();
	switch (subtype) {
	case 0: //updates
		ans->Set(sym("updates"), resolvUpdates(pack,pointer));
		break;
	case 1: //event updates
		ans->Set(sym("eid"), JSreadString(pack, pointer, EVENTID_LENGTH));
		ans->Set(sym("updates"), resolvUpdates(pack,pointer));
		break;
	case 23://avarta
		mode=readInteger(pack, pointer, 1);
		switch (mode){
		case 0: //User
			ans->Set(sym("uid"), JSreadInteger(pack, pointer, UID_LENGTH));
			break;
		case 1: //User and Event
			ans->Set(sym("uid"), JSreadInteger(pack, pointer, UID_LENGTH));
			ans->Set(sym("eventid"), JSreadString(pack, pointer, EVENTID_LENGTH));
			break;
		}
		succ = readBool(pack, pointer);
		ans->Set(sym("success"), Boolean::New(succ));
		if (succ)
		{
			ans->Set(sym("version_date"), JSreadInteger(pack, pointer, 4));
			ans->Set(sym("version_time"), JSreadInteger(pack, pointer, 4));					}
		break;
	
	case 24://avarta
		mode=readInteger(pack, pointer, 1);
		switch (mode){
		case 0: //User
			ans->Set(sym("uid"), JSreadInteger(pack, pointer, UID_LENGTH));
			break;
		case 1: //User and Event
			ans->Set(sym("uid"), JSreadInteger(pack, pointer, UID_LENGTH));
			ans->Set(sym("eventid"), JSreadString(pack, pointer, EVENTID_LENGTH));
			break;
		}
		succ = readBool(pack, pointer);
		ans->Set(sym("success"), Boolean::New(succ));
		if (succ)
		{
			ans->Set(sym("version_date"), JSreadInteger(pack, pointer, 4));
			ans->Set(sym("version_time"), JSreadInteger(pack, pointer, 4));					}
		break;
	
	return ans;
}
Local<Object> resolvReply(char *pack, int subtype) {
	int pointer = HEADER_LENGTH * 2, mode;
	ans->Set(sym("poster_uid"), JSreadInteger(pack, pointer, UID_LENGTH));
	ans->Set(sym("reply_to_uid"), JSreadInteger(pack, pointer, UID_LENGTH));
	ans->Set(sym("eventid"), JSreadString(pack, pointer, EVENTID_LENGTH));
	ans->Set(sym("pid"), JSreadString(pack, pointer, EVENTID_LENGTH));
	ans->Set(sym("acknowledgement"), JSreadInteger(pack, pointer, 1));
	return ans;
}			
Local<Object> resolvDelete(char *pack, int subtype) {
	int pointer = HEADER_LENGTH * 2;
	Local<Object> ans = Object::New();
	switch (subtype){
	case 0: //delete friends
		ans->Set(sym("friend_uid"), JSreadInteger(pack, pointer, UID_LENGTH));
		ans->Set(sym("success"), JSreadBool(pack, pointer, 1));
		break;
	case 2: //delete posting
		ans->Set(sym("uid"), JSreadInteger(pack, pointer, UID_LENGTH));
		ans->Set(sym("eventid"), JSreadString(pack, pointer, EVENTID_LENGTH));
		ans->Set(sym("pid"), JSreadString(pack, pointer, EVENTID_LENGTH));
		ans->Set(sym("success"), JSreadBool(pack, pointer, 1));
		break;
	case 17://delete schedule
		ans->Set(sym("uid"), JSreadInteger(pack, pointer, UID_LENGTH));
		ans->Set(sym("eventid"), JSreadString(pack, pointer, EVENTID_LENGTH));
		ans->Set(sym("sid"), JSreadInteger(pack, pointer, 4));
		ans->Set(sym("success"), JSreadBool(pack, pointer, 1));
		break;
	case 22://delete replies
		ans->Set(sym("your_uid"), JSreadInteger(pack, pointer, UID_LENGTH));
		ans->Set(sym("uid"), JSreadInteger(pack, pointer, UID_LENGTH));
		ans->Set(sym("eventid"), JSreadString(pack, pointer, EVENTID_LENGTH));
		ans->Set(sym("pid"), JSreadString(pack, pointer, EVENTID_LENGTH));
		ans->Set(sym("rid"), JSreadInteger(pack, pointer, UID_LENGTH));
		ans->Set(sym("success"), JSreadBool(pack, pointer, 1));
		break;		
	}
	return ans;
}	
						
Local<Object> resolvValidationPack(char *pack, int subtype) {
	int pointer = HEADER_LENGTH * 2;
	Local<Object> ans = Object::New();
	bool succ = readBool(pack, pointer);
	ans->Set(sym("success"), Boolean::New(succ));
	switch (subtype) {
	case 0: //Login
		switch (succ) {
		case true:
			ans->Set(sym("session_key"), JSreadAsciiString(pack, pointer, 8));
			break;
		case false:
			ans->Set(sym("reason"), JSreadInteger(pack, pointer, 1));
			break;
		}
		break;
	case 16: //Logout
		switch (succ) {
		case true:
			ans->Set(sym("eventid"),
					JSreadAsciiString(pack, pointer, EVENTID_LENGTH));
			break;
		case false:
			ans->Set(sym("reason"), JSreadInteger(pack, pointer, 1));
			break;
		}
		break;
	case 20: //Email validation
	case 21: //Identification_code validation
		switch (succ) {
		case false:
			ans->Set(sym("reason"), JSreadInteger(pack, pointer, 1));
			break;
		}
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
		package->Set(sym("resolved"),resolvViewPack(pack, header.subtype));
		break;
        case 1:
		package->Set(sym("resolved"),resolvSearch(pack, header.subtype));
		break;
	case 2:
   		package->Set(sym("resolved"),resolvCreate(pack, header.subtype));
		break;
	case 3:
		package->Set(sym("resolved"),resolvUpdatePack(pack, header.subtype));
		break;
	case 4: //Replu Posting
		package->Set(sym("resolved"),resolvReply(pack, header.subtype));
		break;
		/* case 5:
		 package->Set(sym("resolved"),
		 unpack_delete(pack, header.subtype));
		 break;*/
	case 6:
		package->Set(sym("resolved"),
				resolvValidationPack(pack, header.subtype));
		break;
		/*	case 7:
		 package->Set(sym("resolved"),
		 unpack_quit(pack, header.subtype));
		 break;
		 case 10:
		 package->Set(sym("resolved"),
		 unpack_suggestion(pack, header.subtype));
		 break;
		 case 12:
		 package->Set(sym("resolved"),
		 unpack_system_message(pack, header.subtype));
		 break;*/
	}
	return package;
}
