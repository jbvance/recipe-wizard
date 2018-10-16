let state = {
    recipes: []
}

$(document).ready(function () {
    //displayRecipes(response);
    // getRecipes()
    //     .then(recipes => {
    //         displayRecipes(recipes)
    //         hideLoading();
    //     });    

    $('.close').click(function () {
        $("#divModal").hide();
    })

    $('.js-btn-search').click(function (e) {
        hideError();
        showSearchForm();
        $('.js-search-text').val('');
        $('.js-search-text').focus();
    });

    $(".js-btn-cancel-search").click(function (e) {
        e.preventDefault();
        hideSearchForm();
    })

    $(".js-search-form").submit(function (e) {
        e.preventDefault();
        searchRecipes($('.js-search-text').val());
    })

    $(".recipe-box").hover(function () {       
        $(this).find(".card__picture").css("opacity", .1);
        $(this).find(".recipe-box__details").show();
    }, function () {
        $(this).find(".card__picture").css("opacity", 1);
        $(this).find(".recipe-box__details").hide();
    });
})

function showSearchForm() {
    hideLoading();
    hideRecipes();
    hideSearchButton();
    $('.js-search-form').fadeIn(400, "linear");
}

function hideSearchForm() {
    $('.js-search-form').hide();
    hideLoading();
    showRecipes();
    showSearchButton();
}

function hideSearchButton() {
    $('.js-btn-search').hide();
}

function showSearchButton() {
    $('.js-btn-search').fadeIn(400, "linear");
}

function buildQueryParams() {
    return $('.js-search-form').serialize();
}

function searchRecipes() {
    const queryParams = buildQueryParams();
    hideRecipes();
    showLoading();
    $('.js-search-form').hide();
    getRecipes(queryParams)
        .then(recipes => {
            if (!recipes.hits || recipes.hits.length < 1) {
                return showError('No recipes returned');
            }
            state.recipes = recipes.hits;
            displayRecipes(recipes.hits);
            hideError();
            hideLoading();
            showRecipes();
            showSearchButton();
        });

}

function getHealthLabels(recipe) {
    if (!recipe.healthLabels) return '';
    const liString = recipe.healthLabels.map(item => {
        return `<li>${item}</li>`
    }).join('\n\t');
    return `<ul>${liString}</ul>`;

}

function numberWithCommas(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function getRecipeHtml(recipe) {
    const html = `
        <div class="col-4">
            <div class="recipe-box">               
               <img class="card__picture" src="${recipe.image}" alt="${recipe.label}">
                <div class="recipe-text">
                <a href="${recipe.url}" target="_blank"><span class="recipe-text__name">${recipe.label}</span></a>
                    <span class="recipe-text__time"> ${recipe.totalTime} minutes</span>
                </div>  
                <div class="recipe-box__details js-recipe-details">
                    <div class="recipe-box__ingredients">${recipe.ingredients.length} ingredients &#124; ${numberWithCommas(parseInt(recipe.calories))} calories</div>
                    <div class="recipe-box__health-labels">${getHealthLabels(recipe)}</div>
                    <div class="recipe-box__link"><a href="${recipe.url}" target="_blank" class="btn btn--green">View Recipe</a></div>                 
                </div>                                     
            </div>           
        </div>
    `
    return html;
}

function sortRecipes(sortBy) {
    console.log('SORTING')    
    if (!sortBy) return; 
    showLoading();
    let recipes = state.recipes.slice(0);    
    recipes.sort((a, b) => {
        return a.recipe[sortBy] - b.recipe[sortBy]
    })   
    
    displayRecipes(recipes);
    hideLoading();
}

function displayRecipes(recipes) {
    // First, empty the html
    emptyRecipes();
    let html = '';    
    const tmpArray = recipes.slice(0, 20);
    html += tmpArray.map((item, index) => {
        const recipeHtml = getRecipeHtml(item.recipe);
        if ((index + 1) % 3 === 1) {
            return `<div class="row">${recipeHtml}`; // open the row div
        } else if ((index + 1) % 3 === 0 || index === (tmpArray.length - 1)) {
            return `${recipeHtml}</div>`; // end the row div
        } else {
            return recipeHtml;
        }
    }).join('');
    $('.js-recipes').html(html);
    $(".js-sort-by").change(function (e) {
        sortRecipes(e.target.value);
    });
    registerRecipeHover();
    showRecipes();
}

function hideError() {
    $('.js-error').hide();
}

function showError(error) {
    const jsErr = $('.js-error')
    hideLoading();
    emptyRecipes();
    showSearchButton();
    jsErr.html(error)
    jsErr.show();
}

function emptyRecipes() {
    $('.js-recipes').empty();
}

function showLoading() {
    $('.js-loading').show();
    $('.js-recipes').hide();
    $('.js-btn-search').hide();
    $('.js-sort-by').hide();
}

function hideLoading() {
    $('.js-loading').hide();
    //$('.js-recipes').show();
}

function hideRecipes() {
    $('.js-recipes').hide();
    $('.js-sort-by').hide();
}

function showRecipes() {
    $('.js-recipes').show(500, "linear", function () {
        registerRecipeHover();
        $('.js-sort-by').show();
    });
}

function registerRecipeHover() {
    $(".recipe-box").hover(function () {        
        $(this).find(".card__picture").css("opacity", .1);
        $(this).find(".recipe-box__details").show();
    }, function () {
        $(this).find(".card__picture").css("opacity", 1);
        $(this).find(".recipe-box__details").hide();
    });
}

function getRecipes(queryParams) {
    // set as loading
    showLoading();
    return new Promise((resolve, reject) => {
        const url = `https://api.edamam.com/search?${queryParams}&app_id=cb67d7d3&app_key=0fcf8a75711dcde2d2e9af5d36837b9e&from=0&to=50&time=1-30`
        getJson(url)
            .then(res => {
                resolve(res)
            })
            .catch(err => {
                console.log("ERROR", err);
                hideLoading();
                showError('There was an error completing your request. Please try your search again' )
                showSearchButton();
            })
    })
}

function getJson(url) {
    return new Promise((resolve, reject) => {
        $.ajax({
            // url: encodeURI(url),
            url,

            // The name of the callback parameter, as specified by the Api docs
            jsonp: "callback",

            // Tell jQuery we're expecting JSONP
            dataType: "jsonp",

            // Tell the API what we want and that we want JSON
            data: {
                format: "json"
            },

            // Work with the response
            success: function (response) {
                resolve(response);
            },
            error: function (err) {
                reject(err)
            }
        });
    })
}


