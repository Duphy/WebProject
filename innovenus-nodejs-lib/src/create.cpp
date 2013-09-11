#include <v8.h>
#include <node.h>
#include <cstdio>
#include <string>
#include "common.h"

#define TYPE_STRING				1
#define TYPE_TAG				2
#define TYPE_UIDS  				3
#define TYPE_ONE_BYTE_INT  		4
#define TYPE_TWO_BYTE_INT  		5
#define TYPE_FOUR_BYTE_INT  	6
#define TYPE_EIGHT_BYTE_INT  	7
#define TYPE_HEADER  			8
#define TYPE_UPDATE  			9
#define TYPE_ASCII_STRING		10
#define TYPE_TAGS				11

static std::string convert_int_to_hex_string(int64_t a, unsigned int length);

#define arg(x) args->Get(sym(#x))
#define PrepareArgs() const Local<Object> args = arg_ori[0]->ToObject()
static inline char formHexBit(int a) {
	return a > 9 ? 'a' + a - 10 : '0' + a;
}
static std::string convert_int_to_hex_string(int64_t a, unsigned int length) {
	char tmp[17] = { '\0' };
	for (unsigned int i = 0; i < length; i++) {
		tmp[(length - i - 1) * 2 + 1] = formHexBit(a & 0xF);
		a >>= 4;
		tmp[(length - i - 1) * 2] = formHexBit(a & 0xF);
		a >>= 4;
	}
	return std::string(tmp);
}
static std::string convert_string_to_hex_string(Handle<String> src) {
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
static std::string convert_ascii_string_to_hex_string(Handle<String> src) {
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

static class Package {
protected:
	std::string code;
public:
	inline std::string codec() const {
		return code;
	}
};
static class HeaderPack: public Package {
public:
	HeaderPack::HeaderPack(int length, int type, int subtype,
			Handle<String> session_key);
};
static class TCPack: public Package {
public:
	TCPack(int type, Handle<String> a);
	TCPack(int type, Handle<Integer> a);
	TCPack(int type, int64_t a);
	TCPack(int type, Package a);
	TCPack(int type, Handle<Object> a);
};
static class PackList: public Package {
public:
	inline void add(Package a) {
		code += a.codec();
	}
	inline void setHeader(HeaderPack a) {
		code = a.codec() + code;
	}
	inline uint32_t length() {
		return code.length() / 2;
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
TCPack::TCPack(int type, Handle<Object> a) {
	uint32_t num, i;
	PackList tmp;
	Local<String> cur;
	switch (type) {
	case TYPE_TAGS:
		for (num = 0; !(a->Get(num)->IsUndefined()); num++)
			;
		tmp.add(TCPack(TYPE_ONE_BYTE_INT, num));
		for (i = 0; i < num; i++) {
			cur = a->Get(i)->ToString();
			tmp.add(TCPack(TYPE_ONE_BYTE_INT, cur->Length() * 2));
			tmp.add(TCPack(TYPE_STRING, cur));
		}
		code = tmp.codec();
		break;
	}
}

/**
 * - \b "6 0 Login"
 * - for UID login
 * 		- createLoginPack(0, uid, password)
 * - for Email login
 * 		- createLoginPack(1, email, password)
 * \see ::resolvValidationPack
 */

/*6 0: user (login) validation: 1 uid_or_email
 *		when (uid_or_email = 0): 4 uid, 1 password_len, ? password
 *		when (uid_or_email = 1): 1 email_len, ? email, 1 passord_len, ? password*/
// args[0]: login_type
Handle<Value> createLoginPack(const Arguments& args) {
	PackList pkg;
	switch (args[0]->Uint32Value()) {
	case 0:
		// args[1]: uid
		// args[2]: password
		pkg.add(TCPack(TYPE_ONE_BYTE_INT, args[0]->ToInteger()));
		pkg.add(TCPack(TYPE_FOUR_BYTE_INT, args[1]->ToInteger()));
		pkg.add(TCPack(TYPE_ONE_BYTE_INT, args[2]->ToString()->Length() * 2));
		pkg.add(TCPack(TYPE_STRING, args[2]->ToString()));
		break;
	case 1:
		// args[1]: email
		// args[2]: password
		pkg.add(TCPack(TYPE_ONE_BYTE_INT, args[0]->ToInteger()));
		pkg.add(TCPack(TYPE_ONE_BYTE_INT, args[1]->ToString()->Length() * 2));
		pkg.add(TCPack(TYPE_STRING, args[1]->ToString()));
		pkg.add(TCPack(TYPE_ONE_BYTE_INT, args[2]->ToString()->Length() * 2));
		pkg.add(TCPack(TYPE_STRING, args[2]->ToString()));
		break;
	}
	pkg.setHeader(HeaderPack(pkg.length() + HEADER_LENGTH, 6, 0));
	HandleScope scope;
	return scope.Close(String::New(pkg.codec().data()));
}

/**
 * - \b "0 11 View self"
 * - for view self's friends
 * 		- createViewSelfPack(0, session_key, current_uid)
 * - for view self's events
 * 		- createViewSelfPack(1, session_key, current_uid)
 * - for view self's posting
 * 		- createViewSelfPack(2, session_key, current_uid, max_pid)
 * - for view self's info
 * 		- createViewSelfPack(4, session_key, current_uid)
 * - for view self's settings
 * 		- createViewSelfPack(6, session_key, current_uid)
 * - for view self's schedules
 * 		- createViewSelfPack(17, session_key, current_uid, option)
 * 		- option:
 * 			- 0=personal schedule
 * 			- 1=event schedule
 * 			- 2=both
 * - for view self's circatags
 * 		- createViewSelfPack(18, session_key, current_uid, option)
 * 		- option:
 * 			- 0=for personal
 * 			- 1=for city
 * 			- 2=for friends
 * 			- 3=for city-user
 * 			- 4=for city-events
 * 			- 5=for city-posting
 * - for view self's big avarta
 * 		- createViewSelfPack(23, session_key, current_uid, local_version_date, local_version_time)
 * - for view self's small avarta
 * 		- createViewSelfPack(24, session_key, current_uid, local_version_date, local_version_time)
 * 	\see ::resolvViewPack
 */

/*0 11 View Self: 4 viewer,
 * 1 subtype2 {0 for friends, 1 for event, 2 for posting, 4 for info, 6 settings,
 *	 	 	 	 17 for schedule, 18 for circatag, 23 for avarta large, 24 for avarta small}
 *		when (subtype2==2): 8 max_pid
 *		when (subtype2==17): 1 option {0 for personal schedule, 1 for event schedules, 2 for both}
 *		when (subtype2==18): 1 option {0 for personal, 1 for city, 2 for friends. 3 for city-user, 4 for city-events, 5 for city-posting}
 *		when (subtyp2 = 23 or 24): 4 local_version_date, 4 local_version_time;*/
// args[0]: mode
// args[1]: session_key
// args[2]: current_uid
Handle<Value> createViewSelfPack(const Arguments& args) {
	PackList pkg;
	switch (args[0]->Uint32Value()) {
	case 0:
	case 1:
	case 4:
	case 6:
		pkg.add(TCPack(TYPE_FOUR_BYTE_INT, args[2]->ToInteger()));
		pkg.add(TCPack(TYPE_ONE_BYTE_INT, args[0]->ToInteger()));
		break;
	case 2: // args[3]: pid
		pkg.add(TCPack(TYPE_FOUR_BYTE_INT, args[2]->ToInteger()));
		pkg.add(TCPack(TYPE_ONE_BYTE_INT, args[0]->ToInteger()));
		pkg.add(TCPack(TYPE_ASCII_STRING, args[3]->ToString()));
		break;
	case 17:
	case 18: // args[3]: option
		pkg.add(TCPack(TYPE_FOUR_BYTE_INT, args[2]->ToInteger()));
		pkg.add(TCPack(TYPE_ONE_BYTE_INT, args[0]->ToInteger()));
		pkg.add(TCPack(TYPE_ONE_BYTE_INT, args[3]->ToInteger()));
		break;
	case 23:
	case 24:
		// args[3]: local_version_date
		// args[4]: local_version_time
		pkg.add(TCPack(TYPE_FOUR_BYTE_INT, args[2]->ToInteger()));
		pkg.add(TCPack(TYPE_ONE_BYTE_INT, args[0]->ToInteger()));
		pkg.add(TCPack(TYPE_FOUR_BYTE_INT, args[3]->ToInteger()));
		pkg.add(TCPack(TYPE_FOUR_BYTE_INT, args[4]->ToInteger()));
		break;
	}
	pkg.setHeader(
			HeaderPack(pkg.length() + HEADER_LENGTH, 0, 11,
					args[1]->ToString()));
	HandleScope scope;
	return scope.Close(String::New(pkg.codec().data()));
}

/**
 * - \b "0 0 View user"
 * - for view user's friends
 * 		- createViewUserPack(0, session_key, viewer_uid, viewee_uid)
 * - for view user's events
 * 		- createViewUserPack(1, session_key, viewer_uid, viewee_uid)
 * - for view user's postings
 * 		- createViewUserPack(2, session_key, viewer_uid, viewee_uid, max_pid)
 * - for view user's info
 * 		- createViewUserPack(4, session_key, viewer_uid, viewee_uid)
 * - for view user's circatags
 * 		- createViewUserPack(18, session_key, viewer_uid, viewee_uid)
 * - for view user's big avarta
 * 		- createViewUserPack(23, session_key, viewer_uid, viewee_uid, local_version_date, local_version_time)
 * - for view user's small avarta
 * 		- createViewUserPack(24, session_key, viewer_uid, viewee_uid, local_version_date, local_version_time)
 */
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
	switch (args[0]->Uint32Value()) {
	case 0:
	case 1:
	case 4:
	case 18:
		pkg.add(TCPack(TYPE_FOUR_BYTE_INT, args[2]->ToInteger()));
		pkg.add(TCPack(TYPE_FOUR_BYTE_INT, args[3]->ToInteger()));
		pkg.add(TCPack(TYPE_ONE_BYTE_INT, args[0]->ToInteger()));
		break;
	case 2:
		// args[4]: postid
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
	pkg.add(
			HeaderPack(pkg.length() + HEADER_LENGTH, 0, 0,
					args[1]->ToString()));
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
	switch (args[0]->Uint32Value()) {
	case 0:
	case 4:
	case 5:
	case 17:
	case 18:
		pkg.add(TCPack(TYPE_FOUR_BYTE_INT, args[2]->ToInteger()));
		pkg.add(TCPack(TYPE_ASCII_STRING, args[3]->ToString()));
		pkg.add(TCPack(TYPE_ONE_BYTE_INT, args[0]->ToInteger()));
		break;
	case 2:
		// args[4]: pid
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
	pkg.setHeader(
			HeaderPack(pkg.length() + HEADER_LENGTH, 0, 1,
					args[1]->ToString()));
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
	pkg.add(TCPack(TYPE_FOUR_BYTE_INT, args[1]->ToInteger()));
	pkg.add(TCPack(TYPE_FOUR_BYTE_INT, args[2]->ToInteger()));
	pkg.add(TCPack(TYPE_ASCII_STRING, args[3]->ToString()));
	pkg.add(TCPack(TYPE_ASCII_STRING, args[4]->ToString()));
	pkg.setHeader(
			HeaderPack(pkg.length() + HEADER_LENGTH, 0, 2,
					args[0]->ToString()));
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
	switch (args[0]->Uint32Value()) {
	case 0:
		pkg.add(TCPack(TYPE_FOUR_BYTE_INT, args[3]->ToInteger()));
		pkg.add(TCPack(TYPE_ONE_BYTE_INT, args[0]->ToInteger()));
		pkg.add(TCPack(TYPE_ONE_BYTE_INT, args[1]->ToInteger()));
		break;
	case 1:
		// args[4]: pid
		pkg.add(TCPack(TYPE_FOUR_BYTE_INT, args[3]->ToInteger()));
		pkg.add(TCPack(TYPE_ONE_BYTE_INT, args[0]->ToInteger()));
		pkg.add(TCPack(TYPE_ONE_BYTE_INT, args[1]->ToInteger()));
		pkg.add(TCPack(TYPE_ASCII_STRING, args[4]->ToString()));
		break;
	}
	pkg.setHeader(
			HeaderPack(pkg.length() + HEADER_LENGTH, 0, 10,
					args[2]->ToString()));
	HandleScope scope;
	return scope.Close(String::New(pkg.codec().data()));
}

/*1 0 Search user: 4 searcher, 1 search-mode {0 for by filter, 1 for by id, 2 for by email}
 *		when (search-mode=0): 1 match-option {0 for both name and tags, 1 for name only, 2 for tags only}
 *				1 filter_len, ? filter, 1 local-or-global { 0 for local, 1 for global},
 *				age_constraints{1 from 1 to}, 1 gender {0 for female, 1 for male, 2 for all}
 *		when (search-mode=1): 4 uid
 *		when (search-mode=2): 1 email-len, ? email.*/
// args[0]: search_mode
// args[1]: session_key
// args[2]: searcher_uid
Handle<Value> createSearchUserPack(const Arguments &args) {
	PackList pkg;
	switch (args[0]->Uint32Value()) {
	case 0:
		// args[3]: match_option
		// args[4]: filter
		// args[5]: local_or_global
		// args[6]: age_lower_bound
		// args[7]: age_upper_bound
		// args[8]: gender
		pkg.add(TCPack(TYPE_FOUR_BYTE_INT, args[2]->ToInteger()));
		pkg.add(TCPack(TYPE_ONE_BYTE_INT, args[0]->ToInteger()));
		pkg.add(TCPack(TYPE_ONE_BYTE_INT, args[3]->ToInteger()));
		pkg.add(TCPack(TYPE_ONE_BYTE_INT, args[4]->ToString()->Length() * 2));
		pkg.add(TCPack(TYPE_STRING, args[4]->ToString()));
		pkg.add(TCPack(TYPE_ONE_BYTE_INT, args[5]->ToInteger()));
		pkg.add(TCPack(TYPE_ONE_BYTE_INT, args[6]->ToInteger()));
		pkg.add(TCPack(TYPE_ONE_BYTE_INT, args[7]->ToInteger()));
		pkg.add(TCPack(TYPE_ONE_BYTE_INT, args[8]->ToInteger()));
		break;
	case 1:
		// args[3]: uid_to_search
		pkg.add(TCPack(TYPE_FOUR_BYTE_INT, args[2]->ToInteger()));
		pkg.add(TCPack(TYPE_ONE_BYTE_INT, args[0]->ToInteger()));
		pkg.add(TCPack(TYPE_FOUR_BYTE_INT, args[3]->ToInteger()));
		break;
	case 2:
		// args[3]: email
		pkg.add(TCPack(TYPE_FOUR_BYTE_INT, args[2]->ToInteger()));
		pkg.add(TCPack(TYPE_ONE_BYTE_INT, args[0]->ToInteger()));
		pkg.add(TCPack(TYPE_ONE_BYTE_INT, args[3]->ToString()->Length() * 2));
		pkg.add(TCPack(TYPE_STRING, args[3]->ToString()));
		break;
	}
	pkg.setHeader(
			HeaderPack(pkg.length() + HEADER_LENGTH, 1, 0,
					args[1]->ToString()));
	HandleScope scope;
	return scope.Close(String::New(pkg.codec().data()));
}

/*1 1 Search Event: 4 searcher, 1 search-mode {0 for by filter, 1 for by id}
 *		when (search-mode=0): match-option {0 for both name and tags, 1 for name only, 2 for tags only}
 *				1 filter_len, ? filter, 1 local-or-global { 0 for local, 1 for global}
 *		when (search-mode=1): 8 eid*/
// args[0]: search_mode
// args[1]: session_key
// args[2]: searcher_uid
Handle<Value> createSearchEventPack(const Arguments &args) {
	PackList pkg;
	switch (args[0]->Uint32Value()) {
	case 0:
		// args[3]: match_option
		// args[4]: filter
		// args[5]: local_or_global
		pkg.add(TCPack(TYPE_FOUR_BYTE_INT, args[2]->ToInteger()));
		pkg.add(TCPack(TYPE_ONE_BYTE_INT, args[0]->ToInteger()));
		pkg.add(TCPack(TYPE_ONE_BYTE_INT, args[3]->ToInteger()));
		pkg.add(TCPack(TYPE_ONE_BYTE_INT, args[4]->ToString()->Length() * 2));
		pkg.add(TCPack(TYPE_STRING, args[4]->ToString()));
		pkg.add(TCPack(TYPE_ONE_BYTE_INT, args[5]->ToInteger()));
		break;
	case 1:
		// args[3]: event_id
		pkg.add(TCPack(TYPE_FOUR_BYTE_INT, args[2]->ToInteger()));
		pkg.add(TCPack(TYPE_ONE_BYTE_INT, args[0]->ToInteger()));
		pkg.add(TCPack(TYPE_ASCII_STRING, args[3]->ToString()));
		break;
	}
	pkg.setHeader(
			HeaderPack(pkg.length() + HEADER_LENGTH, 1, 1,
					args[1]->ToString()));
	HandleScope scope;
	return scope.Close(String::New(pkg.codec().data()));
}

/*1 2 Search Posting: 4 searcher, 1 search-mode {always 0}, 1 filter_len, ? filter,
 *			1 local-or-global {0 for local, 1 for global}, 1 option {0 for both, 1 for user-posting only, 2 for event-posting only}*/
// args[0]: session_key
// args[1]: searcher_uid
// args[2]: search_mode
// args[3]: filter
// args[4]: local_or_global
// args[5]: option
Handle<Value> createSearchPostingPack(const Arguments &args) {
	PackList pkg;
	pkg.add(TCPack(TYPE_FOUR_BYTE_INT, args[1]->ToInteger()));
	pkg.add(TCPack(TYPE_ONE_BYTE_INT, args[2]->ToInteger()));
	pkg.add(TCPack(TYPE_ONE_BYTE_INT, args[3]->ToString()->Length() * 2));
	pkg.add(TCPack(TYPE_STRING, args[3]->ToString()));
	pkg.add(TCPack(TYPE_ONE_BYTE_INT, args[4]->ToInteger()));
	pkg.add(TCPack(TYPE_ONE_BYTE_INT, args[5]->ToInteger()));
	pkg.setHeader(
			HeaderPack(pkg.length() + HEADER_LENGTH, 1, 2,
					args[0]->ToString()));
	HandleScope scope;
	return scope.Close(String::New(pkg.codec().data()));
}

/*2 0 Create User: 1 email len, ? email, 1 password_len, ? password, 1 name len, ? name, 1 nickname len, ? nickname,
 *				   4 birthday, 1 gender,
 *				   1 city len, ? city, 1 state len, ? state, 1 country len, ? country,
 *				   1 # visible tags, <visible tags{1 len, ?tag}>,
 *				   1 # hidden tags, <hidden tags{1 len, ?tag}>*/
Handle<Value> createCreateUserPack(const Arguments &arg_ori) {
	PackList pkg;
	PrepareArgs();
	pkg.add(TCPack(TYPE_ONE_BYTE_INT, arg(email)->ToString()->Length() * 2));
	pkg.add(TCPack(TYPE_STRING, arg(email)->ToString()));
	pkg.add(TCPack(TYPE_ONE_BYTE_INT, arg(password)->ToString()->Length() * 2));
	pkg.add(TCPack(TYPE_STRING, arg(password)->ToString()));
	pkg.add(TCPack(TYPE_ONE_BYTE_INT, arg(name)->ToString()->Length() * 2));
	pkg.add(TCPack(TYPE_STRING, arg(name)->ToString()));
	pkg.add(TCPack(TYPE_ONE_BYTE_INT,
	arg(nick_name)->ToString()->Length() * 2));
	pkg.add(TCPack(TYPE_STRING, arg(nick_name)->ToString()));
	pkg.add(TCPack(TYPE_FOUR_BYTE_INT, arg(birthday)->ToInteger()));
	pkg.add(TCPack(TYPE_ONE_BYTE_INT, arg(gender)->ToInteger()));
	pkg.add(TCPack(TYPE_ONE_BYTE_INT, arg(city)->ToString()->Length() * 2));
	pkg.add(TCPack(TYPE_STRING, arg(city)->ToString()));
	pkg.add(TCPack(TYPE_ONE_BYTE_INT, arg(state)->ToString()->Length() * 2));
	pkg.add(TCPack(TYPE_STRING, arg(state)->ToString()));
	pkg.add(TCPack(TYPE_ONE_BYTE_INT, arg(country)->ToString()->Length() * 2));
	pkg.add(TCPack(TYPE_STRING, arg(country)->ToString()));
	pkg.add(TCPack(TYPE_TAGS, arg(tags)->ToObject()));
	pkg.add(TCPack(TYPE_TAGS, arg(hidden_tags)->ToObject()));
	pkg.setHeader(HeaderPack(pkg.length() + HEADER_LENGTH, 2, 0,
	arg(session_key)->ToString()));
	HandleScope scope;
	return scope.Close(String::New(pkg.codec().data()));
}

/*2 1 Create Event: 1 name_len, ? name, 4 creater id, 1 description len, ? description, 1 city_len, ? city
 *					1 # tags, <tags{1 len, ?tag}>*/
Handle<Value> createCreateEventPack(const Arguments &arg_ori) {
	PackList pkg;
	PrepareArgs();
	pkg.add(TCPack(TYPE_ONE_BYTE_INT, arg(name)->ToString()->Length() * 2));
	pkg.add(TCPack(TYPE_STRING, arg(name)->ToString()));
	pkg.add(TCPack(TYPE_FOUR_BYTE_INT, arg(creater_uid)->ToString()));
	pkg.add(TCPack(TYPE_ONE_BYTE_INT,
	arg(description)->ToString()->Length() * 2));
	pkg.add(TCPack(TYPE_STRING, arg(description)->ToString()));
	pkg.add(TCPack(TYPE_ONE_BYTE_INT, arg(city)->ToString()->Length() * 2));
	pkg.add(TCPack(TYPE_STRING, arg(city)->ToString()));
	pkg.add(TCPack(TYPE_TAGS, arg(tags)->ToObject()));
	pkg.setHeader(HeaderPack(pkg.length(), 2, 1, arg(session_key)->ToString()));
	HandleScope scope;
	return scope.Close(String::New(pkg.codec().data()));
}
