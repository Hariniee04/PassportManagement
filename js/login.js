document.getElementById("loginform").addEventListener("submit", function(event){

    event.preventDefault();


    let role = document.getElementById("role").value;
    let email = document.getElementById("email").value;

    let password = document.getElementById("password").value;



    let storeduser = JSON.parse(localStorage.getItem("user"));



    if(storeduser == null)
    {
        alert("No account found. Please register first.");
        return;
    }



    if(email == storeduser.email && password == storeduser.password)
    {
        alert("Login successful");

        localStorage.setItem("loggedin", "true");
        localStorage.setItem("selectedRole", role);

        window.location.href = "dashboard.html";
    }

    else
    {
        alert("Invalid email or password");
    }


});
