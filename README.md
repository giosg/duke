Duke - A Chrome Extension project
================
![Duke](http://i.imgur.com/ns7QoLz.jpg)

Based on  [https://github.com/flrent/chrome-extension-angular-base](https://github.com/flrent/chrome-extension-angular-base)

## Get Started
- Clone this repo
- Run `npm install` and `bower install`
- Go to `chrome://extensions/`
- Activate developer mode
- Click on  `load an unpacked extension` and locate your cloned repo, and select the `app` folder

## Build and deploy
The build `manifest.json` file is `manifest-build.json`. It differs from the regular `manifest.json` to use only built files (single files for the all popup app, content scripts or background pages).

To build the app and get a single scripts for each popup app, content script, or background page, simpy run :

`grunt build`