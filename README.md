# WasteIQ Event Reindexer

## Start in Docker Services

Given the rediculous name, my-mongo:

```
docker run -it -e MONGO_URL=mongodb://my-mongo:27017/main -e COMMAND_URL=http://events-cmd-reducer/command --rm  --name event-reindexer --network services  wasteiq/event-reindexer sh
```

