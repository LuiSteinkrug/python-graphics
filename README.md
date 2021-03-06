## Info
This is a walking skeleton web app for both development and production,
using:
- [laravel](https://github.com/laravel/laravel) (5.6 with php >= 7.1.3)
- mysql
- docker / docker-compose using the [offical php image](https://hub.docker.com/_/php/). 
- nginx

If you are looking for the community project of laravel + docker, have a look at [laradock](http://laradock.io/).<br/>
Also, [this medium post](https://medium.com/@shakyShane/laravel-docker-part-1-setup-for-development-e3daaefaf3c) helped me a lot to get started but watch out as it is not up to date anymore.

For a quick overview about Laravel and Docker, check out [this wiki page](https://github.com/andrelandgraf/laravel-docker/wiki/Laravel---Docker). 

## Feedback
Feel free to get inspired and more importantly provide [your feedback](https://github.com/andrelandgraf/laravel-docker/issues) on structure and style. I'm more than happy to learn how to improve my code and architecture.

## Prerequisites
! following guide does not work the same way for Windows !

**Install docker and docker-compose**

```
apt-get install docker.io
```

```
apt-get install docker-compose
```

**Clone this repository**
```
git clone https://github.com/andrelandgraf/laravel-docker.git
```
AND `cd laravel-docker` inside the project folder. 

**Install composer packages**
```
docker run --rm -v $(pwd):/app composer/composer install --ignore-platform-reqs

```
This will run the offical composer docker container, execute `composer install` and than remove the docker container again. <br/>
`--ignore-platform-reqs` mutes errors that might arise from the composer image's own php version, see: https://hub.docker.com/r/library/composer/.


## Start the development environment for the first time
**Start the docker containers**
```
docker-compose up
```

**Access the app container that runs the laravel application**
```
docker-compose exec app echo "Hello World!"
```

**Access the bash and keep it running**
```
docker-compose exec app bash -b
```
This eliminates the need to write `docker-compose exec app` everytime. Nevertheless, this guide will further add the docker-compose command to signal that you might want to run the command inside the docker container. 

**Grant Laravel writing rights**
```
docker-compose exec app chmod -R o+rw ./bootstrap ./storage
```

**Set up your .env file**
```
docker-compose exec app cpp .env.example .env
```

**Install the npm_modules**
 ```
docker-compose exec app npm install
```
Npm and node are already installed inside the container.<br/>
See the `package.json` file to check what packages will be installed by npm. 

**Setting up Git - Commit - ESLint**

If you use PhpStorm:
- Go to "File > Settings > Editor > File TypesSettings" and remove .git; from the Ignore files and folders text field
- IF the node runtime is missing, you have to install it locally on your machine: 
```
curl -sL https://deb.nodesource.com/setup_8.x | bash -\
    && apt-get install -y nodejs
```

Add the file .git/hooks/commit-msg and paste following code inside:
```
#!/bin/bash
files=$(git diff --cached --name-only | grep '\.jsx\?$')

# Prevent ESLint help message if no files matched
if [[ $files = "" ]] ; then
  exit 0
fi

failed=0
for file in ${files}; do
  git show :$file | ./node_modules/.bin/eslint $file
  if [[ $? != 0 ]] ; then
    failed=1
  fi
done;

if [[ $failed != 0 ]] ; then
  echo "🚫🚫🚫 ESLint failed, git commit denied!"
  exit $failed
fi
```

This prevents bad JS code to get commited. -> Fix ESLint errors and try to commit again.
IF the hook is not working, try: `chmod +x commit-msg`

You can run ESLint on the terminal like that: `./node_modules/.bin/eslint myFile.js`

**Application key - Setting up laravel after docker-compose up**
 ```
docker-compose exec app php artisan key:generate

```
This has to be done only once. 

No need for "docker-compose exec app php artisan optimize" anymore, see: 
https://laravel-news.com/laravel-5-6-removes-artisan-optimize

**Use the Artisan CLI to set up the database schema**
```
docker-compose exec app php artisan migrate:fresh --seed
````
[Artisan](https://laravel.com/docs/5.6/artisan) is the built-in CLI of laravel and provides you with a bunch of useful commands.<br/>
- `migrate:fresh` will clean the database (drop every table) and run through every migration file to set up the schema. 
- `--seed` tells artisan to run the `laravel-docker/database/seeds/DatabaseSeeder::run()` function to seed fake data into the database. 

## Working with PhpStorm

**Install the Laravel Plugin**

- Install plugin under "Settings > Plugins > Laravel Plugin"
- Activate it per Project under "Settings > Languages & Frameworks > PHP > Laravel"

**Configure Docker Compose**

1. Click on Edit Configurations... (next to the Play/Run Button)
2. Click New (The New button), create a new Docker Configuration
3. Select the compose file: ./docker-compose.yml
4. Apply changes and select the configuration and run (Play/Run Button) for "docker-compose up"

**Add the Data Source**

1. Make sure docker-compose up is running
2. Go to View > Tool Windows > Database
3. Click New (The New button), point to Data Source, and then choose MySQL (MariaDB).
4. Set the host name to local, port to 33061, database and user names to homestead, and set password to secret
5. If necessary, download the driver and test the connection.
6. For more information see the [jetbrains documentation](https://www.jetbrains.com/help/idea/running-a-dbms-image.html).

**Enable ESLint**

ESLint is na open source project and provides a pluggable linting utility for JavaScript. It will throw errors and warnings
according to the defined rules in the .eslintrc file. 

You cannot commit files that still have ESLint errors. See [#13](https://github.com/andrelandgraf/laravel-docker/issues/13) for more information

Make sure ESLint is enabled: `File > Settings > Languages & Frameworks > JavaScript > Code Qualitity Tools > ESLint` to receive the warnings within the IDE.

**Enable EditorConfig**

The file .editorconfig describes project wide rules for code styles. Make sure you have the Plugin EditorConigh installed and enabled. 
1. File > Settings > Plugins > look for EditorConfig and install it. 
2. File > Settings > Editor > Code Style > Enable EditorConfig support


## Working with the development environment

```
docker-compose up
```
This command starts all three containers.

**Check the containers**

```
docker ps
```

**The Web Application**

Afer `docker-compose up` you can access the local web app via: http://localhost:8080/

**Work within the container**

This will open a bash within the docker container so you can interact with php artisan and other dev tools.
```
docker-compose exec app bash -b
```
For example use [php artisan tinker](https://scotch.io/tutorials/tinker-with-the-data-in-your-laravel-apps-with-php-artisan-tinker) to work with your database like follows:
```
root@dockercontainer:/var/www# php artisan tinker
>>> App\Pizza::count()
=> 10
>>> App\Pizze::all()
=> ...
```

**Let Wepback watch any changes**
```
docker-compose exec app npm run watch
```
This will run the watch-script specified within the `package.json`. Wepback will compile any new changes to your js and css/scss files and put them into the `/public` folder.

## Start Production Environment


## Edit dockerfile if nesessary
```
# check the current WORKDIR with:
RUN pwd
```
