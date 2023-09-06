<script lang="ts">
	import QR from "$lib/index";
	import "../global.scss";

	let mediaErrorMessage = "";

	function onQRScan(event: CustomEvent) {
		alert(event.detail.qrContent);
	}
</script>

<div class="qr-container">
	<div class="qr-wrapper">
		<QR
			on:scan={onQRScan}
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
		background: #bc4e9c;
		background: radial-gradient(circle, #bc4e9c 0%, #f80759 100%);
		box-sizing: border-box;
		display: flex;
		justify-content: center;
		align-items: center;
		width: 100dvw;
		height: 100dvh;
		padding: 1rem;

		.qr-wrapper {
			display: flex;
			justify-content: center;
			align-items: center;
			border-radius: 1rem;
			overflow: hidden;
			width: 600px;
			max-width: 100%;
			aspect-ratio: 1 / 1;

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
