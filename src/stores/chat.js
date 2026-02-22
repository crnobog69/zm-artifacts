import { create } from 'zustand'
import { api, createWS, getToken } from '../api/client'

export const useChatStore = create((set, get) => ({
  guilds: [],
  channels: [],
  categories: [],
  messages: [],
  dms: [],
  dmMessages: [],
  members: [],
  activeGuild: null,
  activeChannel: null,
  activeDM: null,
  hasMoreMessages: true,
  hasMoreDMMessages: true,
  ws: null,

  // --- Guilds ---
  fetchGuilds: async () => {
    const guilds = await api('/guilds')
    set({ guilds })
  },

  setActiveGuild: (guild) => {
    set({ activeGuild: guild, activeChannel: null, messages: [], hasMoreMessages: true })
    if (guild) get().fetchChannels(guild.id)
  },

  createGuild: async (name) => {
    const guild = await api('/guilds', { method: 'POST', body: { name } })
    set((s) => ({ guilds: [...s.guilds, guild] }))
    return guild
  },

  // --- Channels ---
  fetchChannels: async (guildId) => {
    const [channels, categories] = await Promise.all([
      api(`/guilds/${guildId}/channels`),
      api(`/guilds/${guildId}/categories`),
    ])
    set({ channels: channels || [], categories: categories || [] })
  },

  setActiveChannel: (channel) => {
    set({ activeChannel: channel, activeDM: null, messages: [], hasMoreMessages: true })
    if (channel) {
      get().fetchMessages(channel.id)
      get()._subscribe(`channel:${channel.id}`)
    }
  },

  // --- Messages ---
  fetchMessages: async (channelId, before) => {
    const params = before ? `?before=${before}&limit=30` : '?limit=30'
    const msgs = await api(`/channels/${channelId}/messages${params}`)
    const arr = msgs || []
    set((s) => ({
      messages: before ? [...s.messages, ...arr] : arr,
      hasMoreMessages: arr.length >= 30,
    }))
  },

  sendMessage: async (channelId, content) => {
    await api(`/channels/${channelId}/messages`, {
      method: 'POST',
      body: { content },
    })
  },

  loadMoreMessages: async () => {
    const { activeChannel, messages } = get()
    if (!activeChannel || messages.length === 0) return
    const oldest = messages[messages.length - 1]
    await get().fetchMessages(activeChannel.id, oldest.id)
  },

  // --- DMs ---
  fetchDMs: async () => {
    const dms = await api('/dms')
    set({ dms: dms || [] })
  },

  setActiveDM: (dm) => {
    set({ activeDM: dm, activeChannel: null, dmMessages: [], hasMoreDMMessages: true })
    if (dm) {
      get().fetchDMMessages(dm.id)
      get()._subscribe(`dm:${dm.id}`)
    }
  },

  fetchDMMessages: async (dmId, before) => {
    const params = before ? `?before=${before}&limit=30` : '?limit=30'
    const msgs = await api(`/dms/${dmId}/messages${params}`)
    const arr = msgs || []
    set((s) => ({
      dmMessages: before ? [...s.dmMessages, ...arr] : arr,
      hasMoreDMMessages: arr.length >= 30,
    }))
  },

  sendDMMessage: async (dmId, content) => {
    await api(`/dms/${dmId}/messages`, {
      method: 'POST',
      body: { content },
    })
  },

  openDM: async (userId) => {
    const dm = await api('/dms', { method: 'POST', body: { user_id: userId } })
    set((s) => {
      const exists = s.dms.find((d) => d.id === dm.id)
      return { dms: exists ? s.dms : [dm, ...s.dms] }
    })
    return dm
  },

  // --- Members ---
  fetchMembers: async (guildId) => {
    const members = await api(`/guilds/${guildId}/members?limit=100`)
    set({ members: members || [] })
  },

  // --- WebSocket ---
  connectWS: () => {
    const existing = get().ws
    if (existing && existing.readyState <= 1) return

    const ws = createWS()
    set({ ws })

    ws.onmessage = (evt) => {
      try {
        const msg = JSON.parse(evt.data)
        get()._handleWSMessage(msg)
      } catch {}
    }

    ws.onclose = () => {
      set({ ws: null })
      // Auto-reconnect after 2s
      setTimeout(() => {
        if (getToken()) get().connectWS()
      }, 2000)
    }
  },

  disconnectWS: () => {
    const ws = get().ws
    if (ws) ws.close()
    set({ ws: null })
  },

  _subscribe: (room) => {
    const ws = get().ws
    if (ws && ws.readyState === 1) {
      ws.send(JSON.stringify({ type: 'SUBSCRIBE', room }))
    }
  },

  _handleWSMessage: (msg) => {
    const { activeChannel, activeDM } = get()

    if (msg.type === 'MESSAGE_CREATE' && activeChannel && msg.channel_id === activeChannel.id) {
      set((s) => ({ messages: [msg, ...s.messages] }))
    }

    if (msg.type === 'DIRECT_MESSAGE_CREATE' && activeDM && msg.thread_id === activeDM.id) {
      set((s) => ({ dmMessages: [msg, ...s.dmMessages] }))
    }
  },
}))
