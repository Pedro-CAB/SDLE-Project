# Shopping Lists on the Cloud

## Project Developed by:
- Filipe Fonseca (up202003474)
- Marcelo Apolinário (up201603903)
- Pedro Gomes (up202006086)

## Important Provided Links
- [Moodle Project Specification](https://moodle2324.up.pt/pluginfile.php/152692/mod_resource/content/2/SDLE_Shopping.pdf)
- [Paper About Amazon Dynamo](https://www.allthingsdistributed.com/files/amazon-dynamo-sosp2007.pdf)
- [Papers on CRDT's](https://crdt.tech/papers.html)
- [About Local-First Software](https://www.inkandswitch.com/local-first/)

## Other Relevant Links
- [Overleaf Intermediate Report](https://www.overleaf.com/project/654a6ce5c7593c6b142634d2)
- [Additional Content on Local-First Software](https://localfirstweb.dev/)

## Project Setup

### Local Server (Node.js)

Setting up the packages should be done with just this command:

```
npm install
```

The dependencies that were installed for initial configuration were the ones specified in the commands below, but ``npm install`` should be enough to install everything on its own.
```
npm install express
npm install sqlite3
```

To start the server, all you need to do is run:
```
npm start
```

The server is hosted in ``localhost:3000``. After running the server, you can [click here](http://localhost:3000/pages/myLists.html) to see the website working in its current version.

## Documentation and Notes
