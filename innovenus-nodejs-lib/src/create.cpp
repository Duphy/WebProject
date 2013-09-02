#include <v8.h>
#include <node.h>
#include <cstdio>
#include <string>
#include "common.h"

std::string convert_int_to_hex_string(int64_t a, unsigned int length);

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

class Package {
protected:
	std::string code;
public:
	inline std::string codec() const {
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
	inline void add(Package a) {
		code += a.codec();
	}
};
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

/*6 0: user (login) validation: 1 uid_or_email
 *		when (uid_or_email = 0): 4 uid, 1 password_len, ? password
 *		when (uid_or_email = 1): 1 email_len, ? email, 1 passord_len, ? password*/
// args[0]: login_type
Handle<Value> createLoginPack(const Arguments& args) {
	HandleScope scope;
	PackList pkg;
	int length;
	switch (args[0]->Uint32Value()) {
	case 0:
		// args[1]: uid
		// args[2]: password
		length = HEADER_LENGTH + 1 + 4 + 1 + args[2]->ToString()->Length() * 2;
		pkg.add(TCPack(TYPE_HEADER, HeaderPack(length, 6, 0)));
		pkg.add(TCPack(TYPE_ONE_BYTE_INT, args[0]->ToInteger()));
		pkg.add(TCPack(TYPE_FOUR_BYTE_INT, args[1]->ToInteger()));
		pkg.add(TCPack(TYPE_ONE_BYTE_INT, args[2]->ToString()->Length() * 2));
		pkg.add(TCPack(TYPE_STRING, args[2]->ToString()));
		break;
	case 1:
		// args[1]: email
		// args[2]: password
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

/*0 11 View Self: 4 viewer,
 * 1 subtype2 {0 for friends, 1 for event, 2 for posting, 4 for info, 6 settings,
 *	 	 	 	 17 for schedule, 18 for circatag, , 23 for avarta large, 24 for avarta small}
 *		when (subtype2==2): 8 max_pid
 *		when (subtype2==17): 1 option {0 for personal schedule, 1 for event schedules, 2 for both}
 *		when (subtype2==18): 1 option {0 for personal, 1 for city, 2 for friends. 3 for city-user, 4 for city-events, 5 for city-posting}
 *		when (subtyp2 = 23 or 24): 4 local_version_date, 4 local_version_time;*/
// args[0]: mode
// args[1]: session_key
// args[2]: current_uid
Handle<Value> createViewSelfPack(const Arguments& args) {
	PackList pkg;
	int64_t option;
	unsigned length;
	switch (args[0]->Uint32Value()) {
	case 0:
	case 1:
	case 4:
	case 6:
		length = HEADER_LENGTH + 4 + 1;
		pkg.add(
				TCPack(TYPE_HEADER,
						HeaderPack(length, 0, 11, args[1]->ToString())));
		pkg.add(TCPack(TYPE_FOUR_BYTE_INT, args[2]->ToInteger()));
		pkg.add(TCPack(TYPE_ONE_BYTE_INT, args[0]->ToInteger()));
		break;
	case 2: // args[3]: pid
		length = HEADER_LENGTH + 4 + 1 + 8;
		pkg.add(
				TCPack(TYPE_HEADER,
						HeaderPack(length, 0, 11, args[1]->ToString())));
		pkg.add(TCPack(TYPE_FOUR_BYTE_INT, args[2]->ToInteger()));
		pkg.add(TCPack(TYPE_ONE_BYTE_INT, args[0]->ToInteger()));
		pkg.add(TCPack(TYPE_ASCII_STRING, args[3]->ToString()));
		break;
	case 17:
	case 18: // args[3]: option
		length = HEADER_LENGTH + 4 + 1 + 1;
		pkg.add(
				TCPack(TYPE_HEADER,
						HeaderPack(length, 0, 11, args[1]->ToString())));
		pkg.add(TCPack(TYPE_FOUR_BYTE_INT, args[2]->ToInteger()));
		pkg.add(TCPack(TYPE_ONE_BYTE_INT, args[0]->ToInteger()));
		pkg.add(TCPack(TYPE_ONE_BYTE_INT, args[3]->ToInteger()));
		break;
	case 23:
	case 24:
		//TODO avarta
		break;
	}
	HandleScope scope;
	return scope.Close(String::New(pkg.codec().data()));
}

/*View User: 4 viewer, 4 viewee,
 *	1 subtype2 {0 for friends, 1 for event, 2 for posting, 4 for info, 18 for circatag, 23 for avarta large, 24 for avarta small}
 *			when (subtyp2 = 2): 8 max_pid
 *			when (subtyp2 = 23 or 24): 4 local_version_date, 4 local_version_time;*/
// args[0]: subtype
// args[1]: session_key
// args[2]: viewer_uid
// args[3]: viewee_uid
Handle<Value> createViewUserPack(const Arguments &args) {
	PackList pkg;
	uint32_t length;
	switch (args[0]->Uint32Value()) {
	case 0:
	case 1:
	case 4:
	case 18:
		length = HEADER_LENGTH + UID_LENGTH + UID_LENGTH + 1;
		pkg.add(
				TCPack(TYPE_HEADER,
						HeaderPack(length, 0, 0, args[1]->ToString())));
		pkg.add(TCPack(TYPE_FOUR_BYTE_INT, args[2]->ToInteger()));
		pkg.add(TCPack(TYPE_FOUR_BYTE_INT, args[3]->ToInteger()));
		pkg.add(TCPack(TYPE_ONE_BYTE_INT, args[0]->ToInteger()));
		break;
	case 2:
		// args[4]: postid
		length = HEADER_LENGTH + UID_LENGTH + UID_LENGTH + 1 + POSTID_LENGTH;
		pkg.add(
				TCPack(TYPE_HEADER,
						HeaderPack(length, 0, 0, args[1]->ToString())));
		pkg.add(TCPack(TYPE_FOUR_BYTE_INT, args[2]->ToInteger()));
		pkg.add(TCPack(TYPE_FOUR_BYTE_INT, args[3]->ToInteger()));
		pkg.add(TCPack(TYPE_ONE_BYTE_INT, args[0]->ToInteger()));
		pkg.add(TCPack(TYPE_ASCII_STRING, args[4]->ToString()));
		break;
	case 23:
	case 24:
		// TODO avarta
		break;
	}
	HandleScope scope;
	return scope.Close(String::New(pkg.codec().data()));
}

/*0 1 View Event: 4 viewer, 8 event,
 *		1 subtype2 {0 for member, 2 for posting, 4 for info, 5 for manager, 17 for schedule, 18 for circatag, 23 for avarta large, 24 for avarta small}
 *				when (subtype2=2) : 8 max_pid
 *				when (subtyp2 = 23 or 24): 4 local_version_date, 4 local_version_time;*/
// args[0]: subtype
// args[1]: session_key
// args[2]: viewer_uid
// args[3]: eventid
Handle<Value> createViewEventPack(const Arguments &args) {
	PackList pkg;
	uint32_t length;
	switch (args[0]->Uint32Value()) {
	case 0:
	case 4:
	case 5:
	case 17:
	case 18:
		length = HEADER_LENGTH + UID_LENGTH + EVENTID_LENGTH + 1;
		pkg.add(
				TCPack(TYPE_HEADER,
						HeaderPack(length, 0, 1, args[1]->ToString())));
		pkg.add(TCPack(TYPE_FOUR_BYTE_INT, args[2]->ToInteger()));
		pkg.add(TCPack(TYPE_ASCII_STRING, args[3]->ToString()));
		pkg.add(TCPack(TYPE_ONE_BYTE_INT, args[0]->ToInteger()));
		break;
	case 2:
		// args[4]: pid
		length = HEADER_LENGTH + UID_LENGTH + EVENTID_LENGTH + 1
				+ EVENTID_LENGTH;
		pkg.add(
				TCPack(TYPE_HEADER,
						HeaderPack(length, 0, 1, args[1]->ToString())));
		pkg.add(TCPack(TYPE_FOUR_BYTE_INT, args[2]->ToInteger()));
		pkg.add(TCPack(TYPE_ASCII_STRING, args[3]->ToString()));
		pkg.add(TCPack(TYPE_ONE_BYTE_INT, args[0]->ToInteger()));
		pkg.add(TCPack(TYPE_ASCII_STRING, args[4]->ToString()));
		break;
	case 23:
	case 24:
		//TODO avarta
		break;
	}
	HandleScope scope;
	return scope.Close(String::New(pkg.codec().data()));
}

/*0 2 View Posting: 4 viewer, 4 posting_uid, 8 posting_eid, 8 posting_pid*/
// args[0]: session_key
// args[1]: viewer_uid
// args[2]: posting_uid
// args[3]: posting_eid
// args[4]: posting_pid
Handle<Value> createViewPostingPack(const Arguments &args) {
	PackList pkg;
	uint32_t length = HEADER_LENGTH + UID_LENGTH + UID_LENGTH + EVENTID_LENGTH
			+ POSTID_LENGTH;
	pkg.add(TCPack(TYPE_HEADER, HeaderPack(length, 0, 2, args[0]->ToString())));
	pkg.add(TCPack(TYPE_FOUR_BYTE_INT, args[1]->ToInteger()));
	pkg.add(TCPack(TYPE_FOUR_BYTE_INT, args[2]->ToInteger()));
	pkg.add(TCPack(TYPE_ASCII_STRING, args[3]->ToString()));
	pkg.add(TCPack(TYPE_ASCII_STRING, args[4]->ToString()));
	HandleScope scope;
	return scope.Close(String::New(pkg.codec().data()));
}

/*0 10 mass view postings: 4 viewer,
 *		1 subtype2 {0 for user postings, 1 for event posting}
 *				when (subtype2=0): 1 subtype3 {0 for friends, 1 for citimates}
 *				when (subtype2=1): 1 subtype3 {always 0} 8 max_pid;*/
// args[0]: subtype2
// args[1]: subtype3
// args[2]: session_key
// args[3]: viewer_uid
Handle<Value> createMassViewPack(const Arguments &args) {
	PackList pkg;
	uint32_t length;
	switch (args[0]->Uint32Value()) {
	case 0:
		length = HEADER_LENGTH + UID_LENGTH + 1 + 1;
		pkg.add(
				TCPack(TYPE_HEADER,
						HeaderPack(length, 0, 10, args[2]->ToString())));
		pkg.add(TCPack(TYPE_FOUR_BYTE_INT, args[3]->ToInteger()));
		pkg.add(TCPack(TYPE_ONE_BYTE_INT, args[0]->ToInteger()));
		pkg.add(TCPack(TYPE_ONE_BYTE_INT, args[1]->ToInteger()));
		break;
	case 1:
		// args[4]: pid
		length = HEADER_LENGTH + UID_LENGTH + 1 + 1 + POSTID_LENGTH;
		pkg.add(
				TCPack(TYPE_HEADER,
						HeaderPack(length, 0, 1, args[2]->ToString())));
		pkg.add(TCPack(TYPE_FOUR_BYTE_INT, args[3]->ToInteger()));
		pkg.add(TCPack(TYPE_ONE_BYTE_INT, args[0]->ToString()));
		pkg.add(TCPack(TYPE_ONE_BYTE_INT, args[1]->ToInteger()));
		pkg.add(TCPack(TYPE_ASCII_STRING, args[4]->ToString()));
		break;
	}
	HandleScope scope;
	return scope.Close(String::New(pkg.codec().data()));
}
