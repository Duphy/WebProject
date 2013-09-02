#include <node.h>
#include <v8.h>
#include <vector>
#include <cstring>
#include <cstdio>

#ifdef WIN32
#define LLD "%I64d"
#else
#define LLD "%lld"
#endif
using namespace v8;

#define HEADER_LENGTH			18
#define UID_LENGTH				4
#define EVENTID_LENGTH			8
#define SID_LENGTH				4
#define RID_LENGTH				4
#define POSTID_LENGTH			8
#define NUM_OF_BYTES_IN_LENGTH	4
#define NUM_OF_BITS_IN_BYTE		8
#define SESSION_KEY_LENGTH		8
#define DUMB_SESSION_KEY		"00000000"

#define TYPE_STRING				1
#define TYPE_TAG				2
#define TYPE_UIDS  				3
#define TYPE_ONE_BYTE_INT  		4
#define TYPE_TWO_BYTE_INT  		5
#define TYPE_FOUR_BYTE_INT  	6
#define TYPE_EIGHT_BYTE_INT  	7
#define TYPE_HEADER  			8
#define TYPE_UPDATE  			9
#define TYPE_ASCII_STRING		12345

#define MAX_EIGHT_BIT_INT  		(1 << 63) - 1

#define reverse(x) ((unsigned int)((((x)&0xFF)<<24)|((((x)>>8)&0xFF)<<16)|((((x)>>16)&0xFF)<<8)|(((x)>>24)&0xFF)))
inline Local<String> sym(char *x) {
	return String::NewSymbol(x);
}
class Package {
protected:
	std::string code;
public:
	std::string codec() const {
		return code;
	}
};
class HeaderPack: public Package {
public:
	HeaderPack::HeaderPack(int length, int type, int subtype,
			Handle<String> session_key);
};
class TCPack: public Package {
public:
	TCPack(int type, Handle<String> a);
	TCPack(int type, Handle<Integer> a);
	TCPack(int type, int64_t a);
	TCPack(int type, Package a);
};
class PackList: public Package {
public:
	void add(Package a) {
		code += a.codec();
	}
};
std::string convert_int_to_hex_string(int64_t a, unsigned int length);
HeaderPack::HeaderPack(int length, int type, int subtype,
		Handle<String> session_key = String::New("00000000")) {
	PackList tmp;
	tmp.add(TCPack(TYPE_FOUR_BYTE_INT, length));
	tmp.add(TCPack(TYPE_ASCII_STRING, session_key));
	tmp.add(TCPack(TYPE_ONE_BYTE_INT, 1));
	tmp.add(TCPack(TYPE_TWO_BYTE_INT, 0));
	tmp.add(TCPack(TYPE_ONE_BYTE_INT, 0));
	tmp.add(TCPack(TYPE_ONE_BYTE_INT, type));
	tmp.add(TCPack(TYPE_ONE_BYTE_INT, subtype));
	code = tmp.codec();
}
inline char formHexBit(int a) {
	return a > 9 ? 'a' + a - 10 : '0' + a;
}
std::string convert_int_to_hex_string(int64_t a, unsigned int length) {
	char tmp[17] = { '\0' };
	for (unsigned int i = 0; i < length; i++) {
		tmp[(length - i - 1) * 2 + 1] = formHexBit(a & 0xF);
		a >>= 4;
		tmp[(length - i - 1) * 2] = formHexBit(a & 0xF);
		a >>= 4;
	}
	return std::string(tmp);
}
std::string convert_string_to_hex_string(Handle<String> src) {
	int length = src->Length();
	char *tmp = new char[length * 4 + 1];
	src->Write((uint16_t*) tmp, 0, length);
	for (int i = length - 1; i >= 0; i--) {
		tmp[i * 4 + 3] = formHexBit(tmp[i * 2] & 0xF);
		tmp[i * 4 + 2] = formHexBit((tmp[i * 2] >> 4) & 0xF);
		tmp[i * 4 + 0] = formHexBit((tmp[i * 2 + 1] >> 4) & 0xF);
		tmp[i * 4 + 1] = formHexBit(tmp[i * 2 + 1] & 0xF);
	}
	tmp[length * 4] = '\0';
	std::string ans(tmp);
	delete[] tmp;
	return ans;
}
std::string convert_ascii_string_to_hex_string(Handle<String> src) {
	int length = src->Length();
	char *tmp = new char[length * 2 + 1];
	src->WriteAscii(tmp, 0, length);
	for (int i = length - 1; i >= 0; i--) {
		tmp[i * 2 + 1] = formHexBit(tmp[i] & 0xF);
		tmp[i * 2 + 0] = formHexBit((tmp[i] >> 4) & 0xF);
	}
	tmp[length * 2] = '\0';
	std::string ans(tmp);
	delete[] tmp;
	return ans;
}
TCPack::TCPack(int type, Handle<Integer> a) {
	switch (type) {
	case TYPE_ONE_BYTE_INT:
		code = convert_int_to_hex_string(a->Value(), 1);
		break;
	case TYPE_TWO_BYTE_INT:
		code = convert_int_to_hex_string(a->Value(), 2);
		break;
	case TYPE_FOUR_BYTE_INT:
		code = convert_int_to_hex_string(a->Value(), 4);
		break;
	case TYPE_EIGHT_BYTE_INT:
		code = convert_int_to_hex_string(a->Value(), 8);
		break;
	}
}
TCPack::TCPack(int type, Handle<String> a) {
	switch (type) {
	case TYPE_STRING:
		code = convert_string_to_hex_string(a);
		break;
	case TYPE_ASCII_STRING:
		code = convert_ascii_string_to_hex_string(a);
		break;
	}
}
TCPack::TCPack(int type, Package a) {
	switch (type) {
	case TYPE_HEADER:
	case TYPE_TAG:
	case TYPE_UIDS:
	case TYPE_UPDATE:
		code = a.codec();
		break;
	};
}
TCPack::TCPack(int type, int64_t a) {
	switch (type) {
	case TYPE_ONE_BYTE_INT:
		code = convert_int_to_hex_string(a, 1);
		break;
	case TYPE_TWO_BYTE_INT:
		code = convert_int_to_hex_string(a, 2);
		break;
	case TYPE_FOUR_BYTE_INT:
		code = convert_int_to_hex_string(a, 4);
		break;
	case TYPE_EIGHT_BYTE_INT:
		code = convert_int_to_hex_string(a, 8);
		break;
	}
}
Handle<Value> createLoginPack(const Arguments& args) {
	HandleScope scope;
	PackList pkg;
	int length;
	switch (args[0]->Uint32Value()) {
	case 0:
		length = HEADER_LENGTH + 1 + 4 + 1 + args[2]->ToString()->Length() * 2;
		pkg.add(TCPack(TYPE_HEADER, HeaderPack(length, 6, 0)));
		pkg.add(TCPack(TYPE_ONE_BYTE_INT, args[0]->ToInteger()));
		pkg.add(TCPack(TYPE_FOUR_BYTE_INT, args[1]->ToInteger()));
		pkg.add(TCPack(TYPE_ONE_BYTE_INT, args[2]->ToString()->Length() * 2));
		pkg.add(TCPack(TYPE_STRING, args[2]->ToString()));
		break;
	case 1:
		length = HEADER_LENGTH + 1 + 1 + args[1]->ToString()->Length() * 2 + 1
				+ args[2]->ToString()->Length() * 2;
		pkg.add(TCPack(TYPE_HEADER, HeaderPack(length, 6, 0)));
		pkg.add(TCPack(TYPE_ONE_BYTE_INT, args[0]->ToInteger()));
		pkg.add(TCPack(TYPE_ONE_BYTE_INT, args[1]->ToString()->Length() * 2));
		pkg.add(TCPack(TYPE_STRING, args[1]->ToString()));
		pkg.add(TCPack(TYPE_ONE_BYTE_INT, args[2]->ToString()->Length() * 2));
		pkg.add(TCPack(TYPE_STRING, args[2]->ToString()));
		break;
	}
	return scope.Close(String::New(pkg.codec().data()));
}
Handle<Value> createRetrieveCurrentUserInfoPack(const Arguments& args) {
//($currentUserId, $mode,$session_key, $option) {
	PackList pkg;
	int64_t option;
	unsigned length;
	if (args[3]->IsUndefined())
		option = -1;
	else
		option = args[3]->ToInteger()->Value();
	switch (args[1]->ToInteger()->Value()) {
	case 0:
	case 1:
	case 4:
	case 6:
		length = HEADER_LENGTH + 4 + 1;
		pkg.add(
				TCPack(TYPE_HEADER,
						HeaderPack(length, 0, 11, args[2]->ToString())));
		pkg.add(TCPack(TYPE_FOUR_BYTE_INT, args[0]->ToInteger()));
		pkg.add(TCPack(TYPE_ONE_BYTE_INT, args[1]->ToInteger()));
		break;
	case 2:
		length = HEADER_LENGTH + 4 + 1 + 8;
		pkg.add(
				TCPack(TYPE_HEADER,
						HeaderPack(length, 0, 11, args[2]->ToString())));
		pkg.add(TCPack(TYPE_FOUR_BYTE_INT, args[0]->ToInteger()));
		pkg.add(TCPack(TYPE_ONE_BYTE_INT, args[1]->ToInteger()));
		pkg.add(TCPack(TYPE_EIGHT_BYTE_INT, 999999));
		break;
	case 17:
	case 18:
		length = HEADER_LENGTH + 4 + 1 + 1;
		pkg.add(
				TCPack(TYPE_HEADER,
						HeaderPack(length, 0, 11, args[2]->ToString())));
		pkg.add(TCPack(TYPE_FOUR_BYTE_INT, args[0]->ToInteger()));
		pkg.add(TCPack(TYPE_ONE_BYTE_INT, args[1]->ToInteger()));
		pkg.add(TCPack(TYPE_ONE_BYTE_INT, option));
		break;
	}
	HandleScope scope;
	return scope.Close(String::New(pkg.codec().data()));
}
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
		package->Set(sym("resolved"), resolvViewPack(pack, header.subtype));
		break;
		/*	 case 1:
		 package->Set(sym("resolved"),
		 unpack_search(pack, header.subtype));
		 break;
		 case 2:
		 package->Set(sym("resolved"),
		 unpack_create(pack, header.subtype));
		 break;
		 case 3:
		 package->Set(sym("resolved"),
		 unpack_update(pack, header.subtype));
		 break;
		 case 4:
		 package->Set(sym("resolved"),
		 unpack_reply(pack, header.subtype));
		 break;
		 case 5:
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
void init(Handle<Object> exports) {
	exports->Set(sym("createLoginPack"),
			FunctionTemplate::New(createLoginPack)->GetFunction());
	exports->Set(sym("resolvPack"),
			FunctionTemplate::New(resolvPack)->GetFunction());
	exports->Set(sym("createRetrieveCurrentUserInfoPack"),
			FunctionTemplate::New(createRetrieveCurrentUserInfoPack)->GetFunction());
}

NODE_MODULE(lib, init)
