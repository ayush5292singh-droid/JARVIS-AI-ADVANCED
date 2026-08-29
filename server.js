const http = require("http");

const PORT = process.env.PORT || 3000;
const API_KEY = process.env.OPENAI_API_KEY;

const server = http.createServer((req, res) => {

    // Allow GitHub Pages to talk to Render
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    // Browser check
    if (req.method === "OPTIONS") {
        res.writeHead(204);
        res.end();
        return;
    }

    // Test the server
    if (req.method === "GET" && req.url === "/") {
        res.writeHead(200, {
            "Content-Type": "text/plain"
        });

        res.end("JARVIS brain is online.");
        return;
    }

    // AI chat
    if (req.method === "POST" && req.url === "/api/chat") {

        let body = "";

        req.on("data", chunk => {
            body += chunk;
        });

        req.on("end", async () => {

            try {

                const { message } = JSON.parse(body);

                if (!message) {
                    throw new Error("No message received.");
                }

                if (!API_KEY) {
                    throw new Error("OPENAI_API_KEY is missing.");
                }

                const response = await fetch(
                    "https://api.openai.com/v1/responses",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${API_KEY}`
                        },

                        body: JSON.stringify({
                            model: "gpt-5",
                            input: [
                                {
                                    role: "system",
                                    content: "You are JARVIS, a helpful futuristic AI assistant. Keep answers clear and friendly."
                                },
                                {
                                    role: "user",
                                    content: message
                                }
                            ]
                        })
                    }
                );

                const result = await response.json();

                if (!response.ok) {
                    throw new Error(
                        result.error?.message || "OpenAI request failed."
                    );
                }

                res.writeHead(200, {
                    "Content-Type": "application/json"
                });

                res.end(JSON.stringify({
                    reply: result.output_text || "JARVIS could not generate a response."
                }));

            } catch (error) {

                console.error("JARVIS ERROR:", error.message);

                res.writeHead(500, {
                    "Content-Type": "application/json"
                });

                res.end(JSON.stringify({
                    error: error.message
                }));
            }
        });

        return;
    }

    res.writeHead(404);
    res.end("Not found.");
});

server.listen(PORT, () => {
    console.log("JARVIS brain is live on port " + PORT);
});
