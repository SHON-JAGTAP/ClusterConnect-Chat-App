@echo off
echo =======================================================
echo Enabling Claude Code Experimental Agent Teams
echo =======================================================
set CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1

echo Starting Claude Code Team...
echo.
claude --teammate-mode auto -p "I am working on the ClusterConnect real-time chat application. Please create an agent team to analyze the codebase and help me improve it. Form a team with the following 3 roles: 1. Frontend Specialist to analyze the React+Vite frontend for performance and UX. 2. Backend Architect to analyze the Node.js+Express backend architecture, including Socket.IO, Kafka, and Redis caching. 3. Security Specialist to audit our full stack for vulnerabilities."
echo.
pause
