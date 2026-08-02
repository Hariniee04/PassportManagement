let loggedin = localStorage.getItem("loggedin");


if(loggedin != "true")
{
    window.location.href = "login.html";
}



let user = JSON.parse(localStorage.getItem("user"));


document.getElementById("username").innerHTML = user.name;



document.getElementById("logout").addEventListener("click", function(){

    localStorage.removeItem("loggedin");

    window.location.href = "login.html";

});