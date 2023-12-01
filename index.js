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
    document.addEventListener('submit', (event)=> {
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
//currently reducedDefinitions is the only data passed to buildWord, this will change with added
//functionality. 
            let reducedDefinitions = reduceDefinitions(data);
            reducedDefinitions['word'] = wordChoice;
            console.log(reducedDefinitions)
            buildWord(data, reducedDefinitions)
        });
    });
});

//buildWord is used to display the data retrieved about the word.
//sub-functions are called for specific tasks: buildDefinitions, buildHistory...
function buildWord(data, wordData) {
    let container = document.getElementById('word-container');
    let newWord = document.createElement('h1');
    newWord.className = `${wordData.word}`;
    newWord.textContent = `${wordData.word}`;
    container.appendChild(newWord);
    let phonetics = document.createElement('h2');
    phonetics.className = `${wordData.word}`;
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
