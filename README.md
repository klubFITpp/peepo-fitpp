# Peepo FIT++
This is the official GitHub repository of the FIT++ Discord app, used [here](https://discord.gg/2Bh93cXGJ3)!

## Project Structure
```
src/
├── commands/       # Discord slash commands
│   ├── fun/       # Fun/entertainment commands
│   └── utility/   # Utility commands
├── events/        # Discord event handlers
│   └── utility/   # Utility event handlers
├── models/        # Database models
├── config/        # Configuration files
├── utils/         # Helper functions and cache
└── index.js       # Main entry point

scripts/           # Utility scripts
├── deploy-commands.js
└── deploy-models.js
```

## Scripts
- `npm start` - Start the bot
- `npm run dev` - Start the bot with nodemon (auto-restart)
- `npm run deploy:commands` - Deploy slash commands
- `npm run deploy:models` - Sync database models

