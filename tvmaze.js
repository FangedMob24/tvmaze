"use strict";

const $showsList = $("#shows-list");
const $episodesArea = $("#episodes-area");
const $searchForm = $("#search-form");
const $episodeList = $("#episodes-list");


/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */

async function getShowsByTerm(query) {
  // ADD: Remove placeholder & make request to TVMaze search shows API.
  let res = await axios.get(`http://api.tvmaze.com/search/shows?q=${query}`);
  let shows=[];

  for(let result of res.data){

    shows.push(
      {
        id : result.show['id'],
        name : result.show['name'],
        summary : result.show['summary'],
        image : result.show.image?.medium
      }
    )
  }

  return shows;
}


/** Given list of shows, create markup for each and to DOM */

function populateShows(shows) {
  $showsList.empty();

  for (let show of shows) {
    const $show = $(
        `<article data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img 
              src="${show.image}"
              onerror="this.src='https://tinyurl.com/tv-missing';"
              alt="did not work" 
              class="w-25 mr-3">
           <div class="media-body">
             <h5 class="text-primary">${show.name}</h5>
             <div><small>${show.summary}</small></div>
             <button id="epBtn" class="btn btn-outline-light btn-sm Show-getEpisodes">
               Episodes
             </button>
           </div>
         </div>  
       </article>
      `);

    $showsList.append($show);  }
}


/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

async function searchForShowAndDisplay() {
  const term = $("#search-query").val();
  const shows = await getShowsByTerm(term);

  $episodesArea.hide();
  populateShows(shows);
}

$searchForm.on("submit", async function (evt) {
  evt.preventDefault();
  await searchForShowAndDisplay();
});


/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */

async function getEpisodesOfShow(id) { 
  //this gets the info for the episodes
  let res = await axios.get(`http://api.tvmaze.com/shows/${id}/episodes`);
  let epList = [];
  //creates the array of objects of needed info
  for(let list of res.data){
    epList.push(
      {
        id : list.id,
        name : list.name,
        season : list.season,
        number : list.number
      }
    )
  }
  return epList;
}

/** Write a clear docstring for this function... */
//will add list of episodes to the dom
function populateEpisodes(episodes) { 
  $episodeList.empty();
//adds the individual episodes
  for (let episode of episodes) {
    const $episode = $(`
    <li id="${episode.id}"> ${episode.name} (season:${episode.season} episode:${episode.number}) </li>
      `);
//then appends everthing
    $episodeList.append($episode);
  }
}
//event listener for a call for episodes
$showsList.on("click","button",async function(evt) {
  $episodesArea.css("display","inline");
  await retriveEpisodesAndDisplay(evt);
})
//calls the proper functions to get and display list of episodes
async function retriveEpisodesAndDisplay(evt){
  let id = $(evt.target).closest("article")[0].dataset.showId;
  let epList = await getEpisodesOfShow(id);
  populateEpisodes(epList);
}