# WasteIQ Event Reindexer

Find import commands and eventBlocks. Then allow the user to re-index and/or delete things.

## Start in Docker Services

Given the rediculous name, my-mongo:

```
docker run -it -e MONGO_URL=mongodb://my-mongo:27017/main -e COMMAND_URL=http://events-cmd-reducer:3000/command --rm  --name event-reindexer --network services  wasteiq/event-reindexer sh
```

## Visual Framework

Consider to move to [ink](https://github.com/vadimdemedes/ink) which is a react framework for command line apps.  See also: https://github.com/vadimdemedes/ink-select-input

