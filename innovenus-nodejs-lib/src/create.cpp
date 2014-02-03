/**
 * \file create.cpp
 */

#include <v8.h>
#include <node.h>
#include <cstdio>
#include <string>
#include "common.h"
#include <fstream>

#define TYPE_CHECK

#define HEADER_LENGTH			18

#define SPECIAL_MASK			0x000F
#define INT_MASK				0x0100
#define STRING_MASK				0x0200
#define ASCIISTRING_MASK		0x0400
#define ARRAY_MASK				0x0800
#define FILE_MASK				0x1000

#define TYPE_ONE_BYTE_INT  		(INT_MASK | 0x1)
#define TYPE_TWO_BYTE_INT  		(INT_MASK | 0x2)
#define TYPE_FOUR_BYTE_INT  	(INT_MASK | 0x4)
#define TYPE_EIGHT_BYTE_INT  	(INT_MASK | 0x8)

#define TYPE_STRING			(STRING_MASK)
#define TYPE_ASCII_STRING		(ASCIISTRING_MASK)

#define TYPE_UIDS  				(ARRAY_MASK | 0x1)
#define TYPE_UPDATES  			(ARRAY_MASK | 0x2)
#define TYPE_TAGS				(ARRAY_MASK | 0x3)
#define TYPE_PICTURES			(ARRAY_MASK | 0x4)

#define TYPE_FILE				(FILE_MASK)

#define ONE_BYTE_FOR_LENGTH		1
#define TWO_BYTE_FOR_LENGTH		2
#define FOUR_BYTE_FOR_LENGTH	4

static const std::string eundef(" is undefined");
static const std::string enull(" is null");
static const std::string enotint(" isn't integer");
static const std::string enotstr(" isn't string");
static const std::string enotarr(" isn't array");
static const std::string elength("'s length error");
static const std::string eelem("element of ");

#define SetHeadAndReturn(_session_key_index, _type, _subtype) {std::string tmp(""); \
	tmp += convert_int_to_hex_string(code.length() / 2 + HEADER_LENGTH, 4); \
	if (_session_key_index != -1) { \
		if (args[_session_key_index]->IsUndefined()) \
			throw myerr(("session_key" + eundef).data()); \
		if (args[_session_key_index]->IsNull()) \
			throw myerr(("session_key" + enull).data()); \
		if (!(args[_session_key_index]->IsString())) \
			throw myerr(("session_key" + enotstr).data()); \
		tmp += convert_ascii_string_to_hex_string(args[_session_key_index]->ToString()); \
	} else \
		tmp += convert_ascii_string_to_hex_string(String::New(DUMB_SESSION_KEY)); \
	tmp += convert_int_to_hex_string(1, 1); \
	tmp += convert_int_to_hex_string(0, 3); \
	tmp += convert_int_to_hex_string(_type, 1); \
	tmp += convert_int_to_hex_string(_subtype, 1); \
	code = tmp + code; \
	encode(code, code.length() >> 1); \
	HandleScope scope; \
	return scope.Close(String::New(code.data())); \
	}

#define BEGIN try{
#define END } catch (myerr &e){ \
		return ThrowException(Exception::Error(String::New(e.what()))); \
	} \
	return Undefined();

class myerr {
private:
	const char * _what;
public:
	myerr(const char* what) :
			_what(what) {
	}
	const char *what() const {
		return _what;
	}
};
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
	unsigned int length = src->Length();
	char *tmp = new char[length + 1];
	src->WriteAscii(tmp);
#ifdef TYPE_CHECK
	for (unsigned int i = 0; i < length; i++) {
		if (!(((tmp[i] <= '9') && (tmp[i] >= '0'))
				|| ((tmp[i] <= 'F') && (tmp[i] >= 'A'))
				|| ((tmp[i] <= 'f') && (tmp[i] >= 'a')))) {
			throw myerr("Wrong ascii string");
		}
		if ((tmp[i] >= 'A') && (tmp[i] <= 'F'))
			tmp[i] = tmp[i] - 'A' + 'a';
	}
#endif
	tmp[length] = '\0';
	std::string ans(tmp);
	delete[] tmp;
	return ans;
}
static inline void Add(std::string& code, const int type,
		const Local<Value>& value, const char* name);
static inline void Add(std::string& code, const int type,
		const Local<Value>& value, std::string name) {
	Add(code, type, value, name.c_str());
}
static inline void Add(std::string& code, const int type,
		const Local<Value>& value, const char* name) {
	if (type & ARRAY_MASK) {
#ifdef TYPE_CHECK
		if (value->IsUndefined())
			throw myerr((name + eundef).data());
		if (value->IsNull())
			throw myerr((name + enull).data());
		if (!(value->IsArray()))
			throw myerr((name + enotarr).data());
#endif
		Local<Object> tmp = value->ToObject();
		Local<Value> cur;
		Local<String> cur2;
		Local<Object> cur3;
		std::string tmpstr("");
		unsigned int i;
		int type2;
		switch (type) {
		case TYPE_TAGS:
			cur = tmp->Get(i = 0);
			while (!cur->IsUndefined()) {
#ifdef TYPE_CHECK
				Add(tmpstr, TYPE_STRING | ONE_BYTE_FOR_LENGTH, cur, eelem + name);
#else
				Add(tmpstr, TYPE_STRING | ONE_BYTE_FOR_LENGTH, cur, "");
#endif
				cur = tmp->Get(++i);
			}
			Add(code, TYPE_ONE_BYTE_INT, Integer::New(i), "");
			code += tmpstr;
			break;
		case TYPE_UPDATES:
			cur = tmp->Get(i = 0);
			while (!cur->IsUndefined()) {
#ifdef TYPE_CHECK
				if (value->IsNull())
					throw myerr((eelem + name + enull).data());
				if (!(cur->IsArray()))
					throw myerr((eelem + name + enotarr).data());
#endif
				cur3 = cur->ToObject();
#ifdef TYPE_CHECK
				if (cur3->Get(0)->IsNull())
					throw myerr((eelem + eelem + name + enull).data());
				if (!(cur3->Get(0)->IsInt32()))
					throw myerr((eelem + eelem + name + enotint).data());
#endif
				type2 = cur3->Get(0)->Uint32Value();
				Add(tmpstr, TYPE_ONE_BYTE_INT, Integer::New(type2), "");
				switch (type2) {
				case 0: //password
					Add(tmpstr, TYPE_STRING | ONE_BYTE_FOR_LENGTH, cur3->Get(1),
							"old_password");
					Add(tmpstr, TYPE_STRING | ONE_BYTE_FOR_LENGTH, cur3->Get(2),
							"new_password");
					break;
				case 1: //name
				case 2: //nickname
				case 5: //city
				case 6: //state
				case 7: //country
				case 8: //add tag
				case 9: //del tag
#ifdef TYPE_CHECK
					Add(tmpstr, TYPE_STRING | ONE_BYTE_FOR_LENGTH, cur3->Get(1),
							eelem + eelem + name);
#else
					Add(tmpstr, TYPE_STRING | ONE_BYTE_FOR_LENGTH, cur3->Get(1), eelem + eelem + name);
#endif
					break;
				case 3: //birthday
				case 11: //add manager
				case 12: //del manager
				case 13: //del member
#ifdef TYPE_CHECK
					Add(tmpstr, TYPE_FOUR_BYTE_INT, cur3->Get(1),
							eelem + eelem + name);
#else
					Add(tmpstr, TYPE_FOUR_BYTE_INT, cur3->Get(1), "");
#endif
					break;
				case 4: //gender
#ifdef TYPE_CHECK
					Add(tmpstr, TYPE_ONE_BYTE_INT, cur3->Get(1),
							eelem + eelem + name);
#else
					Add(tmpstr, TYPE_ONE_BYTE_INT, cur3->Get(1), "");
#endif
					break;
				case 10: //setting
#ifdef TYPE_CHECK
					Add(tmpstr, TYPE_ONE_BYTE_INT, cur3->Get(1),
							eelem + eelem + name);
					Add(tmpstr, TYPE_ONE_BYTE_INT, cur3->Get(2),
							eelem + eelem + name);
#else
					Add(tmpstr, TYPE_ONE_BYTE_INT, cur3->Get(1), "");
					Add(tmpstr, TYPE_ONE_BYTE_INT, cur3->Get(2), "");
#endif
				}
				cur = tmp->Get(++i);
			}
			Add(code, TYPE_ONE_BYTE_INT, Integer::New(i), "");
			code += tmpstr;
			break;
		case TYPE_UIDS:
			cur = tmp->Get(i = 0);
			while (!cur->IsUndefined()) {
#ifdef TYPE_CHECK
				Add(tmpstr, TYPE_FOUR_BYTE_INT, cur3->Get(1),
						eelem + eelem + name);
#else
				Add(tmpstr, TYPE_FOUR_BYTE_INT, cur3->Get(1), "");
#endif
				cur = tmp->Get(++i);
			}
			Add(code, TYPE_FOUR_BYTE_INT, Integer::New(i), "");
			code += tmpstr;
			break;
		case TYPE_PICTURES:
			cur = tmp->Get(i = 0);
			while (!cur->IsUndefined()) {
				Add(tmpstr, TYPE_FILE, cur, "picture");
				cur = tmp->Get(++i);
			}
			Add(code, TYPE_ONE_BYTE_INT, Integer::New(i), "");
			code += tmpstr;
			break;
		}
	} else if (type & INT_MASK) {
#ifdef TYPE_CHECK
		if (value->IsUndefined())
			throw myerr((name + eundef).data());
		if (value->IsNull())
			throw myerr((name + enull).data());
		if (!(value->IsInt32()))
			throw myerr((name + enotint).data());
#endif
		code += convert_int_to_hex_string(value->IntegerValue(),
				type & SPECIAL_MASK);
	} else if (type & STRING_MASK) {
#ifdef TYPE_CHECK
		if (value->IsUndefined())
			throw myerr((name + eundef).data());
		if (value->IsNull())
			throw myerr((name + enull).data());
		if (!(value->IsString()))
			throw myerr((name + enotstr).data());
#endif
		if ((type & 0xF) == 0)
			throw myerr("Wrong strlen_length");
		code += convert_int_to_hex_string(value->ToString()->Length() * 2,
				type & SPECIAL_MASK);
		code += convert_string_to_hex_string(value->ToString());
	} else if (type & ASCIISTRING_MASK) {
#ifdef TYPE_CHECK
		if (value->IsUndefined())
			throw myerr((name + eundef).data());
		if (value->IsNull())
			throw myerr((name + enull).data());
		if (!(value->IsString()))
			throw myerr((name + enotstr).data());
		if (((type & SPECIAL_MASK) != 0)
				&& ((value->ToString()->Length()) != ((type & SPECIAL_MASK) * 2)))
			throw myerr((name + elength).data());
#endif
		code += convert_ascii_string_to_hex_string(value->ToString());
	} else if (type & FILE_MASK) {
#ifdef TYPE_CHECK
		if (value->IsUndefined())
			throw myerr((name + eundef).data());
		if (value->IsNull())
			throw myerr((name + enull).data());
		if (!(value->IsString()))
			throw myerr((name + enotstr).data());
#endif
		char *filename = new char[value->ToString()->Length() + 1 + 7];
		sprintf(filename, "public/");
		value->ToString()->WriteAscii(filename + 7);
		filename[value->ToString()->Length() + 7] = '\0';
		std::ifstream ifs(filename, std::ios_base::in | std::ios_base::binary);
		delete[] filename;
		if (!ifs.good())
			throw myerr("Can't open file");
		ifs.seekg(0, std::ios_base::end);
		uint32_t size = ifs.tellg();
		unsigned char *buf = new unsigned char[size];
		ifs.seekg(0, std::ios_base::beg);
		ifs.read((char*) buf, size);
		ifs.close();
		code += convert_int_to_hex_string(size, type & SPECIAL_MASK);
		unsigned char *end = buf + size;
		for (unsigned char *p = buf; p != end; p++) {
			code += formHexBit(*p >> 4);
			code += formHexBit((*p) & 0xF);
		}
		delete[] buf;
	}
}
//static inline void Prepend(std::string& code, const int type,
//		Local<Value>& value, const std::string& name) {
//	if (type & ARRAY_MASK) {
//#ifdef TYPE_CHECK
//		if (value->IsUndefined())
//			throw myerr((name + eundef).data();
//		if (value->IsNull())
//			throw myerr((name + enull).data();
//		if (!(value->IsArray()))
//			throw myerr((name + enotarr).data();
//#endif
//		Local<Object> tmp = value->ToObject();
//		Local<Value> cur;
//		Local<String> cur2;
//		Local<Object> cur3;
//		std::string tmpstr("");
//		unsigned int i;
//		int type2;
//		switch (type) {
//		case TYPE_TAGS:
//			cur = tmp->Get(i = 0);
//			while (!cur->IsUndefined()) {
//#ifdef TYPE_CHECK
//				if (!(cur->IsString()))
//					throw myerr((eelem + name + enotstr).data();
//#endif
//				cur2 = cur->ToString();
//				tmpstr += convert_int_to_hex_string(cur2->Length() * 2, 1);
//				tmpstr += convert_string_to_hex_string(cur2);
//				cur = tmp->Get(i++);
//			}
//			code += convert_int_to_hex_string(i, 1) + tmpstr;
//			break;
//		case TYPE_UPDATES:
//			cur = tmp->Get(i = 0);
//			while (!cur->IsUndefined()) {
//#ifdef TYPE_CHECK
//				if (!(cur->IsArray()))
//					throw myerr((eelem + name + enotarr).data();
//#endif
//				cur3 = cur->ToObject();
//				type2 = cur3->Get(0)->Uint32Value();
//				tmpstr += convert_int_to_hex_string(type2, 1);
//				switch (type2) {
//				case 0: //password
//				case 1: //name
//				case 2: //nickname
//				case 5: //city
//				case 6: //state
//				case 7: //country
//				case 8: //add tag
//				case 9: //del tag
//					tmpstr += convert_int_to_hex_string(
//							cur3->Get(1)->ToString()->Length() * 2, 1);
//					tmpstr += convert_string_to_hex_string(
//							cur3->Get(1)->ToString();
//					break;
//				case 3: //birthday
//				case 11: //add manager
//				case 12: //del manager
//				case 13: //del member
//					tmpstr += convert_int_to_hex_string(
//							cur3->Get(1)->IntegerValue(), 4);
//					break;
//				case 4: //gender
//					tmpstr += convert_int_to_hex_string(
//							cur3->Get(1)->IntegerValue(), 1);
//					break;
//				case 10: //setting
//					tmpstr += convert_int_to_hex_string(
//							cur3->Get(1)->IntegerValue(), 1);
//					tmpstr += convert_int_to_hex_string(
//							cur3->Get(2)->IntegerValue(), 1);
//					break;
//				}
//				cur = tmp->Get(i++);
//			}
//			code = convert_int_to_hex_string(i, 1) + tmpstr + code;
//			break;
//		case TYPE_UIDS:
//			cur = tmp->Get(i = 0);
//			while (!cur->IsUndefined()) {
//#ifdef TYPE_CHECK
//				if (!(cur->IsString()))
//					throw myerr((eelem + name + enotstr).data();
//#endif
//				tmpstr += convert_int_to_hex_string(cur->IntegerValue(), 4);
//				cur = tmp->Get(i++);
//			}
//			code = convert_int_to_hex_string(i, 4) + tmpstr + code;
//			break;
//		}
//	} else if (type & INT_MASK) {
//#ifdef TYPE_CHECK
//		if (value->IsUndefined())
//			throw myerr((name + eundef).data();
//		if (value->IsNull())
//			throw myerr((name + enull).data();
//		if (!(value->IsInt32()))
//			throw myerr((name + enotint).data();
//#endif
//		switch (type) {
//		case TYPE_ONE_BYTE_INT:
//			code = convert_int_to_hex_string(value->IntegerValue(), 1) + code;
//			break;
//		case TYPE_TWO_BYTE_INT:
//			code = convert_int_to_hex_string(value->IntegerValue(), 2) + code;
//			break;
//		case TYPE_FOUR_BYTE_INT:
//			code = convert_int_to_hex_string(value->IntegerValue(), 4) + code;
//			break;
//		case TYPE_EIGHT_BYTE_INT:
//			code = convert_int_to_hex_string(value->IntegerValue(), 8) + code;
//			break;
//		}
//	} else if (type & STRING_MASK) {
//#ifdef TYPE_CHECK
//		if (value->IsUndefined())
//			throw myerr((name + eundef).data();
//		if (value->IsNull())
//			throw myerr((name + enull).data();
//		if (!(value->IsString()))
//			throw myerr((name + enotstr).data();
//#endif
//		switch (type) {
//		case TYPE_STRING:
//			code = convert_string_to_hex_string(value->ToString()) + code;
//			break;
//		case TYPE_ASCII_STRING:
//			code = convert_ascii_string_to_hex_string(value->ToString()) + code;
//			break;
//		}
//	}
//}

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
	std::string code("");
	BEGIN
		Add(code, TYPE_FOUR_BYTE_INT, args[2], "viewer_uid");
		Add(code, TYPE_FOUR_BYTE_INT, args[3], "viewee_uid");
		Add(code, TYPE_ONE_BYTE_INT, args[0], "subtype");
		switch (args[0]->Uint32Value()) {
		case 0:
		case 1:
		case 4:
		case 18:
			break;
		case 2:
			// args[4]: postid
			Add(code, TYPE_ASCII_STRING | POSTID_LENGTH, args[4], "max_pid");
			break;
		case 23:
		case 24:
			// args[4]: local_version_date
			// args[5]: local_version_time
			Add(code, TYPE_FOUR_BYTE_INT, args[4], "local_version_date");
			Add(code, TYPE_FOUR_BYTE_INT, args[5], "local_version_time");
			break;
		}
		SetHeadAndReturn(1, 0, 0);END
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
	std::string code("");
	BEGIN
		Add(code, TYPE_FOUR_BYTE_INT, args[2], "viewer_uid");
		Add(code, TYPE_ASCII_STRING | EVENTID_LENGTH, args[3], "eventid");
		Add(code, TYPE_ONE_BYTE_INT, args[0], "subtype");
		switch (args[0]->Uint32Value()) {
		case 0:
		case 4:
		case 5:
		case 17:
		case 18:
			break;
		case 2:
			// args[4]: pid
			Add(code, TYPE_ASCII_STRING | POSTID_LENGTH, args[4], "max_pid");
			break;
		case 23:
		case 24:
			// args[4]: local_version_date
			// args[5]: local_version_time
			Add(code, TYPE_FOUR_BYTE_INT, args[4], "local_version_date");
			Add(code, TYPE_FOUR_BYTE_INT, args[5], "local_version_time");
			break;
		}
		SetHeadAndReturn(1, 0, 1);END
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
	std::string code("");
	BEGIN
		Add(code, TYPE_FOUR_BYTE_INT, args[1], "viewer_uid");
		Add(code, TYPE_FOUR_BYTE_INT, args[2], "posting_uid");
		Add(code, TYPE_ASCII_STRING | EVENTID_LENGTH, args[3], "posting_eid");
		Add(code, TYPE_ASCII_STRING | POSTID_LENGTH, args[4], "posting_pid");
		SetHeadAndReturn(0, 0, 2);END
}

/**
 * - \b "0 10 View mass postings"
 * - for view user's postings
 * 		- createMassViewPack(0, friends_or_citimates, session_key, viewer_uid, max_pid)
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
 *				when (subtype2=1): 1 subtype3 {always 0}
 *		8 max_pid;*/
// args[0]: subtype2
// args[1]: subtype3
// args[2]: session_key
// args[3]: viewer_uid
// args[4]: max_pid
Handle<Value> createMassViewPack(const Arguments &args) {
	std::string code("");
	BEGIN
		Add(code, TYPE_FOUR_BYTE_INT, args[3], "viewer_uid");
		Add(code, TYPE_ONE_BYTE_INT, args[0], "subtype2");
		Add(code, TYPE_ONE_BYTE_INT, args[1], "subtype3");
		Add(code, TYPE_ASCII_STRING | POSTID_LENGTH, args[4], "max_pid");
		SetHeadAndReturn(2, 0, 10);END
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
	std::string code;
	BEGIN
		Add(code, TYPE_FOUR_BYTE_INT, args[2], "current_uid");
		Add(code, TYPE_ONE_BYTE_INT, args[0], "mode");
		switch (args[0]->Uint32Value()) {
		case 0:
		case 1:
		case 4:
		case 6:
			break;
		case 2: // args[3]: pid
			Add(code, TYPE_ASCII_STRING | POSTID_LENGTH, args[3], "pid");
			break;
		case 17:
		case 18: // args[3]: option
			Add(code, TYPE_ONE_BYTE_INT, args[3], "option");
			break;
		case 23:
		case 24:
			// args[3]: local_version_date
			// args[4]: local_version_time
			Add(code, TYPE_FOUR_BYTE_INT, args[3], "local_version_date");
			Add(code, TYPE_FOUR_BYTE_INT, args[4], "local_version_time");
			break;
		}
		SetHeadAndReturn(1, 0, 11);END
}

/**
 * - \b "0 30 View pubpage"
 * - for view pubpage's info
 * 		- createViewPubpagePack(4, session_key, viewer_uid, pubpage_id)
 * - for view pubpage's big avarta
 * 		- createViewPubpagePack(23, session_key, viewer_uid, pubpage_id, local_version_date, local_version_time)
 * - for view pubpage's small avarta
 * 		- createViewPubpagePack(24, session_key, viewer_uid, pubpage_id, local_version_date, local_version_time)
 */
// args[0]: mode
// args[1]: session_key
// args[2]: viewer_uid
Handle<Value> createViewPubpagePack(const Arguments& args) {
	std::string code;
	BEGIN
		Add(code, TYPE_FOUR_BYTE_INT, args[2], "viewer_uid");
		Add(code, TYPE_ONE_BYTE_INT, args[0], "mode");
		switch (args[0]->Uint32Value()) {
		case 4:
			break;
		case 23:
		case 24:
			// args[3]: local_version_date
			// args[4]: local_version_time
			Add(code, TYPE_FOUR_BYTE_INT, args[3], "local_version_date");
			Add(code, TYPE_FOUR_BYTE_INT, args[4], "local_version_time");
			break;
		}
		SetHeadAndReturn(1, 0, 30);END
}

/**
 * - \b "0 31 View advertisement"
 * 		- createViewAdvertisementPack(session_key, viewer_uid, pubpage_id, ad_id)
 */
// args[0]: session_key
// args[1]: viewer_uid
// args[2]: pubpage_id
// args[3]: ad_id
Handle<Value> createViewAdvertisementPack(const Arguments& args) {
	std::string code;
	BEGIN
		Add(code, TYPE_FOUR_BYTE_INT, args[1], "viewer_uid");
		Add(code, TYPE_ASCII_STRING | PUBID_LENGTH, args[2], "pubpage_id");
		Add(code, TYPE_ASCII_STRING | ADID_LENGTH, args[3], "ad_id");
		SetHeadAndReturn(0, 0, 31);END
}

/**
 * - \b "0 32 Mass view advertisements"
 * 		- createMassViewAdvertisementsPack(session_key, viewer_uid, range, 0, max_pid)
 * 		- range:
 * 			- 0=local
 * 			- 1=global
 */
// args[0]: session_key
// args[1]: viewer_uid
// args[2]: range
// args[3]: subtype3
// args[4]: max_pid
Handle<Value> createMassViewAdvertisementsPack(const Arguments& args) {
	std::string code;
	BEGIN
		Add(code, TYPE_FOUR_BYTE_INT, args[1], "viewer_uid");
		Add(code, TYPE_ONE_BYTE_INT, args[2], "range");
		Add(code, TYPE_ONE_BYTE_INT, args[3], "subtype3");
		Add(code, TYPE_ASCII_STRING | POSTID_LENGTH, args[4], "max_pid");
		SetHeadAndReturn(0, 0, 32);END
}

/**
 * - \b "0 40 View picture"
 * 		- createViewPicturePack(session_key, viewer_uid, pic_id)
 */
// args[0]: session_key
// args[1]: viewer_uid
// args[2]: pic_id
Handle<Value> createViewPicturePack(const Arguments& args) {
	std::string code;
	BEGIN
		Add(code, TYPE_FOUR_BYTE_INT, args[1], "viewer_uid");
		Add(code, TYPE_ASCII_STRING | PICID_LENGTH, args[2], "pic_id");
		SetHeadAndReturn(0, 0, 40);END
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
	std::string code("");
	BEGIN
		Add(code, TYPE_FOUR_BYTE_INT, args[2], "searcher_uid");
		Add(code, TYPE_ONE_BYTE_INT, args[0], "search_mode");
		switch (args[0]->Uint32Value()) {
		case 0:
			// args[3]: match_option
			// args[4]: filter
			// args[5]: local_or_global
			// args[6]: age_lower_bound
			// args[7]: age_upper_bound
			// args[8]: gender
			Add(code, TYPE_ONE_BYTE_INT, args[3], "match_option");
			Add(code, TYPE_STRING | ONE_BYTE_FOR_LENGTH, args[4], "filter");
			Add(code, TYPE_ONE_BYTE_INT, args[5], "local_or_global");
			Add(code, TYPE_ONE_BYTE_INT, args[6], "age_lower_bound");
			Add(code, TYPE_ONE_BYTE_INT, args[7], "age_upper_bound");
			Add(code, TYPE_ONE_BYTE_INT, args[8], "gender");
			break;
		case 1:
			// args[3]: uid_to_search
			Add(code, TYPE_FOUR_BYTE_INT, args[3], "uid_to_search");
			break;
		case 2:
			// args[3]: email
			Add(code, TYPE_STRING | ONE_BYTE_FOR_LENGTH, args[3], "email");
			break;
		}
		SetHeadAndReturn(1, 1, 0);END
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
	BEGIN
		std::string code("");
		Add(code, TYPE_FOUR_BYTE_INT, args[2], "searcher_uid");
		Add(code, TYPE_ONE_BYTE_INT, args[0], "search_mode");
		switch (args[0]->Uint32Value()) {
		case 0:
// args[3]: match_option
// args[4]: filter
// args[5]: local_or_global
			Add(code, TYPE_ONE_BYTE_INT, args[3], "match_option");
			Add(code, TYPE_STRING | ONE_BYTE_FOR_LENGTH, args[4], "filter");
			Add(code, TYPE_ONE_BYTE_INT, args[5], "local_or_global");
			break;
		case 1:
// args[3]: event_id
			Add(code, TYPE_ASCII_STRING | EVENTID_LENGTH, args[3], "event_id");
			break;
		}
		SetHeadAndReturn(1, 1, 1);END
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
	std::string code("");
	BEGIN
		Add(code, TYPE_FOUR_BYTE_INT, args[1], "searcher_uid");
		Add(code, TYPE_ONE_BYTE_INT, Integer::New(0), "search_mode");
		Add(code, TYPE_STRING | ONE_BYTE_FOR_LENGTH, args[2], "filter");
		Add(code, TYPE_ONE_BYTE_INT, args[3], "local_or_global");
		Add(code, TYPE_ONE_BYTE_INT, args[4], "option");
		SetHeadAndReturn(0, 1, 2);END
}

/**
 * - \b "1 30 Search pubpage"
 * - for search by filter
 * 		- createSearchPubpagePack(0, session_key, searcher_uid, match_option, filter, local_or_global)
 * 		- option:
 * 				- 0=both
 * 				- 1=name only
 * 				- 2=tags only
 * 		- local_or_global:
 * 				- 0=local
 * 				- 1=global
 * - for search by id
 * 		- createSearchPubpagePack(1, session_key, searcher_uid, pubid)
 * \see ::resolvSearchPack
 */
// args[0]: search_mode
// args[1]: session_key
// args[2]: searcher_uid
Handle<Value> createSearchPubpagePack(const Arguments &args) {
	std::string code("");
	BEGIN
		Add(code, TYPE_FOUR_BYTE_INT, args[1], "searcher_uid");
		Add(code, TYPE_ONE_BYTE_INT, Integer::New(0), "search_mode");
		switch (args[0]->Uint32Value()) {
		case 0:
			// args[3]: match_option
			// args[4]: filter
			// args[5]: local_or_global
			Add(code, TYPE_ONE_BYTE_INT, args[3], "match_option");
			Add(code, TYPE_STRING | ONE_BYTE_FOR_LENGTH, args[4], "filter");
			Add(code, TYPE_ONE_BYTE_INT, args[5], "local_or_global");
			break;
		case 1:
			// args[3]: pubid
			Add(code, TYPE_ASCII_STRING | PUBID_LENGTH, args[3], "pubid");
			break;
		}
		SetHeadAndReturn(1, 1, 30);END
}

/**
 * - \b "1 31 Search advertisement"
 * 		- createSearchAdvertisementPack(session_key, searcher_uid, filter, local_or_global, 0)
 * 		- local_or_global:
 * 				- 0=local
 * 				- 1=global
 * \see ::resolvSearchPack
 */
// args[0]: session_key
// args[1]: searcher_uid
// args[2]: filter
// args[3]: local_or_global
// args[4]: option
Handle<Value> createSearchAdvertisementPack(const Arguments &args) {
	std::string code("");
	BEGIN
		Add(code, TYPE_FOUR_BYTE_INT, args[1], "searcher_uid");
		Add(code, TYPE_ONE_BYTE_INT, Integer::New(0), "search_mode");
		Add(code, TYPE_STRING | ONE_BYTE_FOR_LENGTH, args[2], "filter");
		Add(code, TYPE_ONE_BYTE_INT, args[3], "local_or_global");
		Add(code, TYPE_ONE_BYTE_INT, args[4], "option");
		SetHeadAndReturn(0, 1, 31);END
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
	std::string code("");
	BEGIN
		Add(code, TYPE_STRING | ONE_BYTE_FOR_LENGTH, args[0], "email");
		Add(code, TYPE_STRING | ONE_BYTE_FOR_LENGTH, args[1], "password");
		Add(code, TYPE_STRING | ONE_BYTE_FOR_LENGTH, args[2], "name");
		Add(code, TYPE_STRING | ONE_BYTE_FOR_LENGTH, args[3], "nick_name");
		Add(code, TYPE_FOUR_BYTE_INT, args[4], "birthday");
		Add(code, TYPE_ONE_BYTE_INT, args[5], "gender");
		Add(code, TYPE_STRING | ONE_BYTE_FOR_LENGTH, args[6], "city");
		Add(code, TYPE_STRING | ONE_BYTE_FOR_LENGTH, args[7], "state");
		Add(code, TYPE_STRING | ONE_BYTE_FOR_LENGTH, args[8], "country");
		Add(code, TYPE_TAGS, args[9], "visible_tags");
		Add(code, TYPE_TAGS, args[10], "hidden_tags");
		SetHeadAndReturn(-1, 2, 0);END
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
	std::string code("");
	BEGIN
		Add(code, TYPE_STRING | 1, args[1], "name");
		Add(code, TYPE_FOUR_BYTE_INT, args[2], "creater_uid");
		Add(code, TYPE_STRING | 1, args[3], "description");
		Add(code, TYPE_STRING | 1, args[4], "city");
		Add(code, TYPE_TAGS, args[5], "tags");
		SetHeadAndReturn(0, 2, 1);END
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
	std::string code("");
	BEGIN
		Add(code, TYPE_FOUR_BYTE_INT, args[1], "creater_uid");
		Add(code, TYPE_ASCII_STRING | EVENTID_LENGTH, args[2], "eventid");
		Add(code, TYPE_STRING | TWO_BYTE_FOR_LENGTH, args[3], "content");
		Add(code, TYPE_ONE_BYTE_INT, args[4], "visibility");
		Add(code, TYPE_TAGS, args[5], "tags");
		SetHeadAndReturn(0, 2, 2);END
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
	std::string code("");
	BEGIN
		Add(code, TYPE_FOUR_BYTE_INT, args[2], "requester");
		Add(code, TYPE_ONE_BYTE_INT, args[0], "type");
		switch (args[0]->Uint32Value()) {
		case 0:
			// args[3]: user_receiver_uid
			// args[4]: msg
			Add(code, TYPE_FOUR_BYTE_INT, args[3], "user_receiver_uid");
			Add(code, TYPE_STRING | ONE_BYTE_FOR_LENGTH, args[4], "msg");
			break;
		case 1:
			// args[3]: event_receiver_eid
			// args[4]: msg
			Add(code, TYPE_ASCII_STRING | EVENTID_LENGTH, args[3],
					"event_receiver_eid");
			Add(code, TYPE_STRING | ONE_BYTE_FOR_LENGTH, args[4], "msg");
			break;
		case 2:
			// args[3]: user_receiver_uid
			// args[4]: event_receiver_eid
			// args[5]: msg
			Add(code, TYPE_FOUR_BYTE_INT, args[3], "user_receiver_uid");
			Add(code, TYPE_ASCII_STRING | EVENTID_LENGTH, args[4],
					"event_receiver_eid");
			Add(code, TYPE_STRING | ONE_BYTE_FOR_LENGTH, args[5], "msg");
			break;
		}
		SetHeadAndReturn(1, 2, 3);END
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
	std::string code("");
	BEGIN
		Add(code, TYPE_FOUR_BYTE_INT, args[1], "creater_uid");
		Add(code, TYPE_ASCII_STRING | EVENTID_LENGTH, args[2], "eid");
		Add(code, TYPE_FOUR_BYTE_INT, args[3], "start_date");
		Add(code, TYPE_FOUR_BYTE_INT, args[4], "start_time");
		Add(code, TYPE_FOUR_BYTE_INT, args[5], "end_date");
		Add(code, TYPE_FOUR_BYTE_INT, args[6], "end_time");
		Add(code, TYPE_STRING | ONE_BYTE_FOR_LENGTH, args[7], "place");
		Add(code, TYPE_STRING | ONE_BYTE_FOR_LENGTH, args[8], "description");
		Add(code, TYPE_UIDS, args[9], "members");
		SetHeadAndReturn(0, 2, 17);END
}

/**
 * - \b "2 31 Create advertisement"
 * 		- createCreateAdvertisementPack(session_key, creater_uid, pub_id, content, 0, tags, pictures)
 */
// args[0]: session_key
// args[1]: creater_uid
// args[2]: pub_id
// args[3]: content
// args[4]: visibility
// args[5]: tags
// args[6]: pictures
Handle<Value> createCreateAdvertisementPack(const Arguments &args) {
	std::string code("");
	BEGIN
		Add(code, TYPE_FOUR_BYTE_INT, args[1], "creater_uid");
		Add(code, TYPE_ASCII_STRING | PUBID_LENGTH, args[2], "pub_id");
		Add(code, TYPE_STRING | TWO_BYTE_FOR_LENGTH, args[3], "content");
		Add(code, TYPE_ONE_BYTE_INT, args[4], "visibility");
		Add(code, TYPE_TAGS, args[5], "tags");
		Add(code, TYPE_PICTURES, args[6], "pictures");
		SetHeadAndReturn(0, 2, 31);END
}

/**
 * - \b "3 0 Update user"
 * 		- createUpdateUserPack(session_key, uid, updates)
 * 		- updates: Array of Update_User_Pack
 * 		- Update_User_Pack:
 * 				- password: [0, old_password, password]
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
	std::string code("");
	BEGIN
		Add(code, TYPE_FOUR_BYTE_INT, args[1], "uid");
		Add(code, TYPE_UPDATES, args[2], "updates");
		SetHeadAndReturn(0, 3, 0);END
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
	std::string code("");
	BEGIN
		Add(code, TYPE_FOUR_BYTE_INT, args[1], "manager_uid");
		Add(code, TYPE_ASCII_STRING | EVENTID_LENGTH, args[2], "eventid");
		Add(code, TYPE_UPDATES, args[3], "updates");
		SetHeadAndReturn(0, 3, 1);END
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
	std::string code("");
	BEGIN
		Add(code, TYPE_FOUR_BYTE_INT, args[1], "uid");
		Add(code, TYPE_FOUR_BYTE_INT, args[2], "friend_uid");
		Add(code, TYPE_STRING | ONE_BYTE_FOR_LENGTH, args[3], "comment");
		SetHeadAndReturn(0, 3, 13);END
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
	std::string code("");
	BEGIN
		Add(code, TYPE_FOUR_BYTE_INT, args[1], "uid");
		Add(code, TYPE_ONE_BYTE_INT, args[2], "status");
		SetHeadAndReturn(0, 3, 14);END
}

/**
 * - \b "3 23 Update avarta big"
 * - for user
 * 		- createUpdateAvartaBig(0, session_key, uid, content)
 * - for event
 * 		- createUpdateAvartaBig(1, session_key, uid, eid, content)
 * \see ::resolvUpdatePack
 */

/*3 23: Update avarta big: 1 subtype2 {0 for user, 1 for event},
 *				when (subtype2==0): 4 uid, 4 #bytes (<=50K), ? content
 *				when (subtype2==1): 4 uid, 8 eid, 4 #bytes (<=50K), ? content*/
// args[0]: type
// args[1]: session_key
Handle<Value> createUpdateAvartaBig(const Arguments &args) {
	std::string code("");
	BEGIN
		Add(code, TYPE_ONE_BYTE_INT, args[0], "type");
		switch (args[0]->Uint32Value()) {
		case 0:
			// args[2]: uid
			// args[3]: content
			Add(code, TYPE_FOUR_BYTE_INT, args[2], "uid");
			Add(code, TYPE_FILE | FOUR_BYTE_FOR_LENGTH, args[3], "content");
			break;
		case 1:
			// args[2]: uid
			// args[3]: eventid
			// args[4]: content
			Add(code, TYPE_FOUR_BYTE_INT, args[2], "uid");
			Add(code, TYPE_ASCII_STRING | EVENTID_LENGTH, args[3], "eventid");
			Add(code, TYPE_FILE | FOUR_BYTE_FOR_LENGTH, args[4], "content");
			break;
		}
		SetHeadAndReturn(1, 3, 23);END
}

/**
 * - \b "3 24 Update avarta small"
 * - for user
 * 		- createUpdateAvartaSmall(0, session_key, uid, content)
 * - for event
 * 		- createUpdateAvartaSmall(1, session_key, uid, eid, content)
 * \see ::resolvUpdatePack
 */

/*3 24: Update avarta small: 1 subtype2 {0 for user, 1 for event},
 *				when (subtype2==0): 4 uid, 4 #bytes (<=1K), ? content
 *				when (subtype2==1): 4 uid, 8 eid, 4 #bytes (<=1K), ? content*/
// args[0]: type
// args[1]: session_key
Handle<Value> createUpdateAvartaSmall(const Arguments &args) {
	std::string code("");
	BEGIN
		Add(code, TYPE_ONE_BYTE_INT, args[0], "type");
		switch (args[0]->Uint32Value()) {
		case 0:
			// args[2]: uid
			// args[3]: content
			Add(code, TYPE_FOUR_BYTE_INT, args[2], "uid");
			Add(code, TYPE_FILE | FOUR_BYTE_FOR_LENGTH, args[3], "content");
			break;
		case 1:
			// args[2]: uid
			// args[3]: eventid
			// args[4]: content
			Add(code, TYPE_FOUR_BYTE_INT, args[2], "uid");
			Add(code, TYPE_ASCII_STRING | EVENTID_LENGTH, args[3], "eventid");
			Add(code, TYPE_FILE | FOUR_BYTE_FOR_LENGTH, args[4], "content");
			break;
		}
		SetHeadAndReturn(1, 3, 24);END
}

/**
 * - \b "3 30 Update pubpage"
 * 		- createUpdatePubpagePack(session_key, your_uid, pub_id, updates)
 *		- updates: Array of Update_Pubpage_Pack
 * 		- Update_User_Pack:
 * 				- name: [1, name]
 * 				- city:	[5, city]
 * 				- add tag: [8, tag]
 * 				- del tag: [9, tag]
 * 				- setting: [10, setting_No, setting_value]
 * - e.g.  change name of pubpage 123456 of user 12345 to "abc"
 * 		- createUpdatePubpagePack(session_key, 12345, "123456", [[1, "abc"]])
 * \see ::resolvUpdatePack
 */
// args[0]: session_key
// args[1]: your_uid
// args[2]: pub_id
// args[3]: updates
Handle<Value> createUpdatePubpagePack(const Arguments &args) {
	std::string code("");
	BEGIN
		Add(code, TYPE_FOUR_BYTE_INT, args[1], "your_uid");
		Add(code, TYPE_ASCII_STRING | PUBID_LENGTH, args[2], "pub_id");
		Add(code, TYPE_UPDATES, args[3], "updates");
		SetHeadAndReturn(0, 3, 30);END
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
	std::string code("");
	BEGIN
		Add(code, TYPE_FOUR_BYTE_INT, args[1], "replier_uid");
		Add(code, TYPE_FOUR_BYTE_INT, args[2], "poster_uid");
		Add(code, TYPE_FOUR_BYTE_INT, args[3], "reply_to_uid");
		Add(code, TYPE_ASCII_STRING | EVENTID_LENGTH, args[4], "eid");
		Add(code, TYPE_ASCII_STRING | POSTID_LENGTH, args[5], "pid");
		Add(code, TYPE_STRING | ONE_BYTE_FOR_LENGTH, args[6], "replyer_name");
		Add(code, TYPE_STRING | ONE_BYTE_FOR_LENGTH, args[7], "reply_to_name");
		Add(code, TYPE_STRING | ONE_BYTE_FOR_LENGTH, args[8], "content");
		Add(code, TYPE_ONE_BYTE_INT, args[9], "visibility");
		SetHeadAndReturn(0, 4, 2);END
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
	std::string code("");
	BEGIN
		Add(code, TYPE_FOUR_BYTE_INT, args[1], "uid");
		Add(code, TYPE_FOUR_BYTE_INT, args[2], "friend_uid");
		SetHeadAndReturn(0, 5, 0);END
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
	std::string code("");
	BEGIN
		Add(code, TYPE_FOUR_BYTE_INT, args[1], "your_uid");
		Add(code, TYPE_FOUR_BYTE_INT, args[2], "uid");
		Add(code, TYPE_ASCII_STRING | EVENTID_LENGTH, args[3], "eid");
		Add(code, TYPE_ASCII_STRING | POSTID_LENGTH, args[4], "pid");
		SetHeadAndReturn(0, 5, 2);END
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
	std::string code("");
	BEGIN
		Add(code, TYPE_FOUR_BYTE_INT, args[1], "your_uid");
		Add(code, TYPE_FOUR_BYTE_INT, args[2], "uid");
		Add(code, TYPE_ASCII_STRING | EVENTID_LENGTH, args[3], "eid");
		Add(code, TYPE_FOUR_BYTE_INT, args[4], "sid");
		SetHeadAndReturn(0, 5, 17);END
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
	std::string code("");
	BEGIN
		Add(code, TYPE_FOUR_BYTE_INT, args[1], "your_uid");
		Add(code, TYPE_FOUR_BYTE_INT, args[2], "uid");
		Add(code, TYPE_ASCII_STRING | EVENTID_LENGTH, args[3], "eid");
		Add(code, TYPE_ASCII_STRING | POSTID_LENGTH, args[4], "pid");
		Add(code, TYPE_FOUR_BYTE_INT, args[5], "rid");
		SetHeadAndReturn(0, 5, 22);END
}

/**
 * - \b "5 31 Delete advertisement"
 * 		- createDeleteAdvertisementPack(session_key, your_uid, pub_id, ad_id)
 * \see ::resolvDeletePack
 */
// args[0]: session_key
// args[1]: your_uid
// args[2]: pub_id
// args[3]: ad_id
Handle<Value> createDeleteAdvertisementPack(const Arguments &args) {
	std::string code("");
	BEGIN
		Add(code, TYPE_FOUR_BYTE_INT, args[1], "your_uid");
		Add(code, TYPE_ASCII_STRING | PUBID_LENGTH, args[3], "pub_id");
		Add(code, TYPE_ASCII_STRING | ADID_LENGTH, args[4], "ad_id");
		SetHeadAndReturn(0, 5, 31);END
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
	std::string code("");
	BEGIN
		Add(code, TYPE_ONE_BYTE_INT, args[0], "login_type");
		switch (args[0]->Uint32Value()) {
		case 0:
			// args[1]: uid
			// args[2]: password
			Add(code, TYPE_FOUR_BYTE_INT, args[1], "uid");
			Add(code, TYPE_STRING | ONE_BYTE_FOR_LENGTH, args[2], "password");
			break;
		case 1:
			// args[1]: email
			// args[2]: password
			Add(code, TYPE_STRING | ONE_BYTE_FOR_LENGTH, args[1], "email");
			Add(code, TYPE_STRING | ONE_BYTE_FOR_LENGTH, args[2], "password");
			break;
		}
		SetHeadAndReturn(-1, 6, 0);END
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
	std::string code("");
	BEGIN
		Add(code, TYPE_FOUR_BYTE_INT, args[1], "uid");
		SetHeadAndReturn(0, 6, 16);END
}

/**
 * - \b "6 20 Email validation"
 * 		- createEmailValidationPack(email)
 * \see ::resolvValidationPack
 */

/*6 20: email validation: 1 email_len, ? email*/
// args[0]: email
Handle<Value> createEmailValidationPack(const Arguments &args) {
	std::string code("");
	BEGIN
		Add(code, TYPE_STRING | ONE_BYTE_FOR_LENGTH, args[0], "email");
		SetHeadAndReturn(-1, 6, 20);END
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
	std::string code("");
	BEGIN
		Add(code, TYPE_STRING | ONE_BYTE_FOR_LENGTH, args[0], "email");
		Add(code, TYPE_FOUR_BYTE_INT, args[1], "code_1");
		Add(code, TYPE_STRING | ONE_BYTE_FOR_LENGTH, args[2], "code_2");
		SetHeadAndReturn(-1, 6, 21);END
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
	std::string code("");
	BEGIN
		Add(code, TYPE_FOUR_BYTE_INT, args[1], "uid");
		Add(code, TYPE_ASCII_STRING | EVENTID_LENGTH, args[2], "eventid");
		SetHeadAndReturn(0, 7, 1);END
}

/**
 * - \b "10 5 Notification response"
 * 		- createNotificationPack(session_key, your_uid, subtype2, seqNo, uid, eid, pid, action)
 */

// args[0]: session_key
// args[1]: your_uid
// args[2]: subtype2
// args[3]: seqNo
// args[4]: uid
// args[5]: eid
// args[6]: pid
// args[7]: action
Handle<Value> createNotificationPack(const Arguments &args) {
	std::string code("");
	BEGIN
		Add(code, TYPE_FOUR_BYTE_INT, args[1], "your_uid");
		Add(code, TYPE_ONE_BYTE_INT, args[2], "subtype2");
		Add(code, TYPE_FOUR_BYTE_INT, args[3], "seqNo");
		Add(code, TYPE_FOUR_BYTE_INT, args[4], "uid");
		Add(code, TYPE_ASCII_STRING | EVENTID_LENGTH, args[5], "eid");
		Add(code, TYPE_ASCII_STRING | POSTID_LENGTH, args[6], "pid");
		Add(code, TYPE_ONE_BYTE_INT, args[7], "action");
		Add(code, TYPE_ONE_BYTE_INT, Integer::New(0), "msg_length");
		SetHeadAndReturn(0, 10, 5);END
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
	std::string code("");
	BEGIN
		Add(code, TYPE_FOUR_BYTE_INT, args[1], "your_uid");
		Add(code, TYPE_FOUR_BYTE_INT, args[2], "seqNo");
		Add(code, TYPE_FOUR_BYTE_INT, args[3], "other_uid");
		Add(code, TYPE_STRING | TWO_BYTE_FOR_LENGTH, args[4], "content");
		SetHeadAndReturn(0, 12, 0);END
}

/*12 1 message to event: 4 your_uid, 4 seqNo, 8 event-eid, 2 conent_en, ? content*/
// args[0]: session_key
// args[1]: your_uid
// args[2]: seqNo
// args[3]: eventid
// args[4]: content
Handle<Value> createMessageToEventPack(const Arguments &args) {
	std::string code("");
	BEGIN
		Add(code, TYPE_FOUR_BYTE_INT, args[1], "your_uid");
		Add(code, TYPE_FOUR_BYTE_INT, args[2], "seqNo");
		Add(code, TYPE_ASCII_STRING | EVENTID_LENGTH, args[3], "eventid");
		Add(code, TYPE_STRING | TWO_BYTE_FOR_LENGTH, args[4], "content");
		SetHeadAndReturn(0, 12, 1);END
}

typedef struct s_header {
	uint32_t length;
	char session_key[SESSION_KEY_LENGTH * 2];
	int type, subtype;
} header;
static void extract_header(const char *buf, header* ans) {
	ans->length = 0;
	int pointer = 0;
	ans->length = readInteger(buf, pointer, 4);
	readAsciiString(ans->session_key, buf, pointer, SESSION_KEY_LENGTH);
	readBytes(NULL, buf, pointer, 4);
	ans->type = readInteger(buf, pointer, 1);
	ans->subtype = readInteger(buf, pointer, 1);
}
static Local<Array> formJSHeader(const header *header) {
	Local<Array> ans = Array::New(5);
	ans->Set(0, Integer::New(header->length));
	ans->Set(1, String::New(header->session_key, SESSION_KEY_LENGTH * 2));
	ans->Set(2, Integer::New(header->type));
	ans->Set(3, Integer::New(header->subtype));
	return ans;
}

/**
 * 	- 0: length
 * 	- 1: session_key
 * 	- 2: type
 * 	- 3: subtype
 */
Handle<Value> resolvCTSHeader(const Arguments& args) {
	char* pack = new char[HEADER_LENGTH * 2];
	header header;
	args[0]->ToString()->WriteAscii(pack, 0, HEADER_LENGTH * 2);
	encode(pack, HEADER_LENGTH);
	extract_header(pack, &header);
	delete[] pack;
	return formJSHeader(&header);
}
