export type VoiceStatus = 'pending' | 'training' | 'ready' | 'paused' | 'deleted';

export type Voice = {
  id: string;
  familyId: string;
  donorUserId: string;
  displayName: string;
  roleLabel: string;
  status: VoiceStatus;
  consent: {
    textHash: string;
    audioUrl: string;
    signedAt: string;
    signerName: string;
    revocationAt?: string;
  } | null;
  providerRef?: string;
  style: 'clone' | 'near_voice';
  createdAt: string;
};

export type Child = {
  firstName: string;
  dob?: string;
};

export type Family = {
  id: string;
  ownerUserId: string;
  name: string;
  children: Child[];
  createdAt: string;
};

export type Story = {
  id: string;
  familyId: string;
  templateId: string;
  voiceId: string;
  title: string;
  params: {
    childName: string;
    petName?: string;
    theme: string;
    length: number;
  };
  audioUrl: string;
  durationSec: number;
  createdBy: string;
  createdAt: string;
};

export type User = {
  id: string;
  email: string;
  role: 'PA' | 'VD';
  familyId: string;
  createdAt: string;
};
