document.getElementById("registerform").addEventListener("submit", function(event){

    event.preventDefault();

    let name = document.getElementById("name").value;
    let email = document.getElementById("email").value;
    let password = document.getElementById("password").value;


    let user = {
        name: name,
        email: email,
        password: password
    };


    localStorage.setItem("user", JSON.stringify(user));


    alert("Registration successful");


    window.location.href = "login.html";

});