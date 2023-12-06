//initialize critical variables
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
    handleFavorites();
    document.addEventListener('submit', (event) => {
        event.preventDefault(); 
        tempCont = document.getElementById('word-container');
        while (tempCont.firstChild) {
            tempCont.removeChild(tempCont.lastChild);
        }
        let wordChoice = event.target.search.value;
        const getWordUrl = `https://api.dictionaryapi.dev/api/v2/entries/en/${wordChoice}`;
        console.log(getWordUrl)
        fetchData(wordChoice, document.getElementById('word-container'));
    });
});

//fetchData 
function fetchData (word, location) {
    let wordUrl = `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`
    fetch(wordUrl, GETconfig) 
    .then(function(response) {
        return response.json();
    })
    .then(function(data) {
        let reducedDefinitions = reduceDefinitions(data);
        reducedDefinitions['word'] = word;
        let phoneticContent = (function() {
            for (let fullGroup in data) { return data[fullGroup].phonetic };
        })();

        buildWord(reducedDefinitions, phoneticContent, location)
        if (location != document.getElementById('fav-container')) {
            let tempFav = document.getElementById(`fav-button`);
            tempFav.addEventListener('click', (event) => {
                event.preventDefault();
                addFavorite(word)
            });
        }
    });
}

//handleFavorites fetches and builds for each item in favorites list
function handleFavorites () {
    fetch(favUrl, GETconfig)
    .then(function(response) {
        return response.json();
    })
    .then(function(data) {
        for (let item in data) {
            fetchData(data[item].name, document.getElementById('fav-container'));
        }
    });
};

//addFavorite POSTs to favorites list, and builds new word at the end of the list
function addFavorite(word) {
//NOT WORKING - word being added with no data
    const POSTconfig = {
        method: "POST",
        headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        },
        body: JSON.stringify({
            "name": word
            })
    }
    fetch(favUrl, POSTconfig)
    .then(function(response) {
        response.json();
    })
    .then(function(data) {
        let reducedDefinitions = reduceDefinitions(data);
        reducedDefinitions['word'] = word;
        let phoneticContent = (function() {
            for (let fullGroup in data) { return data[fullGroup].phonetic };
        })();
        buildWord(reducedDefinitions, phoneticContent, document.getElementById('fav-container'))
    })
}

//buildWord is used to display the data retrieved about the word.
function buildWord(definitions, pronunciation, location) {
    let newWord = document.createElement('h1');
    newWord.textContent = `${definitions.word}`;
    newWord.className = 'header-line';
    newWord.id = `current-word-${location.id}`;
    location.appendChild(newWord);
    
    if (location != document.getElementById('fav-container')) {
        let favButton = document.createElement('button');
        favButton.id = 'fav-button';
        favButton.classList.add('header-line');
        favButton.textContent = 'Add to Favorites';
        location.appendChild(favButton);
    } else {
        let removeButton = document.createElement('button');
        removeButton.classList.add('header-line', 'remove-button');
        removeButton.textContent = 'Remove from Favorites'
        location.appendChild(removeButton);
    }

    let phonetics = document.createElement('h2');
    phonetics.className = 'current-phonetics';
    phonetics.textContent = pronunciation;
    location.appendChild(phonetics)
    buildDefinitions(definitions, location)
};
    
//reduceDefinitions gathers all definitions by part of speech and returns an object with keys cooresponding to POS
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

//buildDefinitions constructs lists for each part of speech of wordData
function buildDefinitions (wordData, location) {
    for (let index in Object.keys(wordData)) {
        let pos = Object.keys(wordData)[index];
        if (pos != 'word') { createCollapsible(wordData, pos, location)
            let currentDiv = document.getElementById(`${wordData.word}-card-${pos}-${location.id}`);
            let currentUl = document.getElementById(`${wordData.word}-list-${pos}-${location.id}`);
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

//handle button creation for buildDefinitions
function createCollapsible (wordData, pos, location) {
    let div = document.createElement('div');
    div.id = `${wordData.word}-card-${pos}-${location.id}`;
    let button = document.createElement('button')
    button.className = 'button';
    button.id = `${wordData.word}-btn-${pos}-${location.id}`;
    button.textContent = pos;
    let ul = document.createElement('ul')
    ul.id = `${wordData.word}-list-${pos}-${location.id}`;
    if (location === document.getElementById('fav-container')) {ul.classList.add('hidden')}
    div.appendChild(button);
    div.appendChild(ul);
    location.appendChild(div);
}
