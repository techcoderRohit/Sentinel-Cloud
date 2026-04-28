const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini — reads key from .env
const getModel = () => {

  const apiKey = process.env.GEMINI_KEY;
  console.log('--- Gemini Initialization ---');
  console.log('Key Present:', !!apiKey);
  console.log('Key Length:', apiKey ? apiKey.length : 0);

  if (!apiKey) {
    throw new Error('GEMINI_KEY is not configured. Add your key to backend/.env file.');
  }
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
};

/**
 * Analyze sensor data using Gemini AI
 * @param {Array} sensorData - Array of sensor readings with payload & timestamp
 * @param {String} deviceName - Human-readable device name
 * @param {String} feed - Optional specific field to focus on (e.g., 'temperature')
 * @returns {Object} Structured analysis result
 */
const analyzeSensorData = async (sensorData, deviceName = 'Unknown Device', feed = null) => {
  const model = getModel();

  // Format sensor data into a readable table for the AI
  const dataTable = sensorData.map((reading, i) => {
    const temp = reading.payload?.temperature ?? 'N/A';
    const hum = reading.payload?.humidity ?? 'N/A';
    const motion = reading.payload?.motion ?? 'N/A';
    const status = reading.payload?.status ?? 'N/A';
    const time = new Date(reading.timestamp).toLocaleString();

    if (feed) {
      const val = reading.payload?.[feed] ?? 'N/A';
      return `${i + 1}. Time: ${time} | ${feed.toUpperCase()}: ${val}`;
    }

    return `${i + 1}. Time: ${time} | Temp: ${temp}°C | Humidity: ${hum}% | Motion: ${motion} | Status: ${status}`;
  }).join('\n');

  const focusInstruction = feed ? `Specifically focus your analysis on the "${feed}" feed.` : "Analyze the overall health and trends of all available sensor data.";

  const prompt = `You are an expert IoT data analyst for Sentinel Cloud platform. Analyze the following sensor telemetry data from device "${deviceName}" and provide a comprehensive analysis.

DATA (${sensorData.length} readings, chronological order):
${dataTable}

${focusInstruction}

RESPOND IN STRICT JSON FORMAT (no markdown, no code blocks, just raw JSON):
{
  "summary": "A 2-3 sentence plain-English summary describing overall data trends, patterns, and behavior. Write it so anyone can understand, like: 'Your device recorded stable temperature around 25°C with a sudden spike to 42°C at 2:30 PM, which could indicate...'",
  "healthScore": <number 0-100, where 100=perfect, 80-99=good, 50-79=needs attention, below 50=critical>,
  "anomalies": [
    {
      "type": "<spike|drop|offline|erratic|threshold_breach>",
      "severity": "<normal|warning|critical>",
      "message": "Clear human-readable description of what went wrong and when",
      "timestamp": "The approximate time when this anomaly occurred"
    }
  ],
  "insights": [
    "Actionable recommendation 1 (e.g., 'Consider checking if the cooling system near this sensor is functioning properly')",
    "Actionable recommendation 2",
    "Actionable recommendation 3"
  ]
}

ANALYSIS RULES:
- Temperature above 40°C or below 5°C is CRITICAL
- Temperature above 35°C or below 10°C is WARNING  
- Humidity above 85% or below 20% is WARNING
- Sudden changes (>10 units change between consecutive readings) are anomalies
- If all readings are stable and within normal range, return an empty anomalies array and healthScore close to 95-100
- Always provide at least 2 insights even if data looks normal
- Keep the summary conversational and easy to understand`;

  let responseText;
  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    responseText = response.text();

    if (!responseText) {
      throw new Error('Gemini returned an empty response. This might be due to safety filters or quota limits.');
    }
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw new Error(`AI generation failed: ${error.message}`);
  }

  // Parse AI response — handle potential markdown wrapping
  let parsed;
  try {
    // Try direct JSON parse first
    parsed = JSON.parse(responseText);
  } catch (e) {
    // If Gemini wrapped it in ```json ... ```, extract the JSON
    const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      try {
        parsed = JSON.parse(jsonMatch[1].trim());
      } catch (e2) {
        throw new Error('Failed to parse JSON inside code blocks');
      }
    } else {
      // Last resort: try to find JSON object in the response
      const braceMatch = responseText.match(/\{[\s\S]*\}/);
      if (braceMatch) {
        try {
          parsed = JSON.parse(braceMatch[0]);
        } catch (e3) {
          throw new Error('Failed to parse JSON object from text');
        }
      } else {
        console.log('Raw AI Response:', responseText);
        throw new Error('Failed to parse AI response as JSON. See logs for raw output.');
      }
    }
  }

  // Validate and sanitize the response
  return {
    summary: parsed.summary || 'Analysis completed but no summary was generated.',
    healthScore: Math.min(100, Math.max(0, Number(parsed.healthScore) || 50)),
    anomalies: Array.isArray(parsed.anomalies) ? parsed.anomalies.map(a => ({
      type: a.type || 'unknown',
      severity: ['normal', 'warning', 'critical'].includes(a.severity) ? a.severity : 'normal',
      message: a.message || 'Anomaly detected',
      timestamp: a.timestamp || 'Unknown'
    })) : [],
    insights: Array.isArray(parsed.insights) ? parsed.insights : ['No specific insights generated.']
  };
};

module.exports = { analyzeSensorData };
