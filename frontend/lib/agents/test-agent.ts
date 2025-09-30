import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";

/**
 * Simple test agent to verify LangChain + OpenAI integration
 * This will be expanded into more complex agents later
 */
export async function createTestAgent() {
  // Initialize the OpenAI model
  const model = new ChatOpenAI({
    modelName: "gpt-4o-mini",
    temperature: 0.7,
  });

  // Create a simple prompt template
  const prompt = ChatPromptTemplate.fromMessages([
    ["system", "You are a helpful CRM assistant."],
    ["human", "{input}"],
  ]);

  // Create a simple chain
  const outputParser = new StringOutputParser();
  const chain = prompt.pipe(model).pipe(outputParser);

  return chain;
}

/**
 * Test the agent with a simple query
 */
export async function testAgent(query: string) {
  const agent = await createTestAgent();
  const response = await agent.invoke({
    input: query,
  });
  return response;
}
