"use strict";

// function postComment () {
//     var imgsname = document.getElementById("imgn");
//     var newcomment = document.getElementById("inputcomment");
//     console.log(imgsname.innerHTML, newcomment.value);
//     $.ajax(
//         {
//             url: "/comment",
//             type: 'post',
//             data: {"comment": newcomment.value, "commentimg": imgsname.innerHTML}
//         }) .done(function (result) {
//                 console.log("ajax success!");
//                 console.log(result);
//                 var div = document.getElementById("box");
//                 var p = document.createElement("p");
//                 p.innerHTML = result.commenter + ":" + result.content;
//                 div.appendChild(p);
//             });
// }

function postComment () {
    var imgsname = document.getElementById("imgn");
    var newcomment = document.getElementById("inputcomment").value;
    console.log(imgsname.innerHTML, newcomment);
    $.ajax(
        {
            url: "/comment",
            type: 'post',
            data: {"comment": newcomment, "commentimg": imgsname.innerHTML}
        }) .done(function (result) {
            if(result == "login") {
                alert("Please login first!");
            }
            else {
                console.log(result);
                var div = document.getElementById("commentbox1");
                var p = document.createElement("p");
                p.innerHTML = result.commenter + " : " + result.content;
                div.appendChild(p);
                document.getElementById("inputcomment").value = null;
            }
    });
}

function like() {
    var likeimg = document.getElementById("imgn");
    console.log(likeimg.innerHTML);
    $.ajax(
        {
            url: "/like",
            type: 'post',
            data: {"likeimg": likeimg.innerHTML}
        }
    ) .done(function (result) {
        if(result == "login") {
            alert("Please login first!");
        }
        else {
            console.log(result);
            var likecount =document.getElementById("likecounter").innerHTML;
            document.getElementById("likecounter").innerHTML = parseInt(likecount,10)+1;
            document.getElementById("like-btn").disabled = true;
        }
    })
}