/*
 * common.h
 *
 *  Created on: 2013-9-3
 *      Author: lzn
 */

#ifndef COMMON_H_
#define COMMON_H_

#ifdef WIN32
#define LLD "%I64d"
#else
#define LLD "%lld"
#endif

#include <string>
#include <cstring>

using namespace v8;

#define UID_LENGTH				4
#define EVENTID_LENGTH			8
#define SID_LENGTH				4
#define RID_LENGTH				4
#define POSTID_LENGTH			8
#define PICID_LENGTH			8
#define PUBID_LENGTH			8
#define ADID_LENGTH				8
#define NUM_OF_BYTES_IN_LENGTH	4
#define NUM_OF_BITS_IN_BYTE		8
#define SESSION_KEY_LENGTH		8
#define DUMB_SESSION_KEY		"3030303030303030"

#define MAX_EIGHT_BIT_INT  		(1 << 63) - 1

#define reverse(x) ((unsigned int)((((x)&0xFF)<<24)|((((x)>>8)&0xFF)<<16)|((((x)>>16)&0xFF)<<8)|(((x)>>24)&0xFF)))

inline static Local<String> sym(char *x) {
	return String::NewSymbol(x);
}

#define DeclareJSFunction(x) Handle<Value> x(const Arguments &args);

inline int resolvHexBit(char a) {
	return a > '9' ? a - 'a' + 10 : a - '0';
}
inline char formHexBit(int a) {
	return a > 9 ? 'a' + a - 10 : '0' + a;
}
void encode(char *buf, uint32_t length);
void encode(std::string &buf, uint32_t length);

static void readBytes(char *dist, const char *buf, int& pointer, int length) {
	if (dist != NULL)
		for (int i = 0; i < length; i++)
			dist[i] = (resolvHexBit(buf[pointer + i * 2]) << 4)
					+ resolvHexBit(buf[pointer + i * 2 + 1]);
	pointer += length * 2;
}
static void readAsciiString(char *dist, const char *buf, int& pointer,
		int length) {
	memcpy(dist, buf + pointer, length * 2);
	pointer += length * 2;
}
static Local<String> JSreadAsciiString(const char *buf, int &pointer,
		int length) {
	char *tmp = new char[length * 2];
	memcpy(tmp, buf + pointer, length * 2);
	pointer += length * 2;
	Local<String> ans = String::New(tmp, length * 2);
	delete[] tmp;
	return ans;
}
static void readString(uint16_t *dist, const char *buf, int &pointer,
		int length) {
	length /= 2;
	for (int i = 0; i < length; i++)
		dist[i] = ((resolvHexBit(buf[pointer + i * 4]) << 12)
				| (resolvHexBit(buf[pointer + i * 4 + 1]) << 8)
				| (resolvHexBit(buf[pointer + i * 4 + 2]) << 4)
				| (resolvHexBit(buf[pointer + i * 4 + 3])));
	pointer += length * 4;
}
static Local<String> JSreadString(const char *buf, int &pointer, int length) {
	length /= 2;
	uint16_t *tmp = new uint16_t[length + 1];
	readString(tmp, buf, pointer, length * 2);
	tmp[length] = 0;
	Local<String> ans = String::New(tmp);
	delete[] tmp;
	return ans;
}
static int64_t readInteger(const char *buf, int& pointer, int length) {
	int64_t ans = 0;
	for (int i = 0; i < length; i++) {
		ans <<= 4;
		ans |= resolvHexBit(buf[pointer++]);
		ans <<= 4;
		ans |= resolvHexBit(buf[pointer++]);
	}
	return ans;
}
static Local<Integer> JSreadInteger(const char *buf, int &pointer, int length) {
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
static bool readBool(const char *buf, int &pointer) {
	char tmp;
	tmp = readInteger(buf, pointer, 1);
	return (tmp == 0);
}
static Handle<Boolean> JSreadBool(const char *buf, int &pointer) {
	return Boolean::New(readBool(buf, pointer));
}
#endif /* COMMON_H_ */
