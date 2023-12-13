//initialize critical variables
const favUrl = `http://localhost:3000/favorites`;
let favContainer = [];
const GETconfig = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
    },
};

//listen for submit event and pass wordChoice to fetchData
//call handleFavorites to load favorites first
document.addEventListener('DOMContentLoaded', () => {
    handleFavorites();
    document.addEventListener('submit', (event) => {
        event.preventDefault(); 
        tempCont = document.getElementById('word-container');
        while (tempCont.firstChild) {
            tempCont.removeChild(tempCont.lastChild);
        };
        let wordChoice = event.target.search.value;
        const getWordUrl = `https://api.dictionaryapi.dev/api/v2/entries/en/${wordChoice}`;
        console.log(getWordUrl)
        fetchData(wordChoice, document.getElementById('word-container'));
    });
});

//fetchData gathers information for buildWord
function fetchData (word, container) {
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
        buildWord(reducedDefinitions, phoneticContent, container)
    });
};

//handleFavorites calls fetchData for each item in favContainer 
//also handles remove-button event listener; removes item from favContainer, fav-container, and calls removeFavorite
function handleFavorites () {
    fetch(favUrl, GETconfig)
    .then(function(response) {
        return response.json();
    })
    .then(function(data) {
        for (let item in data) {
            favContainer.push({
                "id": data[item].id,
                "name": data[item].name
        })
        fetchData(data[item].name, document.getElementById('fav-container'));
        };

//remove-button event listener
        document.getElementById('fav-container').addEventListener('click', (event) => {
            event.preventDefault();
            if (event.target.classList.contains('remove-button')) {
                let tempName = event.target.className.replace('header-line ', '');
                tempName = tempName.replace(' remove-button', '')
                document.getElementById(`${tempName}-fav-container`).remove();
                favContainer.pop(event.target.id-1)
                removeFavorite(event.target.id)
            };
        });
    });
};

//removes favorite from db.json
function removeFavorite(id) {
    const DELETEconfig = {
        method: "DELETE",
        headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        }
    };
    fetch (favUrl + `/${id}`, DELETEconfig)
};

//addFavorite POSTs to favorites list, adds to favContainer, and calls fetchData on word
function addFavorite(word) {
    for (let item in favContainer) {
        if (favContainer[item].name === word) {return console.log('oops')};
    };
    const POSTconfig = {
        method: "POST",
        headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        },
        body: JSON.stringify({
            "name": word
            })
    };
    fetch(favUrl, POSTconfig)
    .then(function(response) {
        return response.json();
    })
    .then(function(data) {
        favContainer.push({
            "id": data.id,
            "name": data.name
        });
    });
    fetchData(word, document.getElementById('fav-container'));
};

//buildWord is used to create the words card and calls buildDefinitions to populate lists
//also handles fav-button event listener which calls addFavorite
function buildWord(definitions, pronunciation, container) {
    let wordDiv = document.createElement('div');
        wordDiv.id = `${definitions.word}-${container.id}`
    let wordTitle = document.createElement('h1');
        wordTitle.textContent = `${definitions.word}`;
        wordTitle.className = 'header-line';
        wordTitle.id = `current-word-${container.id}`;
        wordDiv.appendChild(wordTitle);
    if (container != document.getElementById('fav-container')) {
        let favButton = document.createElement('button');
            favButton.id = 'fav-button';
            favButton.classList.add('header-line');
            favButton.textContent = 'Add to Favorites';
            wordDiv.appendChild(favButton);
    } else {
        let removeButton = document.createElement('button');
            removeButton.classList.add('header-line', `${definitions.word}`, 'remove-button');
            for (let value in favContainer) {
                if (favContainer[value].name === definitions.word) {
                    removeButton.id = favContainer[value].id;
                };
            };
            removeButton.textContent = 'Remove from Favorites'
        wordDiv.appendChild(removeButton);
    };
    let wordPhonetics = document.createElement('h2');
        wordPhonetics.textContent = pronunciation;
        wordPhonetics.className = 'phonetics';
        wordDiv.appendChild(wordPhonetics)
    container.appendChild(wordDiv);

//fav-button event listener
    if (container != document.getElementById('fav-container')) {
        let tempFav = document.getElementById(`fav-button`);
        tempFav.addEventListener('click', (event) => {
            event.preventDefault();
            addFavorite(definitions.word)
        });
    };
    let wordLocation = document.getElementById(`${definitions.word}-${container.id}`);
    buildDefinitions(definitions, wordLocation, container)
};
    
//reduceDefinitions gathers all definitions by part of speech and returns an object with keys cooresponding to POS
//fullGroup: API fetch returns multiple word objects
function reduceDefinitions (data) {
    let reducedDefinitions = {};
    data.forEach(function (fullGroup) {
        fullGroup.meanings.forEach(function (outputGroup){
            if (!Object.keys(reducedDefinitions).includes(outputGroup.partOfSpeech)) {
                reducedDefinitions[outputGroup.partOfSpeech] = [];
            };
            outputGroup.definitions.filter(function (definitionObject){
                return reducedDefinitions[outputGroup.partOfSpeech].push(definitionObject)
            });
        });
    });
    return reducedDefinitions;
};

//buildDefinitions constructs lists for each part of speech in wordData
function buildDefinitions (wordData, wordLocation, container) {
    Object.keys(wordData).forEach(function (pos) {
        if (pos != 'word') { createDefList(wordData, pos, wordLocation, container)
            let currentUl = document.getElementById(`${wordData.word}-list-${pos}-${container.id}`); 
            wordData[pos].forEach(function (wordObject) {
                let li = document.createElement('li');
                li.textContent = wordObject.definition;
                currentUl.appendChild(li);
            });
        };
    });
};

//handle button creation for buildDefinitions
function createDefList (wordData, pos, wordLocation, container) {
    let div = document.createElement('div');
    div.id = `${wordData.word}-card-${pos}-${container.id}`;
    let button = document.createElement('button')
    button.className = 'button';
    button.id = `${wordData.word}-btn-${pos}-${container.id}`;
    button.textContent = pos;
    let ul = document.createElement('ul')
    ul.id = `${wordData.word}-list-${pos}-${container.id}`;
    if (container === document.getElementById('fav-container')) {ul.classList.add('hidden')}
    div.appendChild(button);
    div.appendChild(ul);

//button hide/show event listener
    div.addEventListener('click', (event) => {
        event.preventDefault();
        if (event.target.className === 'button') {
            let tempList = document.getElementById(event.target.id.replace('btn', 'list'));
            if (tempList.classList.contains('hidden')) {
                tempList.classList.remove('hidden');
            } else if (!tempList.classList.contains('hidden')) {
                tempList.classList.add('hidden') };
        };
    });
    wordLocation.appendChild(div);
};
