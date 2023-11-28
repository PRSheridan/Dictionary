//initialize critical variables
let wordChoice = "default";
const GETconfig = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    }
};

//DOMContentLoaded
//when clicking search the api returns the words json information
//buildWord is then called on the data retrieved.^^^
document.addEventListener('DOMContentLoaded', () => {
    document.addEventListener('submit', (event)=> {
        event.preventDefault(); 
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
            buildWord(reducedDefinitions)
        });
    });
});

//buildWord is used to display the data retrieved about the word
//words are displayed by name, pronunciation, definition/s by default
function buildWord(wordData) {
    const wordContainer = document.getElementById('word-container');
    let newWord = document.createElement('h3');
    newWord.className = `${wordData.word}`;
    newWord.textContent = `${wordData.word}`;
    wordContainer.appendChild(newWord);

    for (let index in Object.keys(wordData)) {
        let pos = Object.keys(wordData)[index];
        if (pos != 'word') { createCollapsible(wordContainer, wordData, pos)
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
                    console.log("test")
                    if (event.target.style.display === 'show') {
                        event.target.style.display = 'hide'
                    } else { event.target.style.display = 'show' };
                };
            });
        };
    };
};
    
//creates the button for showing and hiding the definitions by POS
function createCollapsible (location, wordData, pos) {
    let div = document.createElement('div');
    div.id = `${wordData.word}-card-${pos}`;
    
    let button = document.createElement('button')
    button.className = 'button';
    button.id = `${wordData.word}-btn-${pos}`;
    button.textContent = pos;

    let ul = document.createElement('ul')
    ul.id = `${wordData.word}-list-${pos}`;
    ul.style.display = 'show'

    div.appendChild(button);
    div.appendChild(ul);
    location.appendChild(div);
}
    
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
