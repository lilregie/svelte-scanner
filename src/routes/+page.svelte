<script lang="ts">
	import QR from "$lib/index";
	import "../global.scss";

	let w: number;
	let mediaErrorMessage = "";

	function onQRScan(event: CustomEvent) {
		alert(event.detail.qrContent);
	}
</script>

<div class="qr-container">
	<div class="qr-wrapper" bind:clientWidth={w}>
		<QR
			on:scan={onQRScan}
			previewWidth_px={w}
			previewHeight_px={w}
			bind:mediaErrorMessage
		>
			<div slot="loading" class="loading">
				<span>Loading</span>
			</div>
			<div slot="failedToInitialize" class="failed-to-initialize">
				Failed to initialize camera.<br>
				{mediaErrorMessage}
			</div>
		</QR>
	</div>
</div>

<style lang="scss">
	.qr-container {
		width: 100vw;
		display: flex;
		justify-content: center;

		.qr-wrapper {
			width: 100vw;
			max-width: 600px;
			background: #222222;

			.loading,
			.failed-to-initialize {
				background: #222222;
				height: 100%;
				width: 100%;
				display: flex;
				text-align: center;
				justify-content: center;
				align-items: center;
				color: white;
				font-size: 1.25rem;
			}

			.loading span {
				animation: glow 1s infinite alternate;

				@keyframes glow {
					100% {
						text-shadow: 0 0 5px white;
					}
				}
			}
		}
	}
</style>
