const http = require("http");

const PORT = process.env.PORT || 3000;
const API_KEY = process.env.OPENAI_API_KEY;

const server = http.createServer((req, res) => {

    // CORS
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    // Browser preflight
    if (req.method === "OPTIONS") {
        res.writeHead(204);
        res.end();
        return;
    }

    // Test
    if (req.method === "GET" && req.url === "/") {
        res.writeHead(200, {
            "Content-Type": "text/plain"
        });

        res.end("JARVIS brain is online.");
        return;
    }

    // Chat
    if (req.method === "POST" && req.url === "/api/chat") {

        let body = "";

        req.on("data", chunk => {
            body += chunk;
        });

        req.on("end", async () => {

            try {

                const data = JSON.parse(body);

                if (!data.message) {
                    throw new Error("Message is empty.");
                }

                if (!API_KEY) {
                    throw new Error("OPENAI_API_KEY is missing in Render.");
                }

                const openaiResponse = await fetch(
                    "https://api.openai.com/v1/responses",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": "Bearer " + API_KEY
                        },

                        body: JSON.stringify({
                            model: "gpt-5",
                            input: data.message
                        })
                    }
                );

                const result = await openaiResponse.json();

                if (!openaiResponse.ok) {
                    throw new Error(
                        result.error?.message ||
                        "OpenAI request failed."
                    );
                }

                res.writeHead(200, {
                    "Content-Type": "application/json"
                });

                res.end(JSON.stringify({
                    reply: result.output_text || "No response received."
                }));

            } catch (error) {

                console.error("JARVIS ERROR:", error);

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

    res.writeHead(404, {
        "Content-Type": "text/plain"
    });

    res.end("Not found.");
});

server.listen(PORT, () => {
    console.log("JARVIS brain running on port " + PORT);
});
