import { apiGet, apiPost } from './api/client';
import type { ChatConversation, ChatMessage } from '../types';

export interface SendMessageResult {
  conversationId: string;
  reply: string;
  createdAt: string;
}

export interface ChatUsage {
  tier: string;
  usedToday: number;
  dailyLimit: number;
  isUnlimited: boolean;
  remaining: number;
}

export const chatService = {
  sendMessage: async (message: string, conversationId?: string): Promise<SendMessageResult> => {
    const payload: { message: string; conversationId?: string } = { message };
    if (conversationId) {
      payload.conversationId = conversationId;
    }

    const res = await apiPost<any>('/chat/messages', payload);
    const data = res?.data || res;

    return {
      conversationId: data?.conversationId || conversationId || '',
      reply: data?.reply || data?.response || data?.message || '',
      createdAt: data?.createdAt || new Date().toISOString(),
    };
  },

  getConversations: async (): Promise<ChatConversation[]> => {
    try {
      const res = await apiGet<any>('/chat/conversations');
      const items = Array.isArray(res) ? res : res?.data || res?.items || [];
      return items.map((c: any) => ({
        id: c.id,
        title: c.title || 'New Conversation',
        createdAt: c.createdAt || new Date().toISOString(),
      }));
    } catch (e) {
      console.warn('Failed to load chat conversations:', e);
      return [];
    }
  },

  getMessages: async (conversationId: string, limit: number = 50): Promise<ChatMessage[]> => {
    try {
      const res = await apiGet<any>(`/chat/conversations/${conversationId}/messages?limit=${limit}`);
      const rawList = Array.isArray(res) ? res : res?.data || res?.items || [];

      // Backend ChatMessage has { id, userMessage, aiResponse, createdAt }
      // We expand each pair into individual User and Lingo messages
      const messages: ChatMessage[] = [];
      for (const item of rawList) {
        if (item.userMessage) {
          messages.push({
            id: `${item.id}-user`,
            role: 'user',
            text: item.userMessage,
            createdAt: item.createdAt,
          });
        }
        if (item.aiResponse) {
          messages.push({
            id: `${item.id}-lingo`,
            role: 'lingo',
            text: item.aiResponse,
            createdAt: item.createdAt,
          });
        }
      }
      return messages;
    } catch (e) {
      console.warn('Failed to load chat messages:', e);
      return [];
    }
  },

  getUsage: async (): Promise<ChatUsage> => {
    try {
      const res = await apiGet<any>('/chat/usage');
      const data = res?.data || res;
      return {
        tier: data?.tier || 'Free',
        usedToday: data?.usedToday ?? 0,
        dailyLimit: data?.dailyLimit ?? 5,
        isUnlimited: !!data?.isUnlimited,
        remaining: data?.remaining ?? 5,
      };
    } catch (e) {
      console.warn('Failed to load chat usage:', e);
      return {
        tier: 'Free',
        usedToday: 0,
        dailyLimit: 5,
        isUnlimited: false,
        remaining: 5,
      };
    }
  },
};

