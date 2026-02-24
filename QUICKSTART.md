# 🎴 Planning Poker - Quick Start Guide

Get your Planning Poker application running in minutes!

## Prerequisites

- **Node.js 18+** - [Download here](https://nodejs.org/)
- **npm** - Comes with Node.js

## Installation (One-time)

### Windows
```bash
setup.bat install
```

### Mac/Linux
```bash
chmod +x setup.sh
./setup.sh install
```

### Manual Installation
```bash
# Server dependencies
cd server
npm install

# Client dependencies
cd ../client
npm install
```

## Running the Application

### Option 1: Automated (Windows)
```bash
setup.bat dev
```

### Option 2: Manual (All platforms)

**Terminal 1 - Start Server:**
```bash
cd server
npm run dev
```

**Terminal 2 - Start Client:**
```bash
cd client
npm run dev
```

Open your browser: **http://localhost:3000**

## Usage Tips

### Host a Session
1. Click "Create Session"
2. Enter your name
3. Copy and share the Session ID with team members
4. Enter a story and click "Start Vote"
5. Team members vote on the cards
6. Click "Reveal Votes" when ready

### Join a Session
1. Click "Join Session"
2. Enter your name
3. Paste the Session ID from the host
4. Vote when the host starts voting

## Troubleshooting

### Connection Issues
- Make sure server is running on port 3001
- Make sure client is running on port 3000
- Check firewall settings

### Dependencies Issues
```bash
# Clear and reinstall
rm -rf node_modules package-lock.json  # Unix/Mac
rmdir /s node_modules                   # Windows
npm install
```

### Port Already in Use
Change the ports in:
- **Server**: Edit `server/server.ts` (PORT variable)
- **Client**: Edit `client/app/page.tsx` (socket URL)

## Features

✅ Real-time collaboration with Socket.io
✅ Fibonacci estimation scale  
✅ Vote reveal control (prevent early voting bias)
✅ Multiple voting rounds
✅ Participant presence tracking
✅ Clean, modern UI with Tailwind CSS

## Architecture

```
planning-poker/
├── server/          # Express.js + Socket.io backend
│   ├── server.ts    # Main server logic
│   └── package.json # Server dependencies
├── client/          # Next.js React frontend
│   ├── app/         # Next.js app directory
│   ├── components/  # React components
│   └── package.json # Client dependencies
└── README.md        # Full documentation
```

## Need Help?

1. Check [README.md](./README.md) for detailed documentation
2. Check the browser console for client errors
3. Check terminal for server errors

## Next Steps

- Customize estimation scales
- Add database persistence
- Deploy to production
- Integrate with Jira/Azure DevOps

Happy Planning! 🚀
