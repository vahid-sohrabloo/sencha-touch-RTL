Sencha touch RTL
================

sencha touch 2 RTL

work on
Android 2.x
Android 4.x
google chrome

maybe not work on ios. if any one can help to test  with ios please pull request.


## Demo

very soon upload


## Install

add sencha-touch-rtl.css  after sencha touch css and add sencha-rtl.js after  secnha js.

Note:
If user app.json just add this files in this file. like

```json
{
    "name": "Ajax",
    "js": [
        {
            "path": "../../sencha-touch-all-debug.js"
        },{
            "path": "../../rtl.js"
        },
        {
            "path": "app.js",
            "update": "delta"
        }
    ],
    "css": [
        {
            "path": "../../resources/css/sencha-touch.css",
            "update": "delta"
        },
	 {
            "path": "../../sencha-touch-rtl.css",
            "update": "delta"
        }
    ],
    "appCache": {
        "cache": [
            "index.html"
        ],
        "network": [
            "*"
        ],
        "fallback": []
    },
    "extras": [
        "resources/images",
        "resources/icons",
        "resources/loading"
    ],
    "archivePath": "archive",
    "buildPaths": {
        "testing": "../../deploy/testing/forms",
        "production": "../../deploy/production/forms",
        "package": "../../deploy/package/forms",
        "native": "../../deploy/native/forms"
    },
    "buildOptions": {
        "product": "touch",
        "minVersion": 3,
        "debug": false,
        "logger": "no"
    },
    "id": "3a867610-670a-11e1-a90e-4318029d18bb"
}
```
