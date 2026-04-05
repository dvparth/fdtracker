const supportedProviders = ['openai', 'huggingface'];

function getProvider() {
  const provider = (process.env.AI_PROVIDER || 'huggingface').toLowerCase();
  if (!supportedProviders.includes(provider)) {
    throw new Error(`Unsupported AI_PROVIDER: ${provider}. Supported values: ${supportedProviders.join(', ')}`);
  }
  return provider;
}

function buildPortfolioPrompt(portfolioDetails) {
  return `You are a Financial Assist.
Summarize the provided portfolio data in exactly 3-4 concise lines.
Do not include investment advice, disclaimers, or extra commentary.
Focus on overall profit/loss, recent change, and portfolio concentration where it is useful.
Numbers in the response must be rounded to the nearest whole number and include a % sign for percentages.
Use "profit" or "loss" to indicate performance, and "up" or "down" for recent changes.
Strictly Use Indian Rupees (₹) for currency values.Don't use any other currency symbols.
Ensure Fund names are rationalized.
Portfolio input:
${JSON.stringify(portfolioDetails, null, 2)}`;
}

function normalizeResponseText(rawText) {
  if (!rawText || typeof rawText !== 'string') {
    return '';
  }

  const lines = rawText
    .trim()
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) {
    return '';
  }

  if (lines.length > 4) {
    return lines.slice(0, 4).join('\n');
  }

  return lines.join('\n');
}

async function callOpenAI(prompt) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is required for OpenAI provider.');
  }

  const apiBase = process.env.OPENAI_API_BASE || 'https://api.openai.com/v1';
  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';

  const response = await fetch(`${apiBase}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: 'You are a Financial Assist.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.4,
      max_tokens: 220,
    }),
  });

  const text = await response.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch (e) {
    throw new Error(`OpenAI returned invalid JSON (${response.status}): ${text.substring(0, 200)}`);
  }

  if (!response.ok) {
    const errorMessage = data?.error?.message || JSON.stringify(data);
    throw new Error(`OpenAI request failed (${response.status}): ${errorMessage}`);
  }

  return data?.choices?.[0]?.message?.content || '';
}

async function callHuggingFace(prompt, modelOverride = null) {
  const apiKey = process.env.HUGGINGFACE_API_KEY;
  const model = modelOverride || process.env.HUGGINGFACE_MODEL || 'Qwen/Qwen2.5-7B-Instruct';
  if (!apiKey) {
    throw new Error('HUGGINGFACE_API_KEY is required for HuggingFace provider.');
  }

  // Define model capabilities - only chat/instruction models work with chat completions
  const chatModels = [
    'Qwen/Qwen2.5-7B-Instruct',
    'microsoft/DialoGPT-medium',
    'microsoft/DialoGPT-large',
    'meta-llama/Llama-2-7b-chat-hf',
    'meta-llama/Llama-2-13b-chat-hf',
    'mistralai/Mistral-7B-Instruct-v0.1'
  ];

  const isChatModel = chatModels.some(chatModel => model.includes(chatModel.split('/')[1]) || model === chatModel);

  if (!isChatModel) {
    throw new Error(`Model ${model} is not supported for chat completions. Only instruction/chat models work with this endpoint.`);
  }

  console.log(`[HuggingFace] Using model: ${model}, isChatModel: ${isChatModel}`);

  // Use chat completions endpoint for supported models
  const response = await fetch('https://router.huggingface.co/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      messages: [
        { role: 'system', content: 'You are a helpful financial assistant. Provide concise, accurate summaries.' },
        { role: 'user', content: prompt }
      ],
      model: model,
      stream: false,
      max_tokens: 150,
      temperature: 0.4,
    }),
  });

  const text = await response.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch (e) {
    throw new Error(`HuggingFace returned invalid JSON (${response.status}): ${text.substring(0, 200)}`);
  }

  if (!response.ok) {
    const errorMessage = data?.error?.message || data?.message || JSON.stringify(data);
    console.log('[HuggingFace] Full error response:', JSON.stringify(data, null, 2));
    throw new Error(`HuggingFace request failed (${response.status}): ${errorMessage}`);
  }

  const content = data?.choices?.[0]?.message?.content || '';
  console.log('[HuggingFace] Response data structure:', JSON.stringify(data, null, 2));
  console.log('[HuggingFace] Response content:', content.substring(0, 200));
  return content;
}

async function summarizePortfolio(portfolioDetails, modelOverride = null) {
  const provider = getProvider();

  const prompt = buildPortfolioPrompt(portfolioDetails);
  let rawText;
  if (provider === 'openai') {
    rawText = await callOpenAI(prompt);
  } else if (provider === 'huggingface') {
    rawText = await callHuggingFace(prompt, modelOverride);
  } else {
    throw new Error(`Unsupported provider: ${provider}`);
  }

  const result = normalizeResponseText(rawText);
  if (!result) {
    throw new Error('The AI provider returned an empty summary.');
  }

  return result;
}

module.exports = {
  summarizePortfolio,
};
