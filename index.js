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
            buildWord(data, reducedDefinitions)

//really broken version of updating favorites list- working on fixing might need to refresh on 
//how to run the local server && how to input my words data (currently not sure if my POSTconfig is good)

            let tempFav = document.getElementById('fav-button')
            let favList = document.getElementById('fav-container')
            tempFav.addEventListener('click', () => {
                event.preventDefault();
                const POSTconfig = {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      "Accept": "application/json",
                    },
                    body: JSON.stringify({
                      "name": document.getElementById('current-word').textContent,
                      "values": {
                        "pronunciation": document.getElementById('current-phonetics'),
                        "definitions": reducedDefinitions,
                            }   
                        })
                    };
                fetch(favUrl, POSTconfig)
                .then(function(response) {
                    return response.json();
                })
                .then(function(data) {
//NEXT create a buildFavorites function that takes all the posted information about a favorited word and creates a builds a card
//very likely will need to restructure buildWord to create a cleaner organization of PRE-html data i.e. create an object with
//all needed information then build the card based on that data rather than individual variables.
                    favList.appendChild(buildFavorites(data));
                });
            });
        });
    });
});

//buildWord is used to display the data retrieved about the word.
//sub-functions are called for specific tasks: buildDefinitions, buildHistory...
function buildWord(data, wordData) {
    let container = document.getElementById('word-container');

    let newWord = document.createElement('h1');
    newWord.textContent = `${wordData.word}`;
    newWord.className = 'header-line';
    newWord.id = 'current-word';
    container.appendChild(newWord);

    let favButton = document.createElement('button');
    favButton.className = 'header-line';
    favButton.id = 'fav-button';
    favButton.textContent = 'Add to Favorites';
    container.appendChild(favButton);

    let phonetics = document.createElement('h2');
    phonetics.className = 'current-phonetics';
    phonetics.textContent = buildPhonetics(data);
    container.appendChild(phonetics)
    buildDefinitions(wordData)
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
function buildDefinitions (wordData) {
    for (let index in Object.keys(wordData)) {
        let pos = Object.keys(wordData)[index];
        if (pos != 'word') { createCollapsible(document.getElementById('word-container'), wordData, pos)
            let currentDiv = document.getElementById(`${wordData.word}-card-${pos}`);
            let currentUl = document.getElementById(`${wordData.word}-list-${pos}`);
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
function createCollapsible (location, wordData, pos) {
    let div = document.createElement('div');
    div.id = `${wordData.word}-card-${pos}`;
    let button = document.createElement('button')
    button.className = 'button';
    button.id = `${wordData.word}-btn-${pos}`;
    button.textContent = pos;
    let ul = document.createElement('ul')
    ul.id = `${wordData.word}-list-${pos}`;
    div.appendChild(button);
    div.appendChild(ul);
    location.appendChild(div);
}
