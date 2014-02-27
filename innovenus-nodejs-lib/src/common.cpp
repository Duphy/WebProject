#include <v8.h>
#include <vector>
#include <cstring>
#include <cstdio>
#include <node_buffer.h>

#include "common.h"
#include "resolv.h"
#include "create.h"

void encode(char *pack, uint32_t length) {
	int x = 97;
	for (uint32_t i = 4; i < length; i++) {
		pack[i] ^= x;
		if (x > 123) x = 97;
	}
}
void encode(std::string &pack, uint32_t length) {
	unsigned int x = 97;
	for (std::string::iterator it = pack.begin() + 4; it != pack.end(); it++) {
		*it ^= x;
		if (x > 123) x = 97;
	}
}
Handle<Value> encode(const Arguments& args) {
	char* pack = node::Buffer::Data(args[0]);
	encode(pack, node::Buffer::Length(args[0]));
	return Undefined();
}
#define ExportJSFunction(x) exports->Set(sym(#x),FunctionTemplate::New(x)->GetFunction());

void init(Handle<Object> exports) {
	ExportJSFunction(createViewUserPack)
	ExportJSFunction(createViewEventPack)
	ExportJSFunction(createViewPostingPack)
	ExportJSFunction(createMassViewPack)
	ExportJSFunction(createViewSelfPack)
	ExportJSFunction(createViewPubpagePack)
	ExportJSFunction(createViewAdvertisementPack)
	ExportJSFunction(createMassViewAdvertisementsPack)
	ExportJSFunction(createViewPicturePack)
	ExportJSFunction(createViewPubpicturePack)
	ExportJSFunction(createSearchUserPack)
	ExportJSFunction(createSearchEventPack)
	ExportJSFunction(createSearchPostingPack)
	ExportJSFunction(createSearchPubpagePack)
	ExportJSFunction(createSearchAdvertisementPack)
	ExportJSFunction(createCreateUserPack)
	ExportJSFunction(createCreateEventPack)
	ExportJSFunction(createCreatePostingPack)
	ExportJSFunction(createCreateRequestPack)
	ExportJSFunction(createCreateSchedulePack)
	ExportJSFunction(createCreateAdvertisementPack)
	ExportJSFunction(createUpdateUserPack)
	ExportJSFunction(createUpdateEventPack)
	ExportJSFunction(createUpdatePostingPack)
	ExportJSFunction(createUpdateFriendCommentsPack)
	ExportJSFunction(createUpdateStatusPack)
	ExportJSFunction(createUpdateAvartaBig)
	ExportJSFunction(createUpdateAvartaSmall)
	ExportJSFunction(createUpdatePubpagePack)
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
	ExportJSFunction(createNotificationPack)
	ExportJSFunction(createInvitationPack)

	ExportJSFunction(resolvPack)
	ExportJSFunction(resolvSTCHeader)
	ExportJSFunction(resolvCTSHeader)

	ExportJSFunction(encode)
}

NODE_MODULE(lib, init)
