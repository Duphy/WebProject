#include <node.h>
#include <v8.h>
#include <vector>
#include <cstring>
#include <cstdio>

#include "common.h"
#include "resolv.h"
#include "create.h"

void init(Handle<Object> exports) {
	exports->Set(sym("createLoginPack"),
			FunctionTemplate::New(createLoginPack)->GetFunction());
	exports->Set(sym("resolvPack"),
			FunctionTemplate::New(resolvPack)->GetFunction());
	exports->Set(sym("createRetrieveCurrentUserInfoPack"),
			FunctionTemplate::New(createRetrieveCurrentUserInfoPack)->GetFunction());
}

NODE_MODULE(lib, init)
