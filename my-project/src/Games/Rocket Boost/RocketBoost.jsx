/** @format */

import React, { useEffect } from "react";
import Header from "../../Components/Header";
import Footer from "../../Components/Footer";

const RocketBoost = () => {
  useEffect(() => {
    const canvas = document.getElementById("unity-canvas");
    const loadingBar = document.getElementById("unity-loading-bar");
    const progressBarFull = document.getElementById("unity-progress-bar-full");
    const fullscreenButton = document.getElementById("unity-fullscreen-button");
    const warningBanner = document.getElementById("unity-warning");

    function unityShowBanner(msg, type) {
      function updateBannerVisibility() {
        warningBanner.style.display = warningBanner.children.length
          ? "block"
          : "none";
      }
      const div = document.createElement("div");
      div.innerHTML = msg;
      warningBanner.appendChild(div);
      if (type === "error") div.style = "bg-red-500 p-2 text-white";
      else {
        if (type === "warning") div.style = "bg-yellow-500 p-2 text-black";
        setTimeout(() => {
          warningBanner.removeChild(div);
          updateBannerVisibility();
        }, 5000);
      }
      updateBannerVisibility();
    }

    const buildUrl = "/Build";
    const loaderUrl = `${buildUrl}/Rocket Boost.loader.js`;
    const config = {
      dataUrl: `${buildUrl}/Rocket Boost.data`,
      frameworkUrl: `${buildUrl}/Rocket Boost.framework.js`,
      codeUrl: `${buildUrl}/Rocket Boost.wasm`,
      streamingAssetsUrl: "StreamingAssets",
      companyName: "DefaultCompany",
      productName: "Project Boost",
      productVersion: "0.1",
      showBanner: unityShowBanner,
    };

    function resizeCanvas() {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const aspectRatio = 960 / 600; 
      let newWidth, newHeight;

      if (width / height > aspectRatio) {
        newHeight = height;
        newWidth = height * aspectRatio;
      } else {
        newWidth = width;
        newHeight = width / aspectRatio;
      }

      canvas.style.width = `${newWidth}px`;
      canvas.style.height = `${newHeight}px`;
    }

    window.addEventListener("resize", resizeCanvas);
    resizeCanvas(); 

    loadingBar.style.display = "block";

    const script = document.createElement("script");
    script.src = loaderUrl;
    script.onload = () => {
      createUnityInstance(canvas, config, (progress) => {
        progressBarFull.style.width = 100 * progress + "%";
      })
        .then((unityInstance) => {
          loadingBar.style.display = "none";
          fullscreenButton.onclick = () => {
            unityInstance.SetFullscreen(1);
          };
        })
        .catch((message) => {
          alert(message);
        });
    };

    document.body.appendChild(script);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      document.body.removeChild(script);
    };
  }, []);

  return (
    <>
      <Header />
      <div
        id="unity-container"
        className="flex flex-col justify-center items-center min-h-screen w-screen bg-gray-900 p-4"
      >
        <h1 className="text-4xl md:text-6xl text-center text-white font-bold mb-6">
          Rocket Boost
        </h1>
        <canvas
          id="unity-canvas"
          className="w-full max-w-[960px] h-auto max-h-[600px] border-2 border-gray-300"
          tabIndex="-1"
        ></canvas>
        <div
          id="unity-loading-bar"
          className="absolute top-0 left-1/2 transform -translate-x-1/2 mt-4"
        >
          <div id="unity-logo"></div>
          <div
            id="unity-progress-bar-empty"
            className="relative w-full h-4 bg-gray-300"
          >
            <div
              id="unity-progress-bar-full"
              className="absolute left-0 top-0 h-full bg-blue-500"
            ></div>
          </div>
        </div>
        <div id="unity-warning" className="absolute bottom-4"></div>
        <div
          id="unity-footer"
          className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex flex-col items-center"
        >
          <div id="unity-webgl-logo"></div>
          <button
            id="unity-fullscreen-button"
            className="bg-gray-800 text-white px-4 py-2 rounded mt-2 hover:bg-gray-700"
          >
            Fullscreen
          </button>
          <div id="unity-build-title" className="text-white mt-2 text-lg">
            Rocket Boost
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default RocketBoost;
