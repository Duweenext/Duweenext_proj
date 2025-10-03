import { create } from "zustand";

export type DeleteAccountStep = "verify-password" | "verify-code" | "confirm" | null;

export type VerificationResponse = {
  message: string;
  verification_id: string;
  sent_to: string;
  challenge_token: string;
};

type DeleteAccountState = {
  step: DeleteAccountStep;
  verificationResponse?: VerificationResponse | null;

  // actions
  setStep: (step: DeleteAccountStep) => void;
  setVerificationResponse: (resp: VerificationResponse) => void;
  reset: () => void;
};

export const useDeleteAccountStore = create<DeleteAccountState>((set) => ({
  step: null,
  verificationResponse: null,

  setStep: (step) => set({ step }),
  setVerificationResponse: (resp) => set({ verificationResponse: resp }),
  reset: () => set({ step: null, verificationResponse: null }),
}));
