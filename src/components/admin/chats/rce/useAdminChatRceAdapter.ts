'use client';

import { useMemo } from 'react';
import {
    buildRceChatListItems,
    buildRceMessageListItems,
    type AdminChatWorkspaceState,
} from './adapter-helpers';

export function useAdminChatRceAdapter(workspace: AdminChatWorkspaceState) {
    const { sessionRows, currentConversation, groupedMessages } = workspace;

    const chatListItems = useMemo(
        () => buildRceChatListItems({ sessionRows }),
        [sessionRows],
    );

    const messageListItems = useMemo(
        () => buildRceMessageListItems({ currentConversation, groupedMessages }),
        [currentConversation, groupedMessages],
    );

    return {
        chatListItems,
        messageListItems,
    };
}
