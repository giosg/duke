Duke - A Chrome Extension project
================

Based on  [https://github.com/flrent/chrome-extension-angular-base](https://github.com/flrent/chrome-extension-angular-base)

## Why "Duke"?
Because https://www.youtube.com/watch?v=uUcEGOLfUTE

## How to develop
- Fork this repo and clone it
- Run `npm install`
- Run `npm run dev` to build the extension into `dist/` and rebuild on changes (or `npm run build` for a one-off production build)
- Go to `chrome://extensions/`
- Activate developer mode
- Click on `Load unpacked`, locate your cloned repo and select the `dist` folder
- You can now modify the extension code, then reload the extension in `chrome://extensions/` to see your changes
- Do some changes and submit a pull request

## Publish new version of the extension
- Bump the version in `app/manifest.json` and in `package.json`/`package-lock.json`
   - e.g. `npm version 2.0.1 --no-git-tag-version` and then edit `app/manifest.json` by hand
   - The version shown in the popup is read from the manifest, so there is nothing else to update
- Build `duke2.zip` with `./build-and-package.sh`
   - The script fails if the manifest and `package.json` versions differ
   - The private key is not needed for updating the existing Chrome Web Store item. If you need to include it (e.g. first upload of a previously self-packaged extension), pass `--key=/path/to/key.pem`
- Upload `duke2.zip` to the Chrome Web Store developer dashboard
- Commit the version bump, push to master and tag the release (e.g. `git tag 2.0.1 && git push --tags`)
