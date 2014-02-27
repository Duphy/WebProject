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
#define DUMB_SESSION_KEY		"0000000000000000"

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

#ifdef _WIN32
#include <direct.h>
#include <io.h>
#elif _LINUX || __APPLE__ || linux
#include <stdarg.h>
#include <sys/stat.h>
#endif

#ifdef _WIN32
#define ACCESS _access
#define MKDIR(a) _mkdir((a))
#elif _LINUX || __APPLE__ || linux
#define ACCESS access
#define MKDIR(a) mkdir((a),0755)
#endif

inline void readBytes(char *dist, const char *buf, int& pointer, int length) {
	if (dist != NULL)
		memcpy(dist, buf + pointer, length);
	pointer += length;
}
static void readAsciiString(char *dist, const char *buf, int& pointer,
		int length) {
	for (int i = 0; i < length; i++) {
		dist[i << 1] = formHexBit((buf[pointer] >> 4) & 0xF);
		dist[(i << 1) | 1] = formHexBit(buf[pointer++] & 0xF);
	}
}
static Local<String> JSreadAsciiString(const char *buf, int &pointer,
		int length) {
	char *tmp = new char[length * 2];
	readAsciiString(tmp, buf, pointer, length);
	Local<String> ans = String::New(tmp, length * 2);
	delete[] tmp;
	return ans;
}
inline void readString(uint16_t *dist, const char *buf, int &pointer,
		int length) {
	memcpy(dist, buf + pointer, length * 2);
	char tmp;
	for (int i = 0; i < length; i++) {
		tmp = ((char *) dist)[i << 1];
		((char *) dist)[i << 1] = ((char *) dist)[(i << 1) | 1];
		((char *) dist)[(i << 1) | 1] = tmp;
	}
	pointer += length * 2;
}
static Local<String> JSreadString(const char *buf, int &pointer, int length) {
	length /= 2;
	uint16_t *tmp = new uint16_t[length + 1];
	readString(tmp, buf, pointer, length);
	tmp[length] = 0;
	Local<String> ans = String::New(tmp);
	delete[] tmp;
	return ans;
}
static int64_t readInteger(const char *buf, int& pointer, int length) {
	int64_t ans = 0;
	for (int i = 0; i < length; i++) {
		ans <<= 8;
		ans |= ((const unsigned char *) buf)[pointer++];
	}
	return ans;
}
static Local<Integer> JSreadInteger(const char *buf, int &pointer, int length) {
	int64_t ans = readInteger(buf, pointer, length);
	if (length == 8) {
		char tmp[40];
		sprintf(tmp, LLD, ans);
		Local<Value> value = Script::Compile(String::New(tmp))->Run();
		return value->ToInteger();
	} else
		return Number::New(ans)->ToInteger();
}
inline bool readBool(const char *buf, int &pointer) {
	return (readInteger(buf, pointer, 1) == 0);
}
inline Handle<Boolean> JSreadBool(const char *buf, int &pointer) {
	return Boolean::New(readBool(buf, pointer));
}
static bool CreateDir(std::string path) {
	int i = 0;
	int iRet;
	int iLen = path.length();
	//在末尾加/
	if (path[path.length() - 1] != '/')
		path += '/';

	// 创建目录
	for (i = 0; i < iLen; i++) {
		if (path[i] == '/') {
			//如果不存在,创建
			iRet = ACCESS(path.substr(0, i).c_str(), 0);
			if (iRet != 0) {
				iRet = MKDIR(path.substr(0, i).c_str());
				if (iRet != 0) {
					return false;
				}
			}
		}
	}

	return true;
}
static Local<String> JSreadFile(const char *buf, int &pointer,
		std::string path) {
	int64_t length = readInteger(buf, pointer, 4);
	int i;
	for (i = path.length() - 1; i >= 0; i--)
		if (path[i] == '/')
			break;
	std::string folder(path.begin(), path.begin() + i + 1);
	if (!CreateDir(folder))
		return String::New("");
	if (ACCESS(path.c_str(), 0) == 0)
		return String::New(path.substr(7).c_str());
	else if (length == 0)
		return String::New("");
	else {
		FILE *file = fopen(path.c_str(), "wb");
		if ((file == NULL) || (fwrite(buf + pointer, 1, length, file) != length)) {
			if (file != NULL)
				fclose(file);
			return String::New("");
		} else {
			fclose(file);
			return String::New(path.substr(7).c_str());
		}
	}
}
#endif /* COMMON_H_ */
