#include <node.h>
#include <v8.h>
#include <vector>
#include <cstring>
#include <cstdio>

#include "common.h"
#include "resolv.h"
#include "create.h"

void encode(char *pack, uint32_t length) {
	int x = 97;
	for (uint32_t i = 4; i < length; i++) {
		pack[i << 1] = formHexBit((resolvHexBit(pack[i << 1]) ^ (x >> 4)));
		pack[(i << 1) | 1] = formHexBit((resolvHexBit(pack[(i << 1) | 1]) ^ (x & 0xF)));
		if (x > 123) x = 97;
	}
}
void encode(std::string &pack, uint32_t length) {
	unsigned int x = 97;
	for (std::string::iterator it = pack.begin() + 4 * 2; it != pack.end();) {
		*it = formHexBit((resolvHexBit(*it) ^ (x >> 4)));
		it++;
		*it = formHexBit((resolvHexBit(*it) ^ (x & 0xF)));
		it++;
		if (x > 123) x = 97;
	}
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
}

NODE_MODULE(lib, init)
