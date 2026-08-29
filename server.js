const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 3000;
const API_KEY = process.env.OPENAI_API_KEY;

const server = http.createServer(async (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
res.setHeader("Access-Control-Allow-Headers", "Content-Type");

if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
}

    // Show JARVIS website
    if (req.method === "GET" && req.url === "/") {
        const html = fs.readFileSync(
            path.join(__dirname, "index.html")
        );

        res.writeHead(200, {
            "Content-Type": "text/html"
        });

        res.end(html);
        return;
    }

    // Talk to OpenAI
    if (req.method === "POST" && req.url === "/api/chat") {

        let body = "";

        req.on("data", chunk => {
            body += chunk;
        });

        req.on("end", async () => {

            try {

                const data = JSON.parse(body);

                const response = await fetch(
                    "https://api.openai.com/v1/responses",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${API_KEY}`
                        },

                        body: JSON.stringify({
                            model: "gpt-5.6-luna",
                            input: data.message
                        })
                    }
                );

                const result = await response.json();

                if (!response.ok) {
                    throw new Error(
                        result.error?.message ||
                        "OpenAI request failed"
                    );
                }

                res.writeHead(200, {
                    "Content-Type": "application/json"
                });

                res.end(JSON.stringify({
                    reply: result.output_text || "I couldn't generate a response."
                }));

            } catch (error) {

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
    res.end("Not found");
});

server.listen(PORT, () => {
    console.log(`JARVIS is running on port ${PORT}`);
});
