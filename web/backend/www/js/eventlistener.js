document.getElementById('isInternalGit').addEventListener('change', function() {
    var gitName = document.getElementById('gitReposUser');
    var gitPassword = document.getElementById('gitReposPassword');
    var gitReposLabel = document.getElementById('gitReposUrlLabel');
    var gitReposUrl = document.getElementById('gitReposURL');

    if (this.checked) {
        gitName.innerHTML = "";
        gitName.disabled = true;
        gitPassword.innerHTML = "";
        gitPassword.disabled = true;
        gitReposUrl.placeholder = "Testrepository";
        gitReposLabel.innerHTML = "Git Repository Name";
    } else {
        gitName.disabled = false;
        gitPassword.disabled = false;
        gitReposUrl.placeholder = "https://github.com/Username/repos.git";
        gitReposLabel.innerHTML = "Git Repository URL";
    }
});