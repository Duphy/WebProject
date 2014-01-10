#include <node.h>
#include <v8.h>
#include <vector>
#include <cstring>
#include <cstdio>

#include "common.h"
#include "resolv.h"
#include "create.h"

#define ExportJSFunction(x) exports->Set(sym(#x),FunctionTemplate::New(x)->GetFunction());

void init(Handle<Object> exports) {
	ExportJSFunction(createViewUserPack);
	ExportJSFunction(createViewEventPack)
	ExportJSFunction(createViewPostingPack)
	ExportJSFunction(createMassViewPack)
	ExportJSFunction(createViewSelfPack);
	ExportJSFunction(createSearchUserPack)
	ExportJSFunction(createSearchEventPack)
	ExportJSFunction(createSearchPostingPack)
	ExportJSFunction(createCreateUserPack)
	ExportJSFunction(createCreateEventPack)
	ExportJSFunction(createCreatePostingPack)
	ExportJSFunction(createCreateRequestPack)
	ExportJSFunction(createCreateSchedulePack)
	ExportJSFunction(createUpdateUserPack)
	ExportJSFunction(createUpdateEventPack)
	ExportJSFunction(createUpdatePostingPack)
	ExportJSFunction(createUpdateFriendCommentsPack)
	ExportJSFunction(createUpdateStatusPack)
	ExportJSFunction(createUpdateAvartaBig)
	ExportJSFunction(createUpdateAvartaSmall)
	ExportJSFunction(createReplyPostingPack)
	ExportJSFunction(createDeleteFriendPack)
	ExportJSFunction(createDeletePostingPack)
	ExportJSFunction(createDeleteSchedulePack)
	ExportJSFunction(createDeleteReplyPack)
	ExportJSFunction(createLoginPack)
	ExportJSFunction(createLogoutPack)
	ExportJSFunction(createEmailValidationPack)
	ExportJSFunction(createIdentificationCodeValidationPack)
	ExportJSFunction(createQuitEventPack)
	ExportJSFunction(createMessageToUserPack)
	ExportJSFunction(createMessageToEventPack)

	ExportJSFunction(resolvPack)
	ExportJSFunction(resolvHeader)
}

NODE_MODULE(lib, init)
