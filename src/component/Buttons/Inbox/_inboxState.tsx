import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface InboxMessage {
  id: string;
  title: string;
  body: string;
  read: boolean;
  created_at: string;
}

interface InboxState {
  messages: InboxMessage[];
  unreadCount: number;
  setMessages: (msgs: InboxMessage[]) => void;
  markAllRead: () => void;
  fetchInbox: (userId: string) => Promise<void>;
}

export const useInboxStore = create<InboxState>()(
  persist(
    (set, get) => ({
      messages: [],
      unreadCount: 0,

      setMessages: (msgs) =>
        set({
          messages: msgs,
          unreadCount: msgs.filter((m) => !m.read).length,
        }),

      markAllRead: () =>
        set((state) => ({
          messages: state.messages.map((m) => ({ ...m, read: true })),
          unreadCount: 0,
        })),

      fetchInbox: async (userId: string) => {
        try {
          // Replace with your actual backend API call
          const response = await fetch(`https://api.duweenext.com/users/${userId}/inbox`);
          const data = await response.json();

          set({
            messages: data,
            unreadCount: data.filter((m: InboxMessage) => !m.read).length,
          });
        } catch (error) {
          console.error('Failed to fetch inbox:', error);
        }
      },
    }),
    { name: 'inbox-storage' }
  )
);
