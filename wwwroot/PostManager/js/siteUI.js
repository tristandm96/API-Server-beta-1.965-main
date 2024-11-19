firstload = true;
let searchString = "";
let Etag = null;
let pageManager;
let previousScrollPosition = 0;
let postItemLayout = {
    // https://www.w3schools.com/jquery/jquery_dimensions.asp
    width: $("#sample").outerWidth(),
    height: $("#sample").outerHeight()
};
$(document).ready(function () {
    pageManager = new PageManager('scrollPanel', 'postPanel', postItemLayout, getposts, Init_UI);
    pageManager.pageUi();
})
function Init_UI() {
    dropdownMenu();
    $('#headContainer').empty();
    $('#headContainer').append(`
        <h1 id ="actionTitle">posts</h1>
        <i class="cmdIcon fa fa-plus" id="createPost" title="Ajouter un post"></i>`)
        if(firstload){
        $('#filter').append(`
            <label for="search">Rechercher par mot clé</label>
            <input name="search" id="keyWords" type="text">
            <button id="submitSearch">Rechercher</button> `)
            firstload = false;
        }
    $('#createPost').on("click", function () {
        console.log("Create Post button clicked");
        renderCreatePostForm();
    });
    $('#submitSearch').off("click").on("click", function () {
        pageManager.searchString = $('#keyWords').val();
        console.log("Submit button clicked. Searching for:", pageManager.searchString);
         pageManager.update(false);
    });
    $('#categoryfilter').off('change').on('change',function() {
        pageManager.selectedCategory = $(this).val();
        console.log(pageManager.selectedCategory)
        pageManager.update(false);

    });
}
async function dropdownMenu() {
    let Categorys = await API_GETCategory();
    Categorys.forEach(Category => {
        if (!pageManager.categories.includes(Category.Category)) {
            pageManager.categories.push(Category.Category); 
            $('#categoryfilter').append(`<option value="${Category.Category}">${Category.Category}</option>`);
        }
    });
}


async function getposts(queryString) {
    let posts = await API_GETPosts(queryString);
    if (posts.length > 0) {
        posts.forEach(post => {
            $("#postPanel").append(` <div class="sample" id="post-${post.Id}" postId="${post.Id}">
        <div class="postCategory" id="category">
            ${post.Category} 
        <div class="actions">
            <div class="edit">
                <i class="fa fa-pencil-square" title="Edit Post"></i>
            </div>
            <div class="delete">
                <i class="fa fa-trash" title="Delete Post"></i>  
            </div>
        </div>
        </div>
                <hr>
                <div class=title>${post.Title} </div>
                <div class="image-container">
                 <div class="image" style="background-image:url('${post.Image}')"></div>
                 </div>
                 <div class="date"> ${formatDatefr(post.Creation)}</div> 
                 <div class="text-preview">
                        ${post.Text.substring(0, 100)}
                        <span class="allText" style="display:none;">${post.Text.substring(100)}</span>
                        <a href="#" class="moreText">[...]</a>
                    </div>
                </div>`);
        });
    }
    else{
        return true;
    }
    $(".sample").hover(
        function () {
            $(this).find(`.delete`).show();
            $(this).find(`.edit`).show();
            $(this).find(`.moreText`).show(); // Show edit option for the specific post
        },
        function () {
            $(this).find(`.delete`).hide();
            $(this).find(`.edit`).hide();
            $(this).find(`.moreText`).hide(); // Hide edit option when not hovering
        }
    );
    DeletePostEvent();
    editPostEvent();
    seeMoreText();
   
}

async function renderEditPostForm(id) {
    let post = await API_GetPost(id);
    if (post !== null)
        await renderPostForm(post);
    else
        renderError("Post introuvable!");
}
function renderCreatePostForm() {
    renderPostForm();
}
function eraseContent() {
    $("#postPanel").empty();}
function hidePost() {
    previousScrollPosition = $("#scrollPanel").scrollTop();
    console.log("Stored scroll position:", previousScrollPosition);
    $("#postPanel").hide();
    $("#createPost").hide();
    $('#filter').hide();
}
function showPost() {
    $("#postPanel").show();
    $("#scrollPanel").scrollTop(previousScrollPosition);
    $('#filter').show();
    console.log("Restored scroll position:", previousScrollPosition);
}
function emptyform() {
    $("#form").hide()
    $("#form").empty()
}

async function renderPostForm(post = null) {
    hidePost();
    let methode;
    methode ? "POST" : "PUT";
    let create = post == null;
    if (create) {
        post = newpost();
    }
    pageManager.inform();
    $("#form").empty();
    $("#actionTitle").text(create ? "Création" : "Modification");
    $("#form").append(`
        <form methode=${methode} class="form" id="postForm">
            <input type="hidden" name="Id" value="${post.Id}"/>
            <input type="hidden" name="Creation" value="${post.Creation}"/>
            <label for="Title" class="form-label">Title </label>
            <input 
                class="form-control Alpha"
                name="Title" 
                id="Title" 
                placeholder="Title"
                value="${post.Title}"
            />
            <label for="Text" class="form-label">Text</label>
            <input
                class="form-control Alpha"
                name="Text"
                id="Text"
                value="${post.Text}" 
            />
            <label for="Category" class="form-label">Category </label>
            <input 
                class="form-control Alpha"
                name="Category"
                id="Category"
                value="${post.Category}"
            />
             <label class="form-label">image </label>
            <div   class='imageUploader' 
                   newImage='${create}' 
                   name="Image"
                   controlId='Image' 
                   imageSrc='${post.Image}' 
                   waitingImage="Loading_icon.gif">
            </div>
            <input type="submit" value="Enregistrer" id="SavePost" class="btn btn-primary">
            <input type="button" value="Annuler" id="cancel" class="btn btn-secondary">
        </form>
    `);
    $("#form").show();
    initImageUploaders();// important do to after all html injection!
    $('#postForm').on("submit", async function (event) {
        event.preventDefault();
        let post = getFormData($("#postForm"));
        let result = await API_SavePost(post, create);
        console.log("post" + result);
        if (result) {
            emptyform();
            pageManager.update();
            pageManager.pageUi();
            showPost();
            pageManager.inform();
        }
        else
        emptyform();
        pageManager.inform();
        renderError("Une erreur est survenue! " + API_getcurrentHttpError());
    });
    $('#cancel').on("click", function (event) {
        event.stopPropagation();
        pageManager.inform();
        pageManager.pageUi();
        emptyform();
        showPost();

    });
}
function newpost() {
    post = {};
    post.Id = 0;
    post.Title = "";
    post.Text = "";
    post.Category = "";
    post.image = "";
    post.Creation = setCreationtime();
    return post;
}
function getFormData($form) {
    const removeTag = new RegExp("(<[a-zA-Z0-9]+>)|(</[a-zA-Z0-9]+>)", "g");
    var jsonObject = {};
    $.each($form.serializeArray(), (index, control) => {
        jsonObject[control.name] = control.value.replace(removeTag, "");
    });
    return jsonObject;
}
function renderError(message) {
    eraseContent();
    $("#content").append(
        $(`
            <div class="errorContainer">
                ${message}
            </div>
        `)
    );
}
function setCreationtime() {
    const now = new Date();
    const dateTimeInteger = Number(
        now.getFullYear() +
        String(now.getMonth() + 1).padStart(2, '0') + // Months are 0-indexed
        String(now.getDate()).padStart(2, '0') +
        String(now.getHours()).padStart(2, '0') +
        String(now.getMinutes()).padStart(2, '0')
    );
    return dateTimeInteger
}
function seeMoreText() {
    $(document).off('click', '.moreText').on('click', '.moreText', function (event) {
        event.preventDefault();
        event.stopPropagation();
        const previewContainer = $(this).closest('.text-preview');
        const fullText = previewContainer.find('.allText');
        if (fullText.is(':visible')) {
            fullText.hide();
            $(this).text('[...]');
        } else {
            fullText.show();
            $(this).text('[voir Moins]');
        }
    });

}
function editPostEvent() {
    $(document).off('click', '.edit').on('click', '.edit', function (event) {
        event.preventDefault();
        event.stopPropagation();
        const postId = $(this).closest('.sample').attr('postId');
        console.log(postId);
        renderEditPostForm(postId)
    });
}
async function renderDeletePostForm(id) {
    hidePost();
    $("#actionTitle").text("Retrait");
    pageManager.inform();
    let post = await API_GetPost(id);
    if (post !== null) {
        $("#form").append(`
        <div class="contactdeleteForm">
            <h4>Effacer le Post suivant?</h4>
            <div>${post.Title}
            <br>
            <input type="button" value="Effacer" id="deletePost" class="btn btn-primary">
            <input type="button" value="Annuler" id="cancel" class="btn btn-secondary">
        </div>    
        `);
        $("#form").show();
        $('#deletePost').on("click", async function () {
            let result = await API_DeletePost(id);
            if (result){  emptyform();
                pageManager.update();
                pageManager.pageUi();
                showPost();
                pageManager.inform();  

            }  
            else
            emptyform();
            pageManager.inform();
        });
        $('#cancel').on("click", function (event) {
        event.stopPropagation();
        pageManager.inform();
        pageManager.pageUi();
        emptyform();
        showPost();
        });
    } 
}
function DeletePostEvent() {
    $(document).off('click', '.delete').on('click', '.delete', function (event) {
        event.preventDefault();
        event.stopPropagation();
        const postId = $(this).closest('.sample').attr('postId');
        renderDeletePostForm(postId)
    });
}
setInterval(async function () {
    let currentEtag = await API_GETHead("");
    if (Etag == null)
        Etag = currentEtag;
    else if (currentEtag != Etag) {
        Etag = currentEtag;
        console.log("page reloaded because of Etag difference cuureentEtag : " + currentEtag + "page Etag : " + Etag)
        pageManager.reset();
    }
}, 10000);


