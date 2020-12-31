const results = document.querySelector('.results')
const search = document.getElementById('search')
let nominationList = []
let page = 1

async function getMovies(e){
    e.preventDefault()
    page = 1
    if (!search.value.trim()){
        results.innerHTML = `Please Enter a movie keyword in the search box `
        return
    }
    const res = await fetch(`http://www.omdbapi.com/?apikey=1a241340&s=${search.value}&type=movie&page=${page}`)
    const data =  await res.json()
    console.log(data)
    if (data.Response === 'False'){
        results.innerHTML = `There is no results for search ${search.value}`
    }
    else { displayMovies(data.Search, Number(data.totalResults))}
    
}

async function displayMovies(movies,totalResults){
    results.innerHTML = ''
    const more = document.getElementById('more')
    for (let movie of movies){
        const res = await fetch(`http://www.omdbapi.com/?apikey=1a241340&i=${movie.imdbID}`)
        const data = await res.json()
        const genre = data.Genre.split(', ').splice(0,3)
        const genreList = document.createElement('ul')
        genre.forEach((gen) => {
            const element = document.createElement('li')
            element.innerHTML = `${gen}`
            element.classList.add('genre')
            genreList.appendChild(element)
        })
        let nominateBtnContent = 'Nominate'
        nominationList.forEach((nominated) => {
            if (nominated.id === data.imdbID){
                nominateBtnContent = 'Remove'
            }
        })

        results.innerHTML += `
        <div class= 'movie' style="background-image:url(${data.Poster}) ">
            
            <div class="info">
            <div class = 'genres'>${genreList.innerHTML}</div>
            <button class="nominate-btn" onclick="NominateMovie()" data-id="${data.imdbID}">${nominateBtnContent}</button>
                <div class=rate>
                    <div class='btn rating' >Rating:<i class="fas fa-star" style="color:yellow"></i>${data.imdbRating}</div>
                    <div class= 'btn age'>${data.Rated}</div>
                </div>
            </div>
            <div class=movie-title>
                <h4>${data.Title} - ${data.Year}</h4>
        </div>
        </div>   `
    }
    if (totalResults > 10) {
        more.innerHTML = `
          ${
            page > 1
              ? `<button class="btn" onclick="getPrev()">Prev</button>`
              : ''
          }
          ${
            totalResults >= (page * 10)
              ? `<button class="btn" onclick="getNext()">Next</button>`
              : ''
          }`
    }
    else {
        more.innerHTML = ''
    }
}


function getPrev(){
    page--
    getSearch()
}

function getNext(){
    page++
    getSearch()
}





function removeMovie(item,target){
    const movieID = target.getAttribute('data-id')
    results.removeChild(item)
    nominationList = nominationList.filter(nominee => {
        if (nominee.id !== movieID){
            return nominee
        }
    })
    
};


function NominateMovie(){
    const noteBox = document.querySelector('.note-box')
    let target = event.target
    let item = target.parentNode.parentNode
    const background = item.getAttribute('style')
    const movieID = target.getAttribute('data-id')
    if (item.classList.contains('remove')){
        removeMovie(item,target)
        return
    }
    if (target.innerHTML === 'Nominate'){
        if (nominationList.length === 5){
            noteBox.innerHTML += '<p>Your nomination List is full. You cannot add any more movies</p>'
            displayBanner(noteBox) 
            return
        }
        target.innerHTML = 'Remove'  
        nominationList.push({'content':item.innerHTML, 'poster':background, 'id':movieID})
        if (nominationList.length === 5){
            noteBox.innerHTML += '<p>Your Nomination List is now full. Thank your for taking the time to nominate your favorite movies.</p>'
            displayBanner(noteBox)
        }
    }
    else {
        target.innerHTML = 'Nominate';
        nominationList = nominationList.filter(item => {
           if (item.id !== movieID){
               return item
           };
       });
    };
}
function displayBanner(noteBox){
    const exit = noteBox.querySelector('.exit');
    const pElement = noteBox.querySelector('p');
    noteBox.classList.add('show');
    exit.addEventListener('click', () => {
        noteBox.removeChild(pElement)
        noteBox.classList.remove('show')
    });
}

function displayNominations(){
    results.innerHTML = '<button class="back" onclick="getSearch()"><i class="fas fa-arrow-circle-left"></i>  back to search Results</button>';
    for (let list of nominationList){
        results.innerHTML += `
        <div class="movie remove" style="${list.poster}">${list.content}</div>
        `
    };
};

async function getSearch(){
    const res = await fetch(`http://www.omdbapi.com/?apikey=1a241340&s=${search.value}&type=movie&page=${page}`)
    const data =  await res.json()
    if (data.Response === 'False'){
        results.innerHTML = `There is no results for search ${search.value}`
    }
    else { displayMovies(data.Search, Number(data.totalResults))}
};

function events(){
    const form = document.getElementById('form')
    const nomination = document.getElementById('nominations')
    form.addEventListener('submit', getMovies)
    nomination.addEventListener('click', displayNominations)
};
events();