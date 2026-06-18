(function () {
    function ready(fn) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", fn);
        } else {
            fn();
        }
    }

    ready(function () {
        var video = document.getElementById("movie-player");
        var start = document.getElementById("player-start");
        if (!video) {
            return;
        }

        var stream = video.getAttribute("data-stream");
        var attached = false;
        var hlsInstance = null;

        function attach() {
            if (attached || !stream) {
                return;
            }
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = stream;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({ enableWorker: true });
                hlsInstance.loadSource(stream);
                hlsInstance.attachMedia(video);
            } else {
                video.src = stream;
            }
            attached = true;
        }

        function hideOverlay() {
            if (start) {
                start.classList.add("is-hidden");
            }
        }

        function play() {
            attach();
            hideOverlay();
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {});
            }
        }

        if (start) {
            start.addEventListener("click", play);
        }

        video.addEventListener("click", function () {
            if (video.paused) {
                play();
            }
        });

        video.addEventListener("play", hideOverlay);

        window.addEventListener("beforeunload", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    });
})();
