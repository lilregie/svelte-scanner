<script lang="ts">
	import type { Scanner } from "./instascan/scanner";
	import { onDestroy, onMount } from "svelte";
	import { BROWSER } from "esm-env";
	import { fade } from "svelte/transition";
	import { createEventDispatcher } from "svelte";

	import Dialog from "./Dialog.svelte";

	import { saveValue, getValue } from "$lib/store";
	import { chooseCamera } from "$lib/cameraSelection";
	import type { Camera } from "./instascan/camera";
	import { mediaErrorToMessage } from "$lib/mapErrorToHumanMessage"
	import GearIcon from "./icons/GearIcon.svelte";
	import { testCapabilities } from "./capabilty";
	import type { Writable, Unsubscriber } from 'svelte/store'
	import { writable } from "svelte/store";

	const dispatch = createEventDispatcher();

	export let scannerInitialized = false;
	let camerasInitialized: boolean = false;

	// Whether to scan continuously for QR codes. If false, use scanner.scan() to manually scan.
	// If true, the scanner emits the "scan" event when a QR code is scanned. Default true.
	let continuous = true;

	// Whether to include the scanned image data as part of the scan result. See the "scan" event
	// for image format details. Default false.
	let captureImage = false;

	// Only applies to continuous mode. Whether to actively scan when the tab is not active.
	// When false, this reduces CPU usage when the tab is not active. Default true.
	export let backgroundScan = false;

	// Only applies to continuous mode. The period, in milliseconds, before the same QR code
	// will be recognized in succession. Default 5000 (5 seconds).
	export let refractoryPeriod = 5000;

	// Only applies to continuous mode. The period, in rendered frames, between scans. A lower scan period
	//  increases CPU usage but makes scan response faster. Default 1 (i.e. analyze every frame).
	export let scanPeriod = 1;

	export let mediaErrorMessage = "";

	// Decides the style of the modal for the camera selection dialog.
	export let smallModalXThreshold: number = 400;

	let displayCameraSelectionDialog = false;

	let camerasAvailable: Camera[] = [];
	let selectedCameraID: Writable<string> = writable(getValue("selectedCameraID"));

	let scanner: Scanner;

	let videoPreviewElm: HTMLVideoElement;

	let Instascan: typeof import("./instascan/index").Instascan;

	async function updateCamera(selectedCameraID: string) {
		if (!BROWSER || !Instascan) {
			return null;
		}
		scannerInitialized = false;

		// When permissions are denied, it creates a fake camera
		if (!camerasAvailable || camerasAvailable.length === 0 || camerasAvailable[0].name === null) {
			return null
		}
		let [newChosenCamera, currentCameraMirrorStatus] = chooseCamera(
			camerasAvailable,
			selectedCameraID
		);

		if (scanner) {
			await cameraStop();
		}
		await cameraStart(newChosenCamera, currentCameraMirrorStatus);
	}
	let mirror: boolean;

	async function cameraStart(camera: Camera, currentCameraMirrorStatus: boolean) {
		let capabilities = await testCapabilities();

		if (capabilities) {
			createMediaError(capabilities);
			return;
		}

		if (BROWSER) {
			console.log("Starting With Camera", camera)

			if (camera) {
				scanner = new Instascan.Scanner({
					video: videoPreviewElm,
					continuous,
					mirror: currentCameraMirrorStatus,
					captureImage,
					backgroundScan,
					refractoryPeriod,
					scanPeriod,
				});
				camerasInitialized = true;

				scanner.addListener("scan", function (qrContent: string) {
					dispatch("scan", {
						qrContent,
					});
				});
				scanner.addListener("active", function () {
					scannerInitialized = true;
				});
				console.log("Camera chosen")
				await scanner.start(camera);
			} else {
				camerasInitialized = false;
				console.error("No cameras found.");
			}
		}
	}

	async function cameraStop() {
		if (scanner) {
			await scanner.stop();
		} else {
			console.error("No scanner to stop");
		}
	}

	let selectedCameraUnsubscriber: Unsubscriber;

	onMount(async () => {
		if (BROWSER) {
			({ Instascan } = await import("./instascan/index"));
			Instascan.Camera.setMediaErrorCallback(createMediaError);

			camerasAvailable = await Instascan.Camera.getCameras();
			console.log(camerasAvailable);

			selectedCameraUnsubscriber = selectedCameraID.subscribe(async (newSelectedCameraID) => {
				updateCamera(newSelectedCameraID);
			});
		}
	});

	onDestroy(async () => {
		if (BROWSER) {
			if (selectedCameraUnsubscriber) {
				selectedCameraUnsubscriber();
			}
			if (scanner) {
				await cameraStop();
			}

		}
	});

	function onSettingsClick() {
		displayCameraSelectionDialog = !displayCameraSelectionDialog;
	}

	function cameraSelect(event: CustomEvent) {
		console.log("Camera select event")
		selectedCameraID.set(event.detail.id as string);
		saveValue("selectedCameraID", event.detail.id);
		displayCameraSelectionDialog = false;
	}

	function createMediaError(err: Error) {
		mediaErrorMessage = mediaErrorToMessage(err);
		camerasInitialized = false;
		scannerInitialized = true;
	}
</script>

<div class="video-container">
	<video
		id="cam-preview"
		bind:this={videoPreviewElm}
		hidden={!scannerInitialized || !camerasInitialized}
		style={ mirror ? "--mirror-enabled: -1" : "--mirror-enabled: 1" }
		autoplay
		muted
		playsinline
	/>
	{#if scannerInitialized}
		<button class="floating-action-button" on:click={onSettingsClick}>
			<GearIcon />
		</button>
	{/if}

	<Dialog
		bind:camerasAvailable
		bind:displayCameraSelectionDialog
		on:camera={cameraSelect}
		bind:smallModalXThreshold
		bind:mirrorCamera={mirror}
		bind:selectedCameraID
	/>

	{#if !scannerInitialized}
		<div transition:fade|local class="transition-wrapper">
			<slot name="loading" />
		</div>
	{:else if !camerasInitialized}
		<div transition:fade|local class="transition-wrapper">
			<slot name="failedToInitialize" />
		</div>
	{/if}
</div>

<style lang="scss">
	.video-container {
		box-sizing: border-box;
		position: relative;
		overflow: hidden;
		display: flex;
		justify-content: center;
		align-items: center;
		height: 100%;
		width: 100%;

		#cam-preview {
			background: #222222;
			object-fit: cover;
			transform: scaleX(var(--mirror-enabled));
			height: 100%;
			width: 100%;
		}

		.floating-action-button {
			position: absolute;
			right: 5%;
			bottom: 5%;
			border: none;
			background: none;
			cursor: pointer;
			z-index: 2;

			:global(svg) {
				color: rgba(255, 255, 255, 0.8);
				filter: drop-shadow(2px 2px 2px rgba(0, 0, 0, 0.5));
			}
		}

		.transition-wrapper {
			height: 100%;
			width: 100%;
		}
	}
</style>
