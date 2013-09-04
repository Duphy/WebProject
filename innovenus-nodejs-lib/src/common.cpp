#include <node.h>
#include <v8.h>
#include <vector>
#include <cstring>
#include <cstdio>

#include "common.h"
#include "resolv.h"
#include "create.h"

#define ExportJSFunction(x) exports->Set(sym("x"),FunctionTemplate::New(x)->GetFunction());
void init(Handle<Object> exports) {
	ExportJSFunction(createViewUserPack);
	ExportJSFunction(createLoginPack);
	ExportJSFunction(createViewSelfPack);
	ExportJSFunction(createViewEventPack)
	ExportJSFunction(createViewPostingPack)
	ExportJSFunction(createMassViewPack)
	ExportJSFunction(createSearchUserPack)
	ExportJSFunction(createSearchEventPack)
	ExportJSFunction(resolvPack);
}

NODE_MODULE(lib, init)
