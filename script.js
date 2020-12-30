const results = document.querySelector('.results')
const search = document.getElementById('search')
let nominationList = []

async function getMovies(e){
    e.preventDefault()
    if (!search.value.trim()){
        results.innerHTML = `Please Enter a movie keyword in the search box `
        return
    }
    console.log(search.value)
    const res = await fetch(`http://www.omdbapi.com/?apikey=1a241340&s=${search.value}`)
    const data =  await res.json()
    console.log(data)
    if (data.Response === 'False'){
        results.innerHTML = `There is no results for search ${search.value}`
    }
    else { displayMovies(data.Search)}
    
}

async function displayMovies(movies){
    results.innerHTML = ''
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
        results.innerHTML += `
        <div class= 'movie' style="background-image:url(${data.Poster}) ">
            
            <div class="info">
            <div class = 'genres'>${genreList.innerHTML}</div>
            <button class="nominate-btn" onclick="NominateMovie()">Nominate</button>
                <div class=rate>
                    <div class='btn rating' >Rating:<i class="fas fa-star" style="color:yellow"></i>${data.imdbRating}</div>
                    <div class= 'btn age'>${data.Rated}</div>
                </div>
            </div>
            <div class=movie-title>
                <h4>${data.Title} - ${data.Year}</h4>
        </div>
        </div> 
        `
    }
}


function NominateMovie(){
    let target = event.target
    let item = target.parentNode.parentNode
    const background = item.getAttribute('style')
    if (target.innerHTML === 'Nominate'){
        target.innerHTML = 'Remove'  
        nominationList.push({'content':item.innerHTML, 'poster':background})
    }
    else {
        target.innerHTML = 'Nominate'
       nominationList = nominationList.filter(item => {
           if (item.poster !== background){
               return item
           }
       })
        console.log(nominationList)
    }
}

function displayNominations(){
    results.innerHTML = '<button class="back" onclick="backtoSearch()"><i class="fas fa-arrow-circle-left"></i>  back to search Results</button>'
    for (let list of nominationList){
        results.innerHTML += `
        <div class="movie" style="${list.poster}">${list.content}</div>
        `
    }
}

async function backtoSearch(){
    const res = await fetch(`http://www.omdbapi.com/?apikey=1a241340&s=${search.value}`)
    const data =  await res.json()
    console.log(data)
    if (data.Response === 'False'){
        results.innerHTML = `There is no results for search ${search.value}`
    }
    else { displayMovies(data.Search)}

}

function events(){
    const form = document.getElementById('form')
    const nomination = document.getElementById('nominations')
    form.addEventListener('submit', getMovies)
    nomination.addEventListener('click', displayNominations)
}
events()