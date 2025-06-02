# LP TRACKER

Discord bot to track League of Legends ranked progress (LP, matches, performance, etc.).

[→ Invite the bot](https://discord.com/oauth2/authorize?client_id=1377617644185845852&permissions=2147600400&integration_type=0&scope=bot+applications.commands)

---

## 🧱 Local Development

- Start server (watchmode)

```bash
npm install;
npm run start:dev;
```

- Database cmds

```bash
docker compose up -d     # Start MongoDB container
docker compose down      # Stop container but keep data
docker compose down -v   # Stop and delete container + volume

docker exec -it lp_tracker_mongo mongosh "mongodb://localhost:27017" -u root -p root

use lp_tracker
show collections
db.players.find().pretty()
db.matches.find().count()

```

### Code Quality

```bash
npx eslint . --ext .ts --fix   # Lint & fix TypeScript files
```

---

## 🧪 Tests

Todo

---

## 🛠️ Todos

- [ ] ✅ Test properly
- [ ] 🛠️ Add support for automatic ranked LP snapshots
- [ ] 🛠️ Add command to fetch match history
- [ ] 🔐 Improve role-based access (admin-only commands)
- [ ] 📦 Add CI/CD (tests + lint)
- [ ] 📜 Improve Discord command usage/help

---

## 📁 Project Structure

```
src/
├── config/             # Configuration layer (env vars, ConfigService abstraction)
├── features/           # features grouped by responsibility
│   ├── discord/        # Discord bot integration: commands, events, client setup
│   ├── riot/           # Riot API abstraction: typed DTOs, external service logic
│   └── tracker/        # Core tracking logic: match polling, event emitters
├── persistence/        # Database layer: Mongoose schemas and repositories
├── logger/             # Application-wide logger based on pino
```
