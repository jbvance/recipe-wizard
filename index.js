let props = {
    loading: false
}

$(document).ready(function () {    
    getRecipes()
        .then(recipes => {
            displayRecipes(recipes)
            hideLoading();
        });
})

function getRecipeHtml(recipe) {
    const html = `
        <div class="col-4">
            <div class="recipe-box">
                <a href="${recipe.url}" target="_blank"><img class="card__picture" src="${recipe.image}"></a>
                <div class="recipe-text">
                    <span class="recipe-text__name">${recipe.label}</span>
                    <span> ${recipe.totalTime} minutes</span>
                </div>
            </div>
        </div>
    `
    return html;
}

function displayRecipes(recipes) {
    let html = ''
    const tmpArray = recipes.hits.slice(0, 20);
    for (let i = 0; i < tmpArray.length; i++) {
        const recipeHtml = getRecipeHtml(tmpArray[i].recipe);
        if ((i + 1) % 3 === 1) {
            html += `<div class="row">${recipeHtml}`; // open the row div
        } else if ((i + 1) % 3 === 0 || i === (tmpArray.length - 1)) {
            html += `${recipeHtml}</div>`; // end the row div
        } else {
            html += recipeHtml;
        }
    }
    $('.js-recipes').replaceWith(html);
}

function showLoading() {
    $('.js-loading').show();
    $('.js-recipes').hide();
}

function hideLoading() {
    $('.js-loading').hide();
    $('.js-recipes').show();
}

function getRecipes() {
    // set as loading
   showLoading();
    return new Promise((resolve, reject) => {
        const url = `https://api.edamam.com/search?q=grilled cheese&app_id=cb67d7d3&app_key=0fcf8a75711dcde2d2e9af5d36837b9e&from=0&to=50&time=1-30`
        getJson(url)
            .then(res => {
                resolve(res)
            })
            .catch(err => {
                console.log("ERROR", err);
            })
    })
}

function getJson(url) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: encodeURI(url),

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


