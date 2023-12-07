//initialize critical variables
const favUrl = `http://localhost:3000/favorites`;
const GETconfig = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
    },
};
let favContainer = [];


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

//fetchData gathers information for buildWord and creates favorites button listener
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
        //below handles favorite button listener
        if (container != document.getElementById('fav-container')) {
            let tempFav = document.getElementById(`fav-button`);
            tempFav.addEventListener('click', (event) => {
                event.preventDefault();
                addFavorite(word)
            });
            //below handles remove from favorites for each favorite
        } else if (container = document.getElementById('fav-container')) {
            let removeButtons = [...document.getElementsByClassName('remove-button')];
            removeButtons.forEach(function(item) {
                item.addEventListener('click', (event) => {
                    event.preventDefault();
                    removeFavorite(item.id);
                })
            });
        };
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
            favContainer.push({
                "id": data[item].id,
                "name": data[item].name
            })
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
        return response.json();
    })
    .then(function(data) {
        favContainer.push({
            "id": data.id,
            "name": data.name
        });
        let reducedDefinitions = reduceDefinitions(data);
        reducedDefinitions['word'] = word;
        let phoneticContent = (function() {
            for (let fullGroup in data) { return data[fullGroup].phonetic };
        })();
        buildWord(reducedDefinitions, phoneticContent, document.getElementById('fav-container'))
    });
};
//very weird; I add a word to favorites, it shows with no definitions && remove button does not function
//after refresh, definitions show, and remove button works BUT only removes after refresh
function removeFavorite(id) {
    const DELETEconfig = {
        method: "DELETE",
        headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        }
    };
    fetch (favUrl + `/${id}`, DELETEconfig)
    .then(function(response) {
        return response.json();
    })
    .then(function() {
        console.log("test")
        for (let item in favContainer) {
            if (favContainer[item].id === id) {
                let tempName = favContainer[item].name;
                favContainer[item].remove();
                console.log(document.getElementById(`${tempName}-fav-container`));
                document.getElementById(`${tempName}-fav-container`).remove();
            }
        }
    })
    
}

//buildWord is used to display the data retrieved about the word.
//buildWord inside the correct container [word or fav]
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
        removeButton.classList.add('header-line', 'remove-button');
        for (let value in favContainer) {
            if (favContainer[value].name === definitions.word) {
                removeButton.id = favContainer[value].id;
            }
        }
        removeButton.textContent = 'Remove from Favorites'
        wordDiv.appendChild(removeButton);
    }

    let wordPhonetics = document.createElement('h2');
    wordPhonetics.className = 'current-phonetics';
    wordPhonetics.textContent = pronunciation;
    wordDiv.appendChild(wordPhonetics)

    container.appendChild(wordDiv);
    let wordLocation = document.getElementById(`${definitions.word}-${container.id}`);
    buildDefinitions(definitions, wordLocation, container)
    //container.appendChild(wordDiv);
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
function buildDefinitions (wordData, wordLocation, container) {
    for (let index in Object.keys(wordData)) {
        let pos = Object.keys(wordData)[index];
        if (pos != 'word') { createDefList(wordData, pos, wordLocation, container)
            let currentUl = document.getElementById(`${wordData.word}-list-${pos}-${container.id}`); 
            for (let entry in wordData[pos]) {
                let definition = wordData[pos][entry].definition;
                let li = document.createElement('li');
                li.textContent = definition;
                currentUl.appendChild(li);
            };
        };
    };
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
}
