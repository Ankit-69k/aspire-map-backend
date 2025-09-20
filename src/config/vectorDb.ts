import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import { PineconeStore } from '@langchain/pinecone';
import { Pinecone } from '@pinecone-database/pinecone';

// Init Pinecone client
const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
});

// Reference an existing index
const pineconeIndex = pinecone.Index('career-guidance');

// Setup embeddings
const embeddings = new GoogleGenerativeAIEmbeddings({
  apiKey: process.env.GOOGLE_API_KEY!,
  model: 'models/embedding-001', // recommended
});

// LangChain Vector Store
export const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
  pineconeIndex,
});
