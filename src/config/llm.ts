import { ChatGoogleGenerativeAI } from '@langchain/google-genai';

const llm = new ChatGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_API_KEY,
  model: 'gemini-2.0-flash',
});

export default llm;
