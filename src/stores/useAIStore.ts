'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { generateId } from '@/lib/utils'
import type { AIMessage, AISignal, AIModel } from '@/types/ai'

interface AIState {
  messages: AIMessage[]
  signals: AISignal[]
  selectedModel: AIModel
  isAnalyzing: boolean
  streamingMessageId: string | null
  emailRecipient: string

  addMessage: (msg: Omit<AIMessage, 'id' | 'timestamp'>) => string
  updateMessage: (id: string, updates: Partial<AIMessage>) => void
  clearMessages: () => void
  addSignal: (signal: Omit<AISignal, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateSignal: (id: string, updates: Partial<AISignal>) => void
  setModel: (model: AIModel) => void
  setAnalyzing: (v: boolean) => void
  setStreamingId: (id: string | null) => void
  setEmailRecipient: (email: string) => void
  appendToStream: (id: string, content: string) => void
}

export const useAIStore = create<AIState>()(
  persist(
    immer((set) => ({
      messages: [],
      signals: [],
      selectedModel: 'deepseek/deepseek-v4-flash:free',
      isAnalyzing: false,
      streamingMessageId: null,
      emailRecipient: process.env.NEXT_PUBLIC_DEFAULT_EMAIL ?? 'technobiztrader@gmail.com',

      addMessage: (msg) => {
        const id = generateId()
        set(state => {
          state.messages.push({ ...msg, id, timestamp: Date.now() })
        })
        return id
      },

      updateMessage: (id, updates) =>
        set(state => {
          const msg = state.messages.find(m => m.id === id)
          if (msg) Object.assign(msg, updates)
        }),

      clearMessages: () => set(state => { state.messages = [] }),

      addSignal: (signal) =>
        set(state => {
          state.signals.unshift({
            ...signal,
            id: generateId(),
            createdAt: Date.now(),
            updatedAt: Date.now(),
          })
          if (state.signals.length > 50) state.signals.pop()
        }),

      updateSignal: (id, updates) =>
        set(state => {
          const sig = state.signals.find(s => s.id === id)
          if (sig) Object.assign(sig, { ...updates, updatedAt: Date.now() })
        }),

      setModel: (model) => set(state => { state.selectedModel = model }),
      setAnalyzing: (v) => set(state => { state.isAnalyzing = v }),
      setStreamingId: (id) => set(state => { state.streamingMessageId = id }),
      setEmailRecipient: (email) => set(state => { state.emailRecipient = email }),

      appendToStream: (id, content) =>
        set(state => {
          const msg = state.messages.find(m => m.id === id)
          if (msg) msg.content += content
        }),
    })),
    {
      name: 'technobiz-ai',
      version: 1,
      partialize: (state: AIState) => ({
        selectedModel: state.selectedModel,
        signals: state.signals.slice(0, 20),
        emailRecipient: state.emailRecipient,
      }),
    }
  )
)
