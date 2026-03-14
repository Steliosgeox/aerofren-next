'use client';

import { useMemo } from 'react';
import {
    buildRceChatListItems,
    buildRceMessageListItems,
    type AdminChatWorkspaceState,
} from './adapter-helpers';

export function useAdminChatRceAdapter(workspace: AdminChatWorkspaceState) {
    const chatListItems = useMemo(() => buildRceChatListItems(workspace), [workspace]);
    const messageListItems = useMemo(() => buildRceMessageListItems(workspace), [workspace]);

    return {
        chatListItems,
        messageListItems,
    };
}
