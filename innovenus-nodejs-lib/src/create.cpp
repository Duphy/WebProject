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
