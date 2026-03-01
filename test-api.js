fetch("http://localhost:3000/api/ai/suggest-versions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nodeData: { type: "server", subtype: "web_server", label: "Web Server" } })
}).then(r => r.json()).then(console.log).catch(console.error);
