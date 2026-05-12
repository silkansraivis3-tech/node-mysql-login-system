document.addEventListener("DOMContentLoaded", () => { // Wait until the HTML page is fully loaded
  const messageBox = document.querySelector(".auth-message");  // Find the message box on the page
  if (!messageBox) {  // If this page has no message box, stop the script
    return;
  }
  const params = new URLSearchParams(window.location.search);  // Read the URL parameters, for example ?error=wrong_login
  const error = params.get("error");  // Get possible error message code from URL
  // Get possible success message code from URL
  const success = params.get("success");
  const errorMessages = {  // List of error codes and readable messages
    missing_fields: "Please fill in all fields.",
    username_exists: "This username is already taken",
    short_password: "Password must be at least 6 characters.",
    email_exists: "This email is already registered.",
    wrong_login: "Wrong email or password.",
    server_error: "Something went wrong. Please try again."
  };
  const successMessages = {  // List of success codes and readable messages
    registered: "Account created successfully. You can log in now.",
    logged_out: "You have been logged out successfully."
  };
  if (error && errorMessages[error]) {  // If there is an error code and it exists in our list
    messageBox.classList.add("auth-message-error");    // Add error styling to the message box
    messageBox.textContent = errorMessages[error];    // Put the readable error text inside the message box
    messageBox.style.display = "block";    // Show the message box
  }
  if (success && successMessages[success]) {  // If there is a success code and it exists in our list
    messageBox.classList.add("auth-message-success");    // Add success styling to the message box
    messageBox.textContent = successMessages[success];    // Put the readable success text inside the message box
    messageBox.style.display = "block";    // Show the message box
  }
});