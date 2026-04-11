const express = require('express');
const router = express.Router();

// POST: /api/terminal
router.post('/', async (req, res) => {
    try {
        const { command } = req.body;

        if (!command) {
            return res.status(400).json({ output: "No command provided", color: "#f87171" });
        }

        const cmd = command.toLowerCase().trim();
        let response = {
            output: ""
        };

        // Logic switch case for different commands
        switch (true) {
            case (cmd === 'help'):
                response.output = "Available commands:\n- list: Show all connected nodes\n- status <node_id>: Get node health\n- ping <node_id>: Test connectivity\n- clear: Clear terminal";
                response.color = "#60a5fa"; // Blue
                break;

            case (cmd === 'list'):
                // Real project mein yahan DB se online nodes fetch honge
                response.output = "NODE-01 [online]\nNODE-02 [online]\nNODE-03 [online]\nNODE-04 [offline]";
                response.color = "#4ade80"; // Green
                break;

            case (cmd.startsWith('status')):
                const nodeId = cmd.split(' ')[1] || "Unknown";
                response.output = `${nodeId.toUpperCase()} | temp: 28.1°C | hum: 61% | battery: 67% | status: Warning`;
                response.color = "#fbbf24"; // Yellow/Amber
                break;

            case (cmd.startsWith('ping')):
                const pingNode = cmd.split(' ')[1] || "Gateway";
                response.output = `PING ${pingNode}: 3 packets received, 0% loss, rtt avg 5.2ms`;
                response.color = "#4ade80";
                break;

            case (cmd === 'clear'):
                response.output = "CLEAR_TERMINAL"; // Frontend handle karega is flag ko
                break;

            default:
                response.output = `Command not found: '${command}'. Type 'help' for options.`;
                response.color = "#f87171"; // Red
        }

        res.status(200).json(response);

    } catch (error) {
        console.error("Terminal Error:", error);
        res.status(500).json({ output: "Internal Server Error", color: "#f87171" });
    }
});

module.exports = router;