/**
 * Expo config entry point.
 *
 * Reads static settings from app.json and conditionally wires Firebase native
 * config files when they exist locally (never commit those files if policy requires).
 */
const fs = require('fs');
const path = require('path');

/** @type {import('expo/config').ExpoConfig} */
const appJson = require('./app.json');

const googleServicesJson = path.join(__dirname, 'google-services.json');
const googleServiceInfoPlist = path.join(__dirname, 'GoogleService-Info.plist');

const expo = { ...appJson.expo };

if (fs.existsSync(googleServicesJson)) {
  expo.android = {
    ...expo.android,
    googleServicesFile: './google-services.json',
  };
}

if (fs.existsSync(googleServiceInfoPlist)) {
  expo.ios = {
    ...expo.ios,
    googleServicesFile: './GoogleService-Info.plist',
  };
}

module.exports = { expo };
