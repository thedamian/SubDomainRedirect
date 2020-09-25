# SubDomain Redirect

This project is to create a bit.ly type service but instead of using the route (bit.ly/this) it's for subdomains of a domain you control like *.YourDomain.com 

You simply point the *.yourDomain.com (sometimes called "wildcard") to one server (or service like aws, azure) you control

One installed and running simply go to any subdomain.yourDomain.com/newUrl and once you login (see below) you'll have access to a simple admin panel where you can add any subdomain and have it redirect to any domain you'd like

## to run it locally (or on a server)
- `git pull` 
- `npm i`
- Edit the auth.js and change the `username` and `password` to valid entries for you.
- `node SubDomainRedirect.js` for testing
- Go to `http://localhost:5008/newUrl` to acces your admin panel
- Don't go to the root if you're using localhost (it'll crash), but normally if you go to SomethingWrong.YourDomain.com it'll redirect to YourDomain.com (with localhost it doesn't work)
- Enjoy!
