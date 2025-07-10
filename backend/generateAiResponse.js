const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const generateAiResponse = async (code) => {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  const prompt = `Given the following code, analyze and provide ONLY the time complexity and space complexity.\n\nCode:\n${code}`;
  const result = await model.generateContent([prompt]);
  const response = await result.response;
  return response.text();
};

module.exports = generateAiResponse; 