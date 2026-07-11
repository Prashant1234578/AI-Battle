import express from "express"
import runGraph from "./ai/graph.ai.js"

const app = express();

// Custom CORS middleware to allow calls from Vite development server
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  if (req.method === "OPTIONS") {
    res.sendStatus(200);
    return;
  }
  next();
});

// JSON body parser middleware
app.use(express.json());

// Main chat route that runs the LangGraph
app.post('/api/chat', async (req, res) => {
  try {
    const { problem } = req.body;
    if (!problem || typeof problem !== 'string') {
      res.status(400).json({ error: "Missing or invalid 'problem' field in request body." });
      return;
    }
    
    console.log(`[Backend] Processing problem: "${problem.substring(0, 50)}${problem.length > 50 ? '...' : ''}"`);
    const result = await runGraph(problem);
    console.log(`[Backend] Completed processing. Sending evaluation results.`);
    res.json(result);
  } catch (error: any) {
    console.error("[Backend] Error running LangGraph:", error);
    res.status(500).json({ error: error.message || "Failed to process chat query." });
  }
});

// Keep GET / for health checks and fallback demo
app.get('/', async (req, res) => {
  try {
    const demoPrompt = "write code for the factorial function in js";
    console.log(`[Backend] GET / request. Running demo prompt: "${demoPrompt}"`);
    const result = await runGraph(demoPrompt);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to run demo graph." });
  }
});

export default app;