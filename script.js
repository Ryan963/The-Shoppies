const results = document.querySelector('.results')
const search = document.getElementById('search')
const more = document.getElementById('more')
const noteBox = document.querySelector('.note-box')
let nominationList = []
let page = 1

// saves the current nomination list to local storage
function save(){
    if (localStorage.getItem('movies') === null){
        localStorage.setItem('movies', '[]')
    }
    else {
        localStorage.setItem('movies', JSON.stringify(nominationList))
    }
 
}

// retrive the current nomination list from local storage
function retrive(){
    if (localStorage.getItem('movies')){
        nominationList = JSON.parse(localStorage.getItem('movies'))
    }
    
}

// call an api with the search term to retrive the results
async function getMovies(e){
    e.preventDefault()
    page = 1
    if (!search.value.trim()){
        results.innerHTML = `Please Enter a movie keyword in the search box `
        return
    }
    const res = await fetch(`https://www.omdbapi.com/?apikey=1a241340&s=${search.value}&type=movie&page=${page}`)
    const data =  await res.json()
    if (data.Response === 'False'){
        results.innerHTML = `There are no results for search ${search.value}`
    }
    else { displayMovies(data.Search, Number(data.totalResults))}
    
}


// display the search results to the DOM and dislpay a next or prev buttons 
// to go to next page
async function displayMovies(movies,totalResults){
    results.innerHTML = ''
    for (let movie of movies){
        const res = await fetch(`https://www.omdbapi.com/?apikey=1a241340&i=${movie.imdbID}`)
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
        if (nominationList !== null){
            nominationList.forEach((nominated) => {
                if (nominated.id === data.imdbID){
                    nominateBtnContent = 'Remove'
                }
            })
        }
        

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

// decreases the page number then calls getsearch to fetch previous page to DOM
function getPrev(){
    page--
    getSearch()
}

// increases page number  and calls getsearch to fetch next page to dom
function getNext(){
    page++
    getSearch()
}




// removes a movie from nomination list and calls save to save the new list
function removeMovie(item,target){
    const movieID = target.getAttribute('data-id')
    results.removeChild(item)
    nominationList = nominationList.filter(nominee => {
        if (nominee.id !== movieID){
            return nominee
        }
    })
    save()
};

// adds a new movie to nomination list 
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
    save()
}

// display a popup when the user has 5 movies in nomination list
// it also display a message whe nthe user try to add a movie when nomination list is full
function displayBanner(noteBox){
    const popup = document.getElementById('popup')
    const exit = noteBox.querySelector('.exit');
    const pElement = noteBox.querySelector('p');
    popup.classList.add('show')
    exit.addEventListener('click', removeBanner)
}

// removes the pop up by clicking the okay button or anywhere outside the box
function removeBanner(){
    const popup = document.getElementById('popup')
    const pElement = noteBox.querySelector('p');
    noteBox.removeChild(pElement)
    popup.classList.remove('show')

}

// displays nomination list 
function displayNominations(){
    more.innerHTML = ''
    results.innerHTML = '<button class="back" onclick="getSearch()"><i class="fas fa-arrow-circle-left"></i>  back to search Results</button>';
    for (let list of nominationList){
        results.innerHTML += `
        <div class="movie remove" style="${list.poster}">${list.content}</div>
        `
    };
};

// get search does the same thing as get movies however it is based on a click so there 
// is no event parameter 
// had to make this function because the other one has preventdefault statement which is giving an error when using it on clicks
async function getSearch(){
    const res = await fetch(`https://www.omdbapi.com/?apikey=1a241340&s=${search.value}&type=movie&page=${page}`)
    const data =  await res.json()
    if (data.Response === 'False'){
        results.innerHTML = `There is no results for search ${search.value}`
    }
    else { displayMovies(data.Search, Number(data.totalResults))}
};

// events handle the main event listeners and calls retrive to get the stored movies in nomination list 
function events(){
    retrive()
    const form = document.getElementById('form')
    const nomination = document.getElementById('nominations')
    form.addEventListener('submit', getMovies)
    nomination.addEventListener('click', displayNominations)
};
events();