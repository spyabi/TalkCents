import { getToken } from './auth'; // token
import type { Message, Expense } from '../screens/ChatBotScreen.tsx';

// export type ChatMessageContent =
//   | { type: 'text'; text: string }
//   | { type: 'image_url'; image_url: { url: string } };

// export type ChatHistory = {
//   role: 'user' | 'assistant';
//   content: ChatMessageContent[];
// };

const API_URL = 'https://talkcents-backend-7r52622dga-as.a.run.app/docs#/llm';
const API_EXPENDITURE_URL = 'https://talkcents-backend-7r52622dga-as.a.run.app/docs#/expenditure'

export async function sendChatMessage(messages: Message[]) {
//   future check for token
//   const token = await getToken();
//   if (!token) throw new Error('No token found');
  console.log('permissions', messages);
    const response = await fetch(`${API_URL}/chat`, {
    method: 'POST',
    headers: {
//       'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ chat_history: messages }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Chat API error: ${errText}`);
  }

  return await response.json();
}

export async function transcribeAudio(audioUri: string) {
  // Create form data for the upload
  const formData = new FormData();
  console.log('permissions', audioUri)

  // File object
  const file: any = {
    uri: audioUri,
    type: 'audio/mp4', // depending on your file
    name: 'audio.mp4',
  };
  formData.append('file', file);

  // Send the file to your FastAPI endpoint
  const response = await fetch(`${API_URL}/transcribe-audio/`, {
    method: 'POST',
    headers: {
      // 'Authorization': `Bearer ${token}`, // if needed
      'Content-Type': 'multipart/form-data',
    },
    body: formData,
  });

  // Handle response
  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Transcription API error: ${errText}`);
  }

  return await response.json(); // should return transcription text from backend
}

export async function createApprovedExpense(expenses: Expense[]) {
//   future check for token
  const token = await getToken();
  if (!token) throw new Error('No token found');
  console.log('permissions', "EXPENSES IM POSTING ARE", expenses);
  const response = await fetch(`${API_EXPENDITURE_URL}/bulk`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(expenses),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Chat API error: ${errText}`);
  }

  return await response.json();
}

// not needed for now
// const getMimeType = (uri: string) => {
//   const ext = uri.split('.').pop();
//   switch(ext) {
//     case 'm4a': return 'audio/m4a';
//     case 'mp3': return 'audio/mpeg';
//     case 'wav': return 'audio/wav';
//     default: return 'application/octet-stream';
//   }
// };