Duke - A Chrome Extension project
================

Based on  [https://github.com/flrent/chrome-extension-angular-base](https://github.com/flrent/chrome-extension-angular-base)

## Why "Duke"?
Because https://www.youtube.com/watch?v=uUcEGOLfUTE

## How to develop
- Fork this repo and clone it
- Run `npm install` and `bower install`
- Go to `chrome://extensions/`
- Activate developer mode
- Click on  `load an unpacked extension` and locate your cloned repo, and select the `app` folder
- You can now modify the extension code and then reload page to see your changes
- Do some changes and submit a pull request

## Publish new version of the extension
Either follow the original documentation by Google: https://developer.chrome.com/extensions/packaging and do the building manually. See part "Uploading a previously packaged extension to the Chrome Web Store"

or you can use the `build-and-package.sh` to pack the exension

- First get the private key for Duke. Save it to some file i.e. `/Users/myname/key.pem`
- Bump version like in this commit https://github.com/giosg/duke/commit/0cc73a9f333a57b52ced95900a43c8cefb63af25
- Build `duke.zip` with `build-and-package.sh`
   - Example usage `./build-and-package.sh --key=/Users/myname/key.pem`
- The script should output `duke.zip` and you can upload that to Chrome Webstore
- Commit version bump and push changes to master
