//initialize critical variables
let wordChoice = "default";
const favUrl = `http://localhost:3000/favorites`;
const GETconfig = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
    },
};

//DOMContentLoaded
//when clicking search the api returns the words json information
//remove previous children and call buildWord on reducedDefinitions
document.addEventListener('DOMContentLoaded', () => {
    document.addEventListener('submit', (event) => {
        event.preventDefault(); 
        tempCont = document.getElementById('word-container');
        while (tempCont.firstChild) {
            tempCont.removeChild(tempCont.lastChild);
        }
        wordChoice = event.target.search.value;
        const getWordUrl = `https://api.dictionaryapi.dev/api/v2/entries/en/${wordChoice}`;
        console.log(getWordUrl)

        fetch(getWordUrl, GETconfig) 
        .then(function(response) {
            return response.json();
        })
        .then(function(data) {
            let reducedDefinitions = reduceDefinitions(data);
            reducedDefinitions['word'] = wordChoice;
            console.log(reducedDefinitions)
            buildWord(data, reducedDefinitions, document.getElementById('word-container'))
//really broken version of updating favorites list- working on fixing might need to refresh on 
//how to run the local server && how to input my words data (currently not sure if my POSTconfig is good)

            let favBtn = document.getElementById('fav-button');
            let tempWord = {
                "name": document.getElementById('current-word').textContent,
                "values": {
                  "pronunciation": document.getElementById('current-phonetics'),
                  "definitions": reducedDefinitions,
                      }   
                  };
            buildFavorites(tempWord, reducedDefinitions);
            favBtn.addEventListener('click', () => {
                event.preventDefault();
                const POSTconfig = {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      "Accept": "application/json",
                    },
                    body: JSON.stringify(tempWord)
                };
                fetch(favUrl, POSTconfig)
                .then(function(response) {
                    return response.json();
                })
                .then(function(data) {
//NEXT create a buildFavorites function that takes all the posted information about a favorited word and creates a builds a card
//very likely will need to restructure buildWord to create a cleaner organization of PRE-html data i.e. create an object with
//all needed information then build the card based on that data rather than individual variables.
                    buildFavorites(tempWord, reducedDefinitions);
                });
            });
        });
    });
});

function buildFavorites(fullData, definitions) {
    fetch(favUrl, GETconfig)
    .then(function(response) {
        return response.json()
    })
    .then(function(data) {
        console.log(data)
        buildWord(fullData, definitions, document.getElementById('fav-container'))
    })
}

//buildWord is used to display the data retrieved about the word.
//sub-functions are called for specific tasks: buildDefinitions, buildHistory...
function buildWord(data, definitions, location) {

    let newWord = document.createElement('h1');
    newWord.textContent = `${definitions.word}`;
    newWord.className = 'header-line';
    newWord.id = 'current-word';
    location.appendChild(newWord);

    let favButton = document.createElement('button');
    favButton.className = 'header-line';
    favButton.id = 'fav-button';
    favButton.textContent = 'Add to Favorites';
    location.appendChild(favButton);

    let phonetics = document.createElement('h2');
    phonetics.className = 'current-phonetics';
    phonetics.textContent = buildPhonetics(data);
    location.appendChild(phonetics)
    buildDefinitions(definitions, location)
};
    
//function used for gathering all definitions by part of speech and returning an object with keys cooresponding to POS
function reduceDefinitions (data) {
    let reducedDefinitions = {};
    for(let fullGroup in data) {
        for(let meanings in data[fullGroup].meanings) {
        let outputGroups = data[fullGroup].meanings[meanings];
            for (let definitionObjects in outputGroups.definitions){
                if (!Object.keys(reducedDefinitions).includes(outputGroups.partOfSpeech)) {
                    reducedDefinitions[outputGroups.partOfSpeech] = [];
                }
                reducedDefinitions[outputGroups.partOfSpeech].push(outputGroups.definitions[definitionObjects])
            }   
        }
    }
    return reducedDefinitions;
}

//constructs lists for each part of speech of wordData
function buildDefinitions (wordData, location) {
    for (let index in Object.keys(wordData)) {
        let pos = Object.keys(wordData)[index];
        if (pos != 'word') { createCollapsible(wordData, pos, location)
            console.log(location)
            let currentDiv = document.getElementById(`${wordData.word}-card-${pos}-${location}`);
            let currentUl = document.getElementById(`${wordData.word}-list-${pos}-${location}`);
            for (let entry in wordData[pos]) {
                let definition = wordData[pos][entry].definition;
                let li = document.createElement('li');
                li.textContent = definition;
                currentUl.appendChild(li);
            };
            currentDiv.addEventListener('click', (event) => {
                event.preventDefault();
                if (event.target.className === 'button') {
                    let tempList = document.getElementById(event.target.id.replace('btn', 'list'));
                    if (tempList.classList.contains('hidden')) {
                        tempList.classList.remove('hidden');
                    } else if (!tempList.classList.contains('hidden')) {
                        tempList.classList.add('hidden') };
                };
            });
        };
    };
};

function buildPhonetics (data) {
    for (let fullGroup in data) { return data[fullGroup].phonetic };
}

//handle button creation for buildDefinitions
function createCollapsible (wordData, pos, location) {
    let div = document.createElement('div');
    div.id = `${wordData.word}-card-${pos}-${location}`;
    let button = document.createElement('button')
    button.className = 'button';
    button.id = `${wordData.word}-btn-${pos}-${location}`;
    button.textContent = pos;
    let ul = document.createElement('ul')
    ul.id = `${wordData.word}-list-${pos}-${location}`;
    div.appendChild(button);
    div.appendChild(ul);
    location.appendChild(div);
}
