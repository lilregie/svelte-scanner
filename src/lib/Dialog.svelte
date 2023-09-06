<script lang="ts">
	import { createEventDispatcher, onMount } from "svelte";
	import { fly, fade } from "svelte/transition";
	import Select from "svelte-select";

	import {
		detectMobileCameras,
		CameraDirection,
		cameraDirectionGuess,
	} from "$lib/cameraSelection";

	import type { Camera } from "$lib/instascan/camera";
	import { barcodeEngine } from "./instascan/scanAdapter";

	import CloseIcon from "./icons/CloseIcon.svelte";
	import { getValue, saveValue } from "./store";
	import Switch from "./Switch.svelte";
	import type { Writable } from "svelte/store";
	import { get } from "svelte/store";

	const dispatch = createEventDispatcher();

	export let mirrorCamera = getValue("mirrorCamera") || false;
	$: saveValue("mirrorCamera", mirrorCamera);

	export let camerasAvailable: Camera[];

	export let displayCameraSelectionDialog: boolean;

	export let smallModalXThreshold: number;
	export let selectedCameraID: Writable<string>;

	let previewWidth_px: number;
	let previewHeight_px: number;

	$: compactMode = previewWidth_px <= smallModalXThreshold;

	interface CameraSelection {
		value: string;
		label: string;
	}

	function cameraSelect(event: { detail: { value: string; label: string; }; }) {
		let id = event.detail.value;
		dispatch("camera", {
			id,
		});
		selectedCamera = event.detail;
	}

	function getUserCameraList(camerasAvailable: Camera[]): CameraSelection[] {
		if (detectMobileCameras(camerasAvailable)) {
			return camerasAvailable.map((camera) => ({
				label:
					cameraDirectionGuess(camera) === CameraDirection.Front
						? "Front Camera"
						: "Back Camera",
				value: camera.id,
			}));
		} else {
			return camerasAvailable.map((camera) => ({
				label: camera.name,
				value: camera.id,
			}));
		}
	}

	function closeDialog() {
		displayCameraSelectionDialog = false;
	}

	let selectedCamera: CameraSelection;

	onMount(()=>{
		let label = getUserCameraList(camerasAvailable).filter(camera => {
			return camera.value === get(selectedCameraID);
		})[0]?.label || "Unknown";

		selectedCamera = {
			value: get(selectedCameraID),
			label,
		};
	});
</script>

{#if displayCameraSelectionDialog}
	<div
		class="dialog-container"
		class:compact={compactMode}
		transition:fade
		on:click|self={closeDialog}
		on:keyup|self={closeDialog}
		bind:clientWidth={previewWidth_px}
		bind:clientHeight={previewHeight_px}
	>
		<div
			class="dialog-content"
			class:compact={compactMode}
			transition:fly={{ y: -200, duration: 350 }}
		>
			<div class="close-icon" on:click={closeDialog} on:keyup={closeDialog}>
				<CloseIcon />
			</div>
			<h3>Select a camera</h3>
			<!-- Container to inject style vars for svelte-select -->
			<div
				class="svelte-select-container"
				style="
				--listMaxHeight: {previewHeight_px / 2}px;
				--inputPadding: 0;
				"
			>
				<Select
					items={getUserCameraList(camerasAvailable)}
					on:select={cameraSelect}
					value={selectedCamera}
					searchable={false}
					clearable={false}
					listAutoWidth={false}
				>
					<div slot="empty">No cameras found<div>
				</Select>
			</div>

			<div class="mirror-input">
				<div class:selected={!mirrorCamera}>Don't Mirror</div>
				<div class="always-display"><Switch bind:checked={mirrorCamera} /></div>
				<div class="always-display key" class:selected={mirrorCamera}>Mirror Camera</div>
			</div>
			{#if $barcodeEngine !== null}
				<div class="barcode-engine">Barcode Engine: <code>{$barcodeEngine}</code></div>
			{/if}
		</div>
	</div>
{/if}

<style lang="scss">
	.dialog-container {
		position: absolute;
		left: 0;
		top: 0;
		width: 100%;
		height: 100%;
		background-color: rgba(0, 0, 0, 0.5);

		&:not(.compact) {
			display: flex;
			align-items: flex-start;
			justify-content: center;
		}

		.dialog-content {
			background-color: white;
			padding: 0.5em 1em;
			text-align: center;
			position: relative;

			&:not(.compact) {
				border-radius: 1rem;
				width: 50%;
				margin-top: 2em;
			}

			&.compact {
				border: rgba(0, 0, 0, 0.363) 1px solid;
				border-bottom: none;
			}

			h3 {
				margin: 0 0.2rem 0;
				font-size: 1.2rem;
			}

			.svelte-select-container {
				margin-bottom: 0.4rem;
			}

			.close-icon {
				position: absolute;
				top: 0.5em;
				right: 0.5em;
				cursor: pointer;
				transition: all 0.1s ease-in-out;

				&:hover {
					filter: drop-shadow(0 0 0.5rem #000);
				}
			}

			.mirror-input {
				margin-top: 0.5rem;
				display: grid;
				grid-template-columns: 1fr 0.5fr 1fr;

				$transition-size: 300px;

				div {
					color: grey;
					display: flex;
					justify-content: center;
					align-items: center;
					text-align: center;

					&.selected {
						color: rgb(31, 31, 31);
						font-weight: 700;
					}
				}

				@media (max-width: $transition-size) {
					grid-template-columns: 1fr 0.5fr;

					div {
						display: none;
						color: rgb(31, 31, 31);

						&.always-display {
							&.key {
								grid-row: 1;
								grid-column: 1;
							}
							display: initial;
						}
					}
				}
			}

			.barcode-engine {
				margin-top: 0.5rem;

				code {
					background-color: #eee;
					padding: 0.1rem;
					border-radius: 0.2rem;
					font-size: inherit;
				}
			}
		}
	}
</style>
