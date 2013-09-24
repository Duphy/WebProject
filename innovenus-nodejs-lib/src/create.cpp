#include <v8.h>
#include <node.h>
#include <cstdio>
#include <string>
#include "common.h"

#define HEADER_LENGTH			18
#define TYPE_STRING				1
#define TYPE_TAG				2
#define TYPE_UIDS  				3
#define TYPE_ONE_BYTE_INT  		4
#define TYPE_TWO_BYTE_INT  		5
#define TYPE_FOUR_BYTE_INT  	6
#define TYPE_EIGHT_BYTE_INT  	7
#define TYPE_HEADER  			8
#define TYPE_UPDATES  			9
#define TYPE_ASCII_STRING		10
#define TYPE_TAGS				11

#define SetHeadAndReturn(_session_key_index, _type, _subtype) pkg.setHeader(\
		HeaderPack(pkg.length() + HEADER_LENGTH,\
					_type, _subtype, _session_key_index==-1?String::New(DUMB_SESSION_KEY):args[_session_key_index]->ToString()));\
		HandleScope scope;\
		return scope.Close(String::New(pkg.codec().data()))
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
	HeaderPack(int length, int type, int subtype, Handle<String> session_key);
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
	inline void prepend(Package a) {
		code = a.codec() + code;
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
	uint32_t i, type2;
	PackList tmp;
	Local<String> cur2;
	Local<Object> cur3;
	Local<Value> cur;
	switch (type) {
	case TYPE_TAGS:
		cur = a->Get(i = 0);
		while (!cur->IsUndefined()) {
			cur2 = cur->ToString();
			tmp.add(TCPack(TYPE_ONE_BYTE_INT, cur2->Length() * 2));
			tmp.add(TCPack(TYPE_STRING, cur2));
			cur = a->Get(i++);
		}
		tmp.prepend(TCPack(TYPE_ONE_BYTE_INT, Integer::New(i)));
		code = tmp.codec();
		break;
	case TYPE_UPDATES:
		cur = a->Get(i = 0);
		while (!cur->IsUndefined()) {
			cur3 = cur->ToObject();
			type2 = cur3->Get(0)->Uint32Value();
			tmp.add(TCPack(TYPE_ONE_BYTE_INT, type2));
			switch (type2) {
			case 0: //password
			case 1: //name
			case 2: //nickname
			case 5: //city
			case 6: //state
			case 7: //country
			case 8: //add tag
			case 9: //del tag
				tmp.add(
						TCPack(TYPE_ONE_BYTE_INT,
								cur3->Get(1)->ToString()->Length() * 2));
				tmp.add(TCPack(TYPE_STRING, cur3->Get(1)->ToString()));
				break;
			case 3: //birthday
				tmp.add(TCPack(TYPE_FOUR_BYTE_INT, cur3->Get(1)->ToInteger()));
				break;
			case 4: //gender
				tmp.add(TCPack(TYPE_ONE_BYTE_INT, cur3->Get(1)->ToInteger()));
				break;
			case 10: //setting
				tmp.add(TCPack(TYPE_ONE_BYTE_INT, cur3->Get(1)->ToInteger()));
				tmp.add(TCPack(TYPE_ONE_BYTE_INT, cur3->Get(2)->ToInteger()));
				break;
			case 11: //add manager
			case 12: //del manager
			case 13: //del member
				tmp.add(TCPack(TYPE_FOUR_BYTE_INT, cur3->Get(1)->ToInteger()));
				break;
			}
			cur = a->Get(i++);
		}
		tmp.prepend(TCPack(TYPE_ONE_BYTE_INT, Integer::New(i)));
		code = tmp.codec();
		break;
	}
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
 * \see ::resolvViewPack
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
		// args[4]: local_version_date
		// args[5]: local_version_time
		pkg.add(TCPack(TYPE_FOUR_BYTE_INT, args[2]->ToInteger()));
		pkg.add(TCPack(TYPE_FOUR_BYTE_INT, args[3]->ToInteger()));
		pkg.add(TCPack(TYPE_ONE_BYTE_INT, args[0]->ToInteger()));
		pkg.add(TCPack(TYPE_FOUR_BYTE_INT, args[4]->ToInteger()));
		pkg.add(TCPack(TYPE_FOUR_BYTE_INT, args[5]->ToInteger()));
		break;
	}
	SetHeadAndReturn(1, 0, 0);
}

/**
 * - \b "0 1 View event"
 * - for view event's members
 * 		- createViewEventPack(0, session_key, viewer_uid, eventid)
 * - for view event's postings
 * 		- createViewEventPack(2, session_key, viewer_uid, eventid, max_pid)
 * - for view event's info
 * 		- createViewEventPack(4, session_key, viewer_uid, eventid)
 * - for view event's managers
 * 		- createViewEventPack(5, session_key, viewer_uid, eventid)
 * - for view event's schedule
 * 		- createViewEventPack(17, session_key, viewer_uid, eventid)
 * - for view event's circatags
 * 		- createViewEventPack(18, session_key, viewer_uid, eventid)
 * - for view event's big avarta
 * 		- createViewEventPack(23, session_key, viewer_uid, eventid, local_version_date, local_version_time)
 * - for view event's small avarta
 * 		- createViewEventPack(24, session_key, viewer_uid, eventid, local_version_date, local_version_time)
 * \see ::resolvViewPack
 */

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
		// args[4]: local_version_date
		// args[5]: local_version_time
		pkg.add(TCPack(TYPE_FOUR_BYTE_INT, args[2]->ToInteger()));
		pkg.add(TCPack(TYPE_ASCII_STRING, args[3]->ToString()));
		pkg.add(TCPack(TYPE_ONE_BYTE_INT, args[0]->ToInteger()));
		pkg.add(TCPack(TYPE_FOUR_BYTE_INT, args[4]->ToInteger()));
		pkg.add(TCPack(TYPE_FOUR_BYTE_INT, args[5]->ToInteger()));
		break;
	}
	SetHeadAndReturn(1, 0, 1);
}

/**
 * - \b "0 2 View posting"
 * 		- createViewPostingPack(session_key, viewer_uid, posting_uid, posting_eid, posting_pid)
 * \see ::resolvViewPack
 */

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
	SetHeadAndReturn(0, 0, 2);
}

/**
 * - \b "0 10 View mass postings"
 * - for view user's postings
 * 		- createMassViewPack(0, friends_or_citimates, session_key, viewer_uid)
 * 		- friends_or_citimates
 * 				- 0=friends
 * 				- 1=citimates
 * - for view event's postings
 * 		- createMassViewPack(1, 0, session_key, viewer_uid, max_pid)
 * \see ::resolvViewPack
 */

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
	SetHeadAndReturn(2, 0, 10);
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
	SetHeadAndReturn(1, 0, 11);
}

/**
 * - \b "1 0 Search user"
 * - for search by filter
 * 		- createSearchUserPack(0, session_key, searcher_uid, match_option, \n
 * 				filter, local_or_global, age_lower_bound, age_upper_bound, gender)
 * 		- match_option:
 * 			- 1=name
 *			- 2=tags
 *			- 0=both
 * 		- local_or_global:
 * 			- 0=local
 *			- 1=global
 * 		- gender:
 * 			- 0=female
 *			- 1=male
 * 		- 2=both
 * - for search by id
 * 		- createSearchUserPack(1, session_key, searcher_uid, uid_to_search)
 * - for search by email
 * 		- createSearchUserPack(2, session_key, searcher_uid, email_to_search)
 * \see ::resolvSearchPack
 */

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
	SetHeadAndReturn(1, 1, 0);
}

/**
 * - \b "1 1 Search event"
 * - for search by filter
 * 		- createSearchEventPack(0, session_key, searcher_uid, match_option, filter, local_or_global)
 * 		- match_option:
 * 				- 0=both
 * 				- 1=name
 * 				- 2=tags
 * 		- local_or_global:
 * 				- 0=local
 * 				- 1=global
 * - for search by id
 * 		- createSearchEventPack(1, session_key, searcher_uid, eid)
 * \see ::resolvSearchPack
 */

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
	SetHeadAndReturn(1, 1, 1);
}

/**
 * - \b "1 2 Search posting"
 * 		- createSearchPostingPack(session_key, searcher_uid, filter, local_or_global, option)
 * 		- local_or_global:
 * 				- 0=local
 * 				- 1=global
 * 		- option:
 * 				- 0=both
 * 				- 1=user-posting only
 * 				- 2=event-posting only
 * \see ::resolvSearchPack
 */

/*1 2 Search Posting: 4 searcher, 1 search-mode {always 0}, 1 filter_len, ? filter,
 *			1 local-or-global {0 for local, 1 for global}, 1 option {0 for both, 1 for user-posting only, 2 for event-posting only}*/
// args[0]: session_key
// args[1]: searcher_uid
// args[2]: filter
// args[3]: local_or_global
// args[4]: option
Handle<Value> createSearchPostingPack(const Arguments &args) {
	PackList pkg;
	pkg.add(TCPack(TYPE_FOUR_BYTE_INT, args[1]->ToInteger()));
	pkg.add(TCPack(TYPE_ONE_BYTE_INT, Integer::New(0)));
	pkg.add(TCPack(TYPE_ONE_BYTE_INT, args[2]->ToString()->Length() * 2));
	pkg.add(TCPack(TYPE_STRING, args[2]->ToString()));
	pkg.add(TCPack(TYPE_ONE_BYTE_INT, args[3]->ToInteger()));
	pkg.add(TCPack(TYPE_ONE_BYTE_INT, args[4]->ToInteger()));
	SetHeadAndReturn(0, 1, 2);
}

/**
 * - \b "2 0 Create user"
 * 		- createCreateUserPack(email, password, name, nick_name, birthday,\n
 * 				gender, city, state, country, visible_tags, hidden_tags)
 * 		- visible_tags, hidden_tags: Array of string
 * \see ::resolvCreatePack
 */

/*2 0 Create User: 1 email len, ? email, 1 password_len, ? password, 1 name len, ? name, 1 nickname len, ? nickname,
 *				   4 birthday, 1 gender,
 *				   1 city len, ? city, 1 state len, ? state, 1 country len, ? country,
 *				   1 # visible tags, <visible tags{1 len, ?tag}>,
 *				   1 # hidden tags, <hidden tags{1 len, ?tag}>*/
// args[0]: email
// args[1]: password
// args[2]: name
// args[3]: nick_name
// args[4]: birthday
// args[5]: gender
// args[6]: city
// args[7]: state
// args[8]: country
// args[9]: visible_tags
// args[10]: hidden_tags
Handle<Value> createCreateUserPack(const Arguments &args) {
	PackList pkg;
	pkg.add(TCPack(TYPE_ONE_BYTE_INT, args[0]->ToString()->Length() * 2));
	pkg.add(TCPack(TYPE_STRING, args[0]->ToString()));
	pkg.add(TCPack(TYPE_ONE_BYTE_INT, args[1]->ToString()->Length() * 2));
	pkg.add(TCPack(TYPE_STRING, args[1]->ToString()));
	pkg.add(TCPack(TYPE_ONE_BYTE_INT, args[2]->ToString()->Length() * 2));
	pkg.add(TCPack(TYPE_STRING, args[2]->ToString()));
	pkg.add(TCPack(TYPE_ONE_BYTE_INT, args[3]->ToString()->Length() * 2));
	pkg.add(TCPack(TYPE_STRING, args[3]->ToString()));
	pkg.add(TCPack(TYPE_FOUR_BYTE_INT, args[4]->ToInteger()));
	pkg.add(TCPack(TYPE_ONE_BYTE_INT, args[5]->ToInteger()));
	pkg.add(TCPack(TYPE_ONE_BYTE_INT, args[6]->ToString()->Length() * 2));
	pkg.add(TCPack(TYPE_STRING, args[6]->ToString()));
	pkg.add(TCPack(TYPE_ONE_BYTE_INT, args[7]->ToString()->Length() * 2));
	pkg.add(TCPack(TYPE_STRING, args[7]->ToString()));
	pkg.add(TCPack(TYPE_ONE_BYTE_INT, args[8]->ToString()->Length() * 2));
	pkg.add(TCPack(TYPE_STRING, args[8]->ToString()));
	pkg.add(TCPack(TYPE_TAGS, args[9]->ToObject()));
	pkg.add(TCPack(TYPE_TAGS, args[10]->ToObject()));
	SetHeadAndReturn(-1, 2, 0);
}

/**
 * - \b "2 1 Create event"
 * 		- createCreateEventPack(session_key, name, creater_uid, description, city, tags)
 * 		- tags: Array of string
 * \see ::resolvCreatePack
 */

/*2 1 Create Event: 1 name_len, ? name, 4 creater id, 1 description len, ? description, 1 city_len, ? city
 *					1 # tags, <tags{1 len, ?tag}>*/
// args[0]: session_key
// args[1]: name
// args[2]: creater_uid
// args[3]: description
// args[4]: city
// args[5]: tags
Handle<Value> createCreateEventPack(const Arguments &args) {
	PackList pkg;
	pkg.add(TCPack(TYPE_ONE_BYTE_INT, args[1]->ToString()->Length() * 2));
	pkg.add(TCPack(TYPE_STRING, args[1]->ToString()));
	pkg.add(TCPack(TYPE_FOUR_BYTE_INT, args[2]->ToString()));
	pkg.add(TCPack(TYPE_ONE_BYTE_INT, args[3]->ToString()->Length() * 2));
	pkg.add(TCPack(TYPE_STRING, args[3]->ToString()));
	pkg.add(TCPack(TYPE_ONE_BYTE_INT, args[4]->ToString()->Length() * 2));
	pkg.add(TCPack(TYPE_STRING, args[4]->ToString()));
	pkg.add(TCPack(TYPE_TAGS, args[5]->ToObject()));
	SetHeadAndReturn(0, 2, 1);
}

/**
 * - \b "2 2 Create posting
 * 		- createCreatePosting(session_key, creater_uid, eventid, content, visibility, tags)
 * 		- tags: Array of string
 * - \see ::resolvCreatePack
 */

/*2 2 Create Posting: 4 creater id, 8 event id, 2 content len, ? content
 *			1 visibility {0 for can be searched, 1 for cannot be searched}
 *			1 # tags, <tags{1 len, ?tag}>*/
// args[0]: session_key
// args[1]: creater_uid
// args[2]: eventid
// args[3]: content
// args[4]: visibility
// args[5]: tags
Handle<Value> createCreatePostingPack(const Arguments &args) {
	PackList pkg;
	pkg.add(TCPack(TYPE_FOUR_BYTE_INT, args[1]->ToInteger()));
	pkg.add(TCPack(TYPE_ASCII_STRING, args[2]->ToString()));
	pkg.add(TCPack(TYPE_TWO_BYTE_INT, args[3]->ToString()->Length() * 2));
	pkg.add(TCPack(TYPE_STRING, args[3]->ToString()));
	pkg.add(TCPack(TYPE_ONE_BYTE_INT, args[4]->ToInteger()));
	pkg.add(TCPack(TYPE_TAG, args[5]->ToObject()));
	SetHeadAndReturn(0, 2, 2);
}

/**
 * - \b "2 3 Create request
 * - for friend request
 * 		- createCreateRequestPack(0, session_key, requester_uid, user_receiver_uid, msg)
 * - for join event
 * 		- createCreateRequestPack(1, session_key, requester_uid, event_receiver_eid, msg)
 * - for invitation to event
 * 		- createCreateRequestPack(2, session_key, requester_uid, user_receiver_uid, event_receiver_eid, msg)
 * \see ::resolvCreatePack
 */

/*2 3 Create request: 4 requester, type (0 for friend request, 1 for join event. 2 for invitation to event)
 *		when (type = 0) 4 user receiver, 1 msg_len, ? msg
 *		when (type = 1) 8 event receiver, 1 msg_len, ? msg
 *		when (type = 2) 4 user receiver, 8 event receiver, 1 msg_len, ? msg*/
// args[0]: type
// args[1]: session_key
// args[2]: requester
Handle<Value> createCreateRequestPack(const Arguments &args) {
	PackList pkg;
	pkg.add(TCPack(TYPE_FOUR_BYTE_INT, args[2]->ToInteger()));
	pkg.add(TCPack(TYPE_ONE_BYTE_INT, args[0]->ToInteger()));
	switch (args[0]->Uint32Value()) {
	case 0:
		// args[3]: user_receiver_uid
		// args[4]: msg
		pkg.add(TCPack(TYPE_FOUR_BYTE_INT, args[3]->ToInteger()));
		pkg.add(TCPack(TYPE_ONE_BYTE_INT, args[4]->ToString()->Length()));
		pkg.add(TCPack(TYPE_STRING, args[4]->ToString()));
		break;
	case 1:
		// args[3]: event_receiver_eid
		// args[4]: msg
		pkg.add(TCPack(TYPE_ASCII_STRING, args[3]->ToString()));
		pkg.add(TCPack(TYPE_ONE_BYTE_INT, args[4]->ToString()->Length()));
		pkg.add(TCPack(TYPE_STRING, args[4]->ToString()));
		break;
	case 2:
		// args[3]: user_receiver_uid
		// args[4]: event_receiver_eid
		// args[5]: msg
		pkg.add(TCPack(TYPE_FOUR_BYTE_INT, args[3]->ToInteger()));
		pkg.add(TCPack(TYPE_ASCII_STRING, args[4]->ToString()));
		pkg.add(TCPack(TYPE_ONE_BYTE_INT, args[5]->ToString()->Length()));
		pkg.add(TCPack(TYPE_STRING, args[5]->ToString()));
		break;
	}
	SetHeadAndReturn(1, 2, 3);
}

/**
 * - \b "2 17 Create schedule"
 * 		- createCreateSchedulePack(session_key, creater_uid, eid, start_date, \n
 * 				start_time, end_date, end_time, place, description, members)
 * 		- member: Array of uid
 */

/*2 17 Create Schedule: 4 creater, 8 eid,
 *			4 start_date, 4 start_time, 4 end_date, 4 end_time,
 *			1 place_len, ? place, 1 description_len, ? description,
 *			4 #uids , <4 uid> {for now, #uids is always 0}.*/
// args[0]: session_key
// args[1]: creater_uid
// args[2]: eid
// args[3]: start_date
// args[4]: start_time
// args[5]: end_date
// args[6]: end_time
// args[7]: place
// args[8]: description
// args[9]: members
Handle<Value> createCreateSchedulePack(const Arguments &args) {
	PackList pkg;
	pkg.add(TCPack(TYPE_FOUR_BYTE_INT, args[1]->ToInteger()));
	pkg.add(TCPack(TYPE_ASCII_STRING, args[2]->ToString()));
	pkg.add(TCPack(TYPE_FOUR_BYTE_INT, args[3]->ToInteger()));
	pkg.add(TCPack(TYPE_FOUR_BYTE_INT, args[4]->ToInteger()));
	pkg.add(TCPack(TYPE_FOUR_BYTE_INT, args[5]->ToInteger()));
	pkg.add(TCPack(TYPE_FOUR_BYTE_INT, args[6]->ToInteger()));
	pkg.add(TCPack(TYPE_ONE_BYTE_INT, args[7]->ToString()->Length() * 2));
	pkg.add(TCPack(TYPE_STRING, args[7]->ToString()));
	pkg.add(TCPack(TYPE_ONE_BYTE_INT, args[8]->ToString()->Length() * 2));
	pkg.add(TCPack(TYPE_STRING, args[8]->ToString()));
	pkg.add(TCPack(TYPE_UIDS, args[9]->ToObject()));
	SetHeadAndReturn(0, 2, 17);
}

/**
 * - \b "3 0 Update user"
 * 		- createUpdateUserPack(session_key, uid, updates)
 * 		- updates: Array of Update_User_Pack
 * 		- Update_User_Pack:
 * 				- password: [0, password]
 * 				- name: [1, name]
 * 				- nickname: [2, nick_name]
 * 				- birthday: [3, birthday]
 * 				- gender: [4, gender]
 * 				- city:	[5, city]
 * 				- state: [6, state]
 * 				- country: [7, country]
 * 				- add tag: [8, tag]
 * 				- del tag: [9, tag]
 * 				- setting: [10, setting_No, setting_value]
 * - e.g.  change 12345's name to "abc" and city to "ggg"
 * 		- createUpdateUserPack(session_key, 12345, [[1, "abc"],[5, "ggg"]])
 * \see ::resolvUpdatePack
 */

/*3 0 Update User: 4 uid, 1 # updates, <Update_User_Pack>*/
// args[0]: session_key
// args[1]: uid
// args[2]: Array of Update_User_Pack
Handle<Value> createUpdateUserPack(const Arguments &args) {
	PackList pkg;
	pkg.add(TCPack(TYPE_FOUR_BYTE_INT, args[1]->ToInteger()));
	pkg.add(TCPack(TYPE_UPDATES, args[2]->ToObject()));
	SetHeadAndReturn(0, 3, 0);
}

/**
 * - \b "3 1 Update event"
 * 		- createUpdateEventPack(session_key, manager_uid, eventid, updates)
 *		- updates: Array of Update_Event_Pack
 * 		- Update_User_Pack:
 * 				- name: [1, name]
 * 				- city:	[5, city]
 * 				- add tag: [8, tag]
 * 				- del tag: [9, tag]
 * 				- setting: [10, setting_No, setting_value]
 * 				- add manager: [11, manager_uid]
 * 				- del manager: [12, manager_uid]
 * 				- del member: [13, member_uid]
 * - e.g.  change name of event 123456 of user 12345 to "abc" and add manger 12377
 * 		- createUpdateUserPack(session_key, 12345, "123456", [[1, "abc"],[11, 12377]])
 * \see ::resolvUpdatePack
 */

/*3 1 Update event: 4 manager, 8 event,1  # updates, <Update_Event_Pack>*/
// args[0]: session_key
// args[1]: manager_uid
// args[2]: eventid
// args[3]: updates
Handle<Value> createUpdateEventPack(const Arguments &args) {
	PackList pkg;
	pkg.add(TCPack(TYPE_FOUR_BYTE_INT, args[1]->ToInteger()));
	pkg.add(TCPack(TYPE_ASCII_STRING, args[2]->ToString()));
	pkg.add(TCPack(TYPE_UPDATES, args[3]->ToObject()));
	SetHeadAndReturn(0, 3, 1);
}

/**
 * - \b "3 2 Update posting"
 * \todo Update info
 */
/*3 2 Update Posting: 4 uid, 8 posting, <update info to be detailed>*/
// args[0]: session_key
// args[1]: uid
// args[2]: pid
// args[3]: Array of ?
Handle<Value> createUpdatePostingPack(const Arguments &args) {
	return Undefined();
}

/**
 * - \b "3 13 Update friend comments"
 * 		- createUpdateFriendCommentsPack(session_key, uid, friend_uid, comment)
 * \see ::resolvUpdatePack
 */
/*3 13 Update Friend Comments: 4 uid, 4 friend_uid, 1 comment_len, ? comment.*/
// args[0]: session_key
// args[1]: uid
// args[2]: friend_uid
// args[3]: comment
Handle<Value> createUpdateFriendCommentsPack(const Arguments &args) {
	PackList pkg;
	pkg.add(TCPack(TYPE_FOUR_BYTE_INT, args[1]->ToInteger()));
	pkg.add(TCPack(TYPE_FOUR_BYTE_INT, args[2]->ToInteger()));
	pkg.add(TCPack(TYPE_ONE_BYTE_INT, args[3]->ToString()->Length() * 2));
	pkg.add(TCPack(TYPE_STRING, args[3]->ToString()));
	SetHeadAndReturn(0, 3, 13);
}

/**
 * - \b "3 14 Update status"
 * 		- createUpdateStatusPack(session_key, uid, status)
 * 		- status:
 * 			- 0=offline
 * 			- 1=online
 * 			- 1=invisible
 * 			- 2=leave
 */

/*3 14 Update status: 4 uid, 1 status (0 for offline, 1 for online, 1 for invisible, 2 for leave)*/
// args[0]: session_key
// args[1]: uid
// args[2]: status
Handle<Value> createUpdateStatusPack(const Arguments &args) {
	PackList pkg;
	pkg.add(TCPack(TYPE_FOUR_BYTE_INT, args[1]->ToInteger()));
	pkg.add(TCPack(TYPE_ONE_BYTE_INT, args[2]->ToInteger()));
	SetHeadAndReturn(0, 3, 14);
}

/**
 * - \b "3 23 Update avarta big"
 * - for user
 * 		- creaetUpdateAvartaBig(0, uid, content)
 * - for event
 * 		- creaetUpdateAvartaBig(1, uid, eid, content)
 * \see ::resolvUpdatePack
 */

/*3 23: Update avarta big: 1 subtype2 {0 for user, 1 for event},
 *				when (subtype2==0): 4 uid, 4 #bytes (<=50K), ? content
 *				when (subtype2==1): 4 uid, 8 eid, 4 #bytes (<=50K), ? content*/
// args[0]: type
// args[1]: session_key
Handle<Value> createUpdateAvartaBig(const Arguments &args) {
	PackList pkg;
	pkg.add(TCPack(TYPE_ONE_BYTE_INT, args[0]->ToInteger()));
	switch (args[0]->Uint32Value()) {
	case 0:
		// args[2]: uid
		// args[3]: content
		pkg.add(TCPack(TYPE_FOUR_BYTE_INT, args[2]->ToInteger()));
		pkg.add(TCPack(TYPE_FOUR_BYTE_INT, args[3]->ToString()->Length()));
		pkg.add(TCPack(TYPE_ASCII_STRING, args[3]->ToString()));
		break;
	case 1:
		// args[2]: uid
		// args[3]: eventid
		// args[4]: content
		pkg.add(TCPack(TYPE_FOUR_BYTE_INT, args[2]->ToInteger()));
		pkg.add(TCPack(TYPE_ASCII_STRING, args[3]->ToString()));
		pkg.add(TCPack(TYPE_FOUR_BYTE_INT, args[4]->ToString()->Length()));
		pkg.add(TCPack(TYPE_ASCII_STRING, args[4]->ToString()));
		break;
	}
	SetHeadAndReturn(1, 3, 23);
}

/**
 * - \b "3 24 Update avarta small"
 * - for user
 * 		- creaetUpdateAvartaSmall(0, uid, content)
 * - for event
 * 		- createUpdateAvartaSmall(1, uid, eid, content)
 * \see ::resolvUpdatePack
 */

/*3 24: Update avarta small: 1 subtype2 {0 for user, 1 for event},
 *				when (subtype2==0): 4 uid, 4 #bytes (<=1K), ? content
 *				when (subtype2==1): 4 uid, 8 eid, 4 #bytes (<=1K), ? content*/
// args[0]: type
// args[1]: session_key
Handle<Value> createUpdateAvartaSmall(const Arguments &args) {
	PackList pkg;
	pkg.add(TCPack(TYPE_ONE_BYTE_INT, args[0]->ToInteger()));
	switch (args[0]->Uint32Value()) {
	case 0:
		// args[2]: uid
		// args[3]: content
		pkg.add(TCPack(TYPE_FOUR_BYTE_INT, args[2]->ToInteger()));
		pkg.add(TCPack(TYPE_FOUR_BYTE_INT, args[3]->ToString()->Length()));
		pkg.add(TCPack(TYPE_ASCII_STRING, args[3]->ToString()));
		break;
	case 1:
		// args[2]: uid
		// args[3]: eventid
		// args[4]: content
		pkg.add(TCPack(TYPE_FOUR_BYTE_INT, args[2]->ToInteger()));
		pkg.add(TCPack(TYPE_ASCII_STRING, args[3]->ToString()));
		pkg.add(TCPack(TYPE_FOUR_BYTE_INT, args[4]->ToString()->Length()));
		pkg.add(TCPack(TYPE_ASCII_STRING, args[4]->ToString()));
		break;
	}
	SetHeadAndReturn(1, 3, 24);
}

/**
 * - \b "4 2 Reply posting"
 * 		- createReplyPostingPack(session_key, replier_uid, poster_uid, reply_to_uid, \n
 * 					eid, pid, replyer_name, reply_to_name, content, visibility)
 * \see ::resolvReplyPack
 */
/*4 2 Reply Posting: 4 replier uid, 4 poster_uid, 4 reply_to_uid, 8 eid, 8 pid,
 * 				1 replyer_name_len, ?replyer_name, 1 reply_to_name_len,
 * 				? reply_to_name, 1 content len, ? content, 1 visibility*/
// args[0]: session_key
// args[1]: replier_uid
// args[2]: poster_uid
// args[3]: reply_to_uid
// args[4]: eid
// args[5]: pid
// args[6]: replyer_name
// args[7]: reply_to_name
// args[8]: content
// args[9]: visibility
Handle<Value> createReplyPostingPack(const Arguments &args) {
	PackList pkg;
	pkg.add(TCPack(TYPE_FOUR_BYTE_INT, args[1]->ToInteger()));
	pkg.add(TCPack(TYPE_FOUR_BYTE_INT, args[2]->ToInteger()));
	pkg.add(TCPack(TYPE_FOUR_BYTE_INT, args[3]->ToInteger()));
	pkg.add(TCPack(TYPE_ASCII_STRING, args[4]->ToString()));
	pkg.add(TCPack(TYPE_ASCII_STRING, args[5]->ToString()));
	pkg.add(TCPack(TYPE_ONE_BYTE_INT, args[6]->ToString()->Length() * 2));
	pkg.add(TCPack(TYPE_STRING, args[6]->ToString()));
	pkg.add(TCPack(TYPE_ONE_BYTE_INT, args[7]->ToString()->Length() * 2));
	pkg.add(TCPack(TYPE_STRING, args[7]->ToString()));
	pkg.add(TCPack(TYPE_ONE_BYTE_INT, args[8]->ToString()->Length() * 2));
	pkg.add(TCPack(TYPE_STRING, args[8]->ToString()));
	pkg.add(TCPack(TYPE_ONE_BYTE_INT, args[9]->ToInteger()));
	SetHeadAndReturn(0, 4, 2);
}

/**
 * - \b "5 0 Delete friend"
 * 		- createDeleteFriendPack(session_key, uid, friend_uid)
 * \see ::resolvDeletePack
 */

/*5 0: delete friend: 4 uid, 4 friend_uid*/
// args[0]: session_key
// args[1]: uid
// args[2]: friend_uid
Handle<Value> createDeleteFriendPack(const Arguments &args) {
	PackList pkg;
	pkg.add(TCPack(TYPE_FOUR_BYTE_INT, args[1]->ToInteger()));
	pkg.add(TCPack(TYPE_FOUR_BYTE_INT, args[2]->ToInteger()));
	SetHeadAndReturn(0, 5, 0);
}

/**
 * - \b "5 2 Delete posting"
 * 		- createDeletePostingPack(session_key, your_uid, uid, eid, pid)
 * \see ::resolvDeletePack
 */

/*5 2: delete posting:4 your_uid, 4 uid, 8 eid, 8 pid*/
// args[0]: session_key
// args[1]: your_uid
// args[2]: uid
// args[3]: eid
// args[4]: pid
Handle<Value> createDeletePostingPack(const Arguments &args) {
	PackList pkg;
	pkg.add(TCPack(TYPE_FOUR_BYTE_INT, args[1]->ToInteger()));
	pkg.add(TCPack(TYPE_FOUR_BYTE_INT, args[2]->ToInteger()));
	pkg.add(TCPack(TYPE_ASCII_STRING, args[3]->ToString()));
	pkg.add(TCPack(TYPE_ASCII_STRING, args[4]->ToString()));
	SetHeadAndReturn(0, 5, 2);
}

/**
 * - \b "5 17 Delete schedule"
 * 		- createDeleteSchedulePack(session_key, your_uid, uid, eid, sid)
 * \see ::resolvDeletePack
 */

/*5 17: delete schedule: 4 your_uid, 4 uid, 8 eid, 4 sid*/
// args[0]: session_key
// args[1]: your_uid
// args[2]: uid
// args[3]: eid
// args[4]: sid
Handle<Value> createDeleteSchedulePack(const Arguments &args) {
	PackList pkg;
	pkg.add(TCPack(TYPE_FOUR_BYTE_INT, args[1]->ToInteger()));
	pkg.add(TCPack(TYPE_FOUR_BYTE_INT, args[2]->ToInteger()));
	pkg.add(TCPack(TYPE_ASCII_STRING, args[3]->ToString()));
	pkg.add(TCPack(TYPE_FOUR_BYTE_INT, args[4]->ToInteger()));
	SetHeadAndReturn(0, 5, 17);
}

/**
 * - \b "5 22 Delete reply"
 * 		- createDeleteReplyPack(session_key, your_uid, uid, eid, pid, rid)
 * \see ::resolvDeletePack
 */

/*5 22: delete reply: 4 your_uid, 4 uid, 8 eid, 8 pid, 4 rid*/
// args[0]: session_key
// args[1]: your_uid
// args[2]: uid
// args[3]: eid
// args[4]: pid
// args[5]: rid
Handle<Value> createDeleteReplyPack(const Arguments &args) {
	PackList pkg;
	pkg.add(TCPack(TYPE_FOUR_BYTE_INT, args[1]->ToInteger()));
	pkg.add(TCPack(TYPE_FOUR_BYTE_INT, args[2]->ToInteger()));
	pkg.add(TCPack(TYPE_ASCII_STRING, args[3]->ToString()));
	pkg.add(TCPack(TYPE_ASCII_STRING, args[4]->ToString()));
	pkg.add(TCPack(TYPE_FOUR_BYTE_INT, args[5]->ToInteger()));
	SetHeadAndReturn(0, 5, 22);
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
	SetHeadAndReturn(-1, 6, 0);
}

/**
 * - \b "6 16 Logout"
 * 		- createLogoutPack(session_key, uid)
 * \see ::resolvValidationPack
 */

/*6 16: user logout: 4 uid*/
// args[0]: session_key
// args[1]: uid
Handle<Value> createLogoutPack(const Arguments &args) {
	PackList pkg;
	pkg.add(TCPack(TYPE_FOUR_BYTE_INT, args[1]->ToInteger()));
	SetHeadAndReturn(0, 6, 16);
}

/**
 * - \b "6 20 Email validation"
 * 		- createEmailValidationPack(email)
 * \see ::resolvValidationPack
 */

/*6 20: email validation: 1 email_len, ? email*/
// args[0]: email
Handle<Value> createEmailValidationPack(const Arguments &args) {
	PackList pkg;
	pkg.add(TCPack(TYPE_ONE_BYTE_INT, args[0]->ToString()->Length() * 2));
	pkg.add(TCPack(TYPE_STRING, args[0]->ToString()));
	SetHeadAndReturn(-1, 6, 20);
}

/**
 * - \b "6 21 Identification code validation"
 * 		- createIdentificationCodeValidation(email, code_1, code_2)
 * \see ::resolvValidationPack
 */

/*6 21: identification_code validation: 1 email_len, ? email, 4 code_1, 1 code_2_len, ? code_2.*/
// args[0]: email
// args[1]: code_1
// args[2]: code_2
Handle<Value> createIdentificationCodeValidationPack(const Arguments &args) {
	PackList pkg;
	pkg.add(TCPack(TYPE_ONE_BYTE_INT, args[0]->ToString()->Length() * 2));
	pkg.add(TCPack(TYPE_STRING, args[0]->ToString()));
	pkg.add(TCPack(TYPE_FOUR_BYTE_INT, args[1]->ToInteger()));
	pkg.add(TCPack(TYPE_ONE_BYTE_INT, args[2]->ToString()->Length() * 2));
	pkg.add(TCPack(TYPE_STRING, args[2]->ToString()));
	SetHeadAndReturn(-1, 6, 21);
}

/**
 * - \b "7 1 Quit event"
 * 		- createQuitEventPack(session_key, uid, eventid)
 * \see ::resolvQuitPack
 */

/*7 1: quit event: 4 uid, 8 event_id*/
// args[0]: session_key
// args[1]: uid
// args[2]: eventid
Handle<Value> createQuitEventPack(const Arguments &args) {
	PackList pkg;
	pkg.add(TCPack(TYPE_FOUR_BYTE_INT, args[1]->ToInteger()));
	pkg.add(TCPack(TYPE_ASCII_STRING, args[2]->ToString()));
	SetHeadAndReturn(0, 7, 1);
}

/**
 * - \b "12 0 Send message to user"
 * 		- createMessageToUserPack(session_key, your_uid, seqNo, other_uid, content)
 * \see ::resolvMessagePack
 */

/*12 0 message to user: 4 your_uid, 4 seqNo, 4 other-uid, 2 content_len, ? content.*/
// args[0]: session_key
// args[1]: your_uid
// args[2]: seqNo
// args[3]: other_uid
// args[4]: content
Handle<Value> createMessageToUserPack(const Arguments &args) {
	PackList pkg;
	pkg.add(TCPack(TYPE_FOUR_BYTE_INT, args[1]->ToInteger()));
	pkg.add(TCPack(TYPE_FOUR_BYTE_INT, args[2]->ToInteger()));
	pkg.add(TCPack(TYPE_FOUR_BYTE_INT, args[3]->ToInteger()));
	pkg.add(TCPack(TYPE_TWO_BYTE_INT, args[4]->ToString()->Length() * 2));
	pkg.add(TCPack(TYPE_STRING, args[4]->ToString()));
	SetHeadAndReturn(0, 12, 0);
}

/*12 1 message to event: 4 your_uid, 4 seqNo, 8 event-eid, 2 conent_en, ? content*/
// args[0]: session_key
// args[1]: your_uid
// args[2]: seqNo
// args[3]: eventid
// args[4]: content
Handle<Value> createMessageToEventPack(const Arguments &args) {
	PackList pkg;
	pkg.add(TCPack(TYPE_FOUR_BYTE_INT, args[1]->ToInteger()));
	pkg.add(TCPack(TYPE_FOUR_BYTE_INT, args[2]->ToInteger()));
	pkg.add(TCPack(TYPE_ASCII_STRING, args[3]->ToString()));
	pkg.add(TCPack(TYPE_TWO_BYTE_INT, args[4]->ToString()->Length() * 2));
	pkg.add(TCPack(TYPE_STRING, args[4]->ToString()));
	SetHeadAndReturn(0, 12, 1);
}
