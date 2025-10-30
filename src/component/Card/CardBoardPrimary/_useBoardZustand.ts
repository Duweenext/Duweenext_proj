import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type FrequencyUnit = 'second' | 'minute' | 'hour' | 'day' | 'week';

interface BoardFrequencyState {
  boardFrequencies: Record<
    string,
    {
      frequency: number;
      frequencyUnit: FrequencyUnit;
    }
  >;
  setBoardFrequencyLocal: (
    boardId: string,
    frequency: number,
    unit: FrequencyUnit
  ) => void;
  getBoardFrequencyLocal: (
    boardId: string
  ) =>
    | {
        frequency: number;
        frequencyUnit: FrequencyUnit;
      }
    | undefined;
  resetBoardFrequencyLocal: (boardId: string) => void;
}

export const useBoardFrequency = create<BoardFrequencyState>()(
  persist(
    (set, get) => ({
      boardFrequencies: {},

      setBoardFrequencyLocal: (boardId, frequency, unit) =>
        set((state) => ({
          boardFrequencies: {
            ...state.boardFrequencies,
            [boardId]: { frequency, frequencyUnit: unit },
          },
        })),

      getBoardFrequencyLocal: (boardId) =>
        get().boardFrequencies[boardId] ?? undefined,

      resetBoardFrequencyLocal: (boardId) =>
        set((state) => {
          const updated = { ...state.boardFrequencies };
          delete updated[boardId];
          return { boardFrequencies: updated };
        }),
    }),
    { name: 'board-frequency-storage' }
  )
);
