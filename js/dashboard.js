let loggedin = sessionStorage.getItem("loggedin");


if(loggedin != "true")
{
    window.location.href = "login.html";
}



let user = JSON.parse(sessionStorage.getItem("user"));


document.getElementById("username").innerHTML = user.name;



document.getElementById("logout").addEventListener("click", function(){

    sessionStorage.clear();

    window.location.href = "login.html";

});
