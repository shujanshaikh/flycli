import { useChat } from '@ai-sdk/react';
import { lastAssistantMessageIsCompleteWithToolCalls } from 'ai';
import { WebsocketChatTransport } from '@repo/agent/ws-transport';
import { WS_URL } from '@/lib/constant';
import type { ChatMessage } from '@/lib/types';

export function useChatTransport() {
  const transport = new WebsocketChatTransport({
    agent: 'agent',
    toolCallCallback: () => {},
    url: WS_URL,
  });

  const chat = useChat<ChatMessage>({
    onFinish: () => {},
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
    transport,
  });

  return chat;
}

