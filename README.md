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
- Bump version in all places where it is referenced, see this commit for example: https://github.com/giosg/duke/pull/21/commits/94d27865cf70bed6536bb3a67a3f5d1eb3b0142e
- Build `duke2.zip` with `build-and-package.sh`
   - Example usage `./build-and-package.sh --key=/Users/myname/key.pem`
- The script should output `duke2.zip` and you can upload that to Chrome Webstore
- Commit version bump and push changes to master
