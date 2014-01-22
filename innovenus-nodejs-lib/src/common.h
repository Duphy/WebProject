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
#endif /* COMMON_H_ */
