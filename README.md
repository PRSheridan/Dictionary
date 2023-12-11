<larger>Dictionary API Project</larger>

<u>Overview</u>:

This website uses [Free Dictionary API](https://dictionaryapi.dev/) to look-up and display definitions and pronunciation of a given word. It also implements a json server to save a list of favorites that store between page refreshes. 

The json server can be installed using the command: 
```
npm install -g json-server
```

When the page loads, the favorites list is built first and minimized definitions. A **search bar** is provided for accessing data from the dictionary API, upon submitting the data is formatted into a **phonetic transcription** of the word and a **list of definitions**. A **favorite button** displays to the right of the header line of the word. When **add to favorites** is clicked, the data is pushed to the local server, and displayed in the **favorites list** below. A remove from favorites button is also added to the right of the header line. 

<u>Features</u>:

- Word Search
	- Dictionary API fetch + sorting
	- Local Server Favorites 
- Hiding/Showing lists
	- Favorites are hidden by default
- Add/Remove from favorites list
	- Cannot add word duplicates

<u>Example</u>:



In this example, ‘test’ returns the following data:
https://api.dictionaryapi.dev/api/v2/entries/en/test

<u>Future Plans</u>:

- History list below favorites
- Cleaner formatting
- Option to view etymology (history of each word)

<u>Contact Me</u>:
[PRSheridan (github.com)](https://github.com/PRSheridan)
philrsheridan@gmail.com
