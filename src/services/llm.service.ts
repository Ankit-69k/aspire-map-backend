import llm from '#config/llm.ts';
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { DocxLoader } from '@langchain/community/document_loaders/fs/docx';
import { getResumeParserPrompt } from '../prompts/resumeParser.ts';

class LLMService {
  private llm: typeof llm;
  constructor() {
    this.llm = llm;
  }

  async parseResume(filePath: string, mimetype: string) {
    let loader;

    if (mimetype === 'application/pdf') {
      loader = new PDFLoader(filePath);
    } else if (
      mimetype ===
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      loader = new DocxLoader(filePath);
    } else {
      throw new Error('Only PDF and DOCX formats are supported');
    }

    // Step 1: Load raw text from file
    const docs = await loader.load();
    const extractedData = docs.map(d => d.pageContent).join('\n');

    // Step 2: Build structured parsing prompt
    const prompt = getResumeParserPrompt(extractedData);

    // Step 3: Call the LLM with the prompt
    const response = await this.llm.invoke(prompt);
    let rawOutput = response.content as string;

    // Step 4: Clean up ```json or ``` wrappers
    rawOutput = rawOutput
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();

    // Step 5: Parse JSON safely
    try {
      const structuredData = JSON.parse(rawOutput);
      return structuredData;
    } catch (err) {
      console.error('Failed to parse LLM output:', rawOutput);
      throw new Error('Invalid JSON returned from LLM');
    }
  }
}

export default new LLMService();
