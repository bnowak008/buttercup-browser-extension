<h1 align="center">
  <br/>
  <img src="https://cdn.rawgit.com/buttercup-pw/buttercup-assets/4bbfd317/badge/browsers.svg" alt="Buttercup for Browsers">
  <br/>
  <br/>
  <br/>
</h1>

# Buttercup Browser Extension
Buttercup credentials manager extension for the browser.

<p align="center">
    <img src="https://raw.githubusercontent.com/buttercup/buttercup-browser-extension/master/chrome-extension.jpg" />
</p>

[![Buttercup](https://cdn.rawgit.com/buttercup-pw/buttercup-assets/6582a033/badge/buttercup-slim.svg)](https://buttercup.pw) ![Tests status](https://github.com/buttercup/buttercup-core/actions/workflows/test.yml/badge.svg) [![Chrome version](https://img.shields.io/chrome-web-store/v/heflipieckodmcppbnembejjmabajjjj)](https://chrome.google.com/webstore/detail/buttercup/heflipieckodmcppbnembejjmabajjjj?hl=en-GB) [![Chrome users](https://img.shields.io/chrome-web-store/d/heflipieckodmcppbnembejjmabajjjj.svg?label=Chrome%20users)](https://chrome.google.com/webstore/detail/buttercup/heflipieckodmcppbnembejjmabajjjj?hl=en-GB) [![Firefox version](https://img.shields.io/amo/v/buttercup-pw)](https://addons.mozilla.org/en-US/firefox/addon/buttercup-pw/) [![Firefox users](https://img.shields.io/amo/users/buttercup-pw.svg?color=38c543&label=Firefox%20users)](https://addons.mozilla.org/en-US/firefox/addon/buttercup-pw/) [![Chat securely on Keybase](https://img.shields.io/badge/keybase-bcup-blueviolet)](https://keybase.io/team/bcup)

---

⚠️ **Project Closure** ⚠️

The Buttercup project has come to an end, and these repositories are in transition to becoming public archives. No public-facing resources will be removed, wherever possible. Please do not create issues or PRs - they will unfortunately be ignored. Discussion can be found [here](https://github.com/buttercup/buttercup-desktop/discussions/1395), and explanation [here](https://gist.github.com/perry-mitchell/43ebfcec4d874b77a704be1d4f2262e6).

---

## About
This browser extension allows users to interface with password archives authored by the [Buttercup password manager](https://github.com/buttercup-pw/buttercup) (it _requires_ v2.26 and later of the desktop application to be installed to function).

The extension makes secured requests to the desktop application for information within its unlocked vaults, and makes those credentials available within the browser. It is also able to save new logins from the browser extension as they're recognised. Besides a username and password, the extension can also enter OTP codes when required.

<img src="https://raw.githubusercontent.com/buttercup/buttercup-browser-extension/master/chrome-extension-2.jpg" />

### Forms & Logins

Buttercup for Browsers auto-detects some login forms and login inputs, allowing the user to auto-fill them at their discretion. This extension uses [Locust](https://github.com/buttercup/locust) under the hood to **detect forms and inputs** (any issues with detecting forms and inputs should be opened there).

### Supported browsers

[Chrome](https://chrome.google.com/webstore/detail/buttercup/heflipieckodmcppbnembejjmabajjjj?hl=en-GB), [Firefox](https://addons.mozilla.org/en-US/firefox/addon/buttercup-pw/), [Edge](https://www.microsoft.com/en-us/edge) (version 79+) and [Brave](https://chrome.google.com/webstore/detail/buttercup/heflipieckodmcppbnembejjmabajjjj) are supported.

_Some browsers, such as **Brave** for example, will be able to install Buttercup via the Google Chrome web store._

Other browsers will be supported in order of request/popularity. Issues created for unsupported browsers, or for browsers not on the roadmap, may be closed without warning.

**Opera** is not supported due to their incredibly slow and unreliable release process. We will not be adding support for Opera.

### Integrated platforms

The extension allows for connections to several services, such as Dropbox and Google Drive. The extension supports whatever platforms the desktop application does, including local vaults.

#### Supported platforms

The browsers listed above, running on Windows, Mac or Linux on a desktop platform. This extension is not supported on any mobile or tablet devices.

### Usage

The browser extension can be controlled from the **popup menu**, which is launched by pressing the Buttercup button in the browser menu. This menu displays a list of archives as well as settings and other items.

When viewing pages that contain login forms, Buttercup can assist logging in when you interact with the login buttons (displayed beside detected login inputs).

Buttercup can also remember new logins, which are detected as they occur.

You can **block** Buttercup from detecting forms and inputs by applying the attribute `data-bcupignore=true`:

```html
<input type="email" data-bcupignore="true" />
```

### Development

Development of features and bugfixes is supported in the following environment:

 * NodeJS version 20 (latest minor version)
 * Linux / Mac
 * Tested in at least Chrome / Firefox
 
To set up your development environment:
 * Clone this repo
 * Ensure API keys are available (Google Drive)
 * Execute `npm install` inside the project directory
 * Run `npm run dev:chrome` or similar
 * Load the unpacked `dist` folder in your browser addons

#### Chrome

Run the following to develop the extension:

 1. Execute `npm run dev:chrome` to build and watch the project (to build production code, execute `npm run build`)
 2. Go to [chrome://extensions](chrome://extensions) and enable _"Developer mode"_
 3. Select the new button _"Load unpacked"_, then select the `./dist` directory built on step 1

#### Firefox

Run the following to develop the extension:

 * Execute `npm run dev:firefox` to build and watch the project (to build production code, execute `npm run release`)

#### Releasing

To build release-ready zip archives, run the command `npm run release` after having set up the development environment. The archives will be written to `release/(browser)` where `(browser)` is the browser type. Archives named `extension.zip` contain the built extension sourcecode and `source.zip` contains the raw source.

### Adding to Chrome

You can load an **unpacked extension** in Chrome by navigating to [chrome://extensions/](chrome://extensions/). Simply locate the project's directory and use **dist/** as the extension directory.

### Adding to Firefox

You can load an **unpacked extension** in Firefox by navigating to [about:debugging](about:debugging). Click "Load Temporary Add-on" and locate the project's directory, using **dist/** as the extension directory.
