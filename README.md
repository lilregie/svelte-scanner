# Modern Svelte QR Scanner
This is a work-in-progress component library to enable QR-code scanning.

### Origin

This is based on `instascan`, and is designed as a more batteries included version of [QRScanner](https://github.com/Pedroglp/svelte-qr-scanner). It has the source of `instascan` and `fsm-as-promised` bundled inside, as they both have modifications to work with Svelte.

## Barcode Scanning Engine

This library tries to use the [Barcode Detection API](https://developer.mozilla.org/en-US/docs/Web/API/Barcode_Detection_API) for native performance, but the support is [lack-luster](https://developer.mozilla.org/en-US/docs/Web/API/Barcode_Detection_API#browser_compatibility) to say the least (only really stabilized on android phones). So we also load a backup library, `Zxing`, which is a WASM implementation of the QR-code scanning algorithm. ZXing is also a bit slower than the native API, but it's a lot more likely to be supported.


## Install
Just open your project and use the command line to install:

```bash
yarn add -D @lilregie/svelte-scanner             # if you are using yarn
npm install --save-dev @lilregie/svelte-scanner  # if you are using npm
```

## Usage

Assuming you have a SvelteKit app up and running, just paste in the following example

```svelte
<script lang="ts">
  import QR from "@lilregie/svelte-scanner";

  let previewWidth;
  let mediaErrorMessage = "";

  function onQRScan(event: CustomEvent) {
    alert(event.detail.qrContent);
  }
</script>
<div class="qr-container">
  <div class="qr-wrapper" bind:clientWidth={w}>
    <QR
      on:scan={onQRScan}
      bind:mediaErrorMessage
    >
      <div slot="loading" class="loading">
        <span>Loading Animation, but text</span>
      </div>
      <p slot="failedToInitialize" class="failed-to-initialize">
        Failed to initialize camera.<br>
        Error: {mediaErrorMessage}
      </p>
    </QR>
  </div>
</div>
```

## API Reference

### Slots

| Slot Name          | Description                                       |
|--------------------|---------------------------------------------------|
| loading            | Displayed while the cameras are initializing.     |
| failedToInitialize | Displayed when the current camera fails to start. |


### Props (Options)

| Prop                 | Type    | Default | Read-only | Description                                                                                                                                                  |
|----------------------|---------|---------|-----------|--------------------------------------------------------------------------------------------------------------------------------------------------------------|
| scannerInitialized   | boolean | false   | x         | Whether the QR code scanner has loaded yet.                                                                                                                  |
| backgroundScan       | boolean | false   |           | Whether to actively scan when the tab is not active. When false, this reduces CPU usage when the tab is not active.                                          |
| refractoryPeriod     | number  | 5000    |           | The period, in milliseconds, before the same QR code will be recognized in succession. Default 5000 (5 seconds).                                             |
| scanPeriod           | number  | 1       |           | The period, in rendered frames, between scans. A lower scan period increases CPU usage but makes scan response faster. Default 1 (i.e. analyze every frame). |
| mediaErrorMessage    | string  | ""      | x         | Human readable error message, updates when there is a new error. Useful displayed in the failedToInitialize slot.                                            |
| smallModalXThreshold | number  | 400     |           | The width threshold to move the camera selection from a traditional center of screen modal, to being pined to the top.                                       |

### Events

| Event ID | Description                        | Data Structure     |
|----------|------------------------------------|--------------------|
| scan     | Emitted when a QR code is scanned. | {"qrContent": "x"} |

## Developing Library

Once you've created a project and installed dependencies with `yarn`, start a development server:

```bash
yarn dev

# or start the server and open the app in a new browser tab
yarn dev -- --open
```

# Building

To create a production version of the library, simply run the `package` script:

```bash
yarn package
```

## Known Errors
1. svelte-select not being included
For some reason, sometimes you might have to install `svelte-select` manually with a fresh project.

Fix:

```bash
yarn add -D svelte-select            # if you are using yarn
npm install --save-dev svelte-select # if you are using npm
```

2. Library's requiring bundling
When using SvelteKit, you must include some of the older library's in the optimizeDeps option.

Fix: Add them to your `svelte.config.js`.

```js
const config = {
  …,
  kit: {
     …,
     vite: {
      …,
      optimizeDeps: {
        include: [
          "events",
          "uuid",
          "visibilityjs",
          "stampit",
          "lodash",
        ]
      },
     }
  },
};
```