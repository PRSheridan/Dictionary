//initialize critical variables
let wordChoice = "default";
const GETconfig = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    }
};

//when clicking search the api returns the words json information (currently the
//getWordUrl is displayed in the console for reference). buildWord is then called 
//on the data retrieved.^^^
//also DOMContentLoaded
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
//buildWord call
            buildWord(reducedDefinitions)
        });
    });

    const coll = document.getElementsByClassName("collapsible");
    console.log(coll)
    for (let i = 0; i < coll.length; i++) {
        coll[i].style.display = "none"
        coll[i].addEventListener("click", (event) => {
            if (event.target.style.display === 'show') {event.target.style.display = 'none'}
            else {event.target.style.display = 'show'};
        })
    }
});

//buildWord is used to display the data retrieved about the word
//words are displayed by name, pronunciation, definition/s by default

function buildWord(wordData) {
//create word card title
        const wordContainer = document.getElementById('word-container');
        let newWord = document.createElement('h4');
        newWord.className = `${wordData.word}`;
        newWord.textContent = `${wordData.word}`;
        wordContainer.appendChild(newWord);
    
        for (let index in Object.keys(wordData)) {
            let pos = Object.keys(wordData)[index];
            if (pos != 'word') {
//create the collapsible for the word
                createCollapsible(wordContainer, wordData, pos);
//populate the collapsible with definitions
                for (let entry in wordData[pos]) {
                    let definition = wordData[pos][entry].definition;
                    let li = document.createElement('li');
                    li.className = wordData.word;
                    li.textContent = definition;
//creates then appends definition li's to the approprpiately named ul 
                    document.getElementById(`${wordData.word}-def-${pos}`).appendChild(li);
                }
            }
        }
    }
    
//creates the button for showing and hiding the definitions by POS
    function createCollapsible (location, wordData, pos) {
        let div = document.createElement('div');
        div.id = `${pos}`;
        let button = document.createElement('button')
        button.className = 'collapsible';
        button.textContent = pos;
        let ul = document.createElement('ul')
        ul.id = `${wordData.word}-def-${pos}`;
    
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
