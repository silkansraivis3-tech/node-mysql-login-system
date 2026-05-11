ni COMMANDS.md : Creates command documentation file.
node -v : Checks installed Node.js version.
npm -v : Checks installed npm package manager version.
git --version : Checks installed Git version.
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned  :  Allows npm scripts in PowerShell.
mkdir login-demo : Creates project folder named login-demo.
cd login-demo : Enters the login-demo folder.
code . : Opens current folder in VS Code.
npm init -y : Creates default Node.js project configuration.
npm install express mysql2 bcrypt express-session dotenv : Installs backend and database packages.
npm install --save-dev nodemon : Installs auto-restart tool for development.
mkdir public : Creates folder for frontend HTML files.
ni server.js : Creates backend server file.
ni .env : Creates private environment settings file.
ni .env.example : Creates public example settings file.
ni .gitignore : Creates Git ignore rules file.
ni public\index.html : Creates homepage HTML file.
ni public\register.html : Creates registration page file.
ni public\login.html : Creates login page file.
npm pkg set scripts.start="node server.js" : Adds normal server start command.
npm pkg set scripts.dev="nodemon server.js" : Adds development auto-restart start command.
npm run dev : Starts server using nodemon.
ctrl + c : stop running server
Ctrl + click link in terminal : Opens local server link in browser.


essential project commands
cd folder-name : enter a folder
cd .. : go back one folder
dir : show files/folders in current location
mkdir folder-name : create a new folder
code . : open current folder in vs code

sql:
SELECT * FROM users; : Shows all users saved in table.
USE login_demo; : use exact db
SHOW TABLES; : show tables
CREATE DATABASE IF NOT EXISTS login_demo; : create project database if missing

git:
git init : Starts Git tracking in current project.
git status : Shows changed and tracked project files.
git add . : Prepares all current changes for commit.
git commit -m "message" : Saves prepared changes with a message.