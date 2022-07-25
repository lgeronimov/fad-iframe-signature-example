window.onload = function () {
  initIframe();
};

// events available
const EVENT_MODULE = {
  INIT_MODULE: "INIT_MODULE",
  PROCESS_INIT: "PROCESS_INIT",
  PROCESS_ERROR: "PROCESS_ERROR",
  PROCESS_COMPLETED: "PROCESS_COMPLETED",
  MODULE_READY: "MODULE_READY",
  CAMERA_ACCEPTED: 'CAMERA_ACCEPTED',
  MODULE_CLOSED: 'MODULE_CLOSED'
};


// optional, the app has default configuration, legends and colors
const CONFIGURATION = {
  views: {
    instructions: true,
    preview: true
  },
  selfie: {
    captureSelfie: false,
    imageType: 'image/png',
    imageQuality: 1
  },
  customization: {
    fadCustomization: {
      colors: {
        primary: "#A70635",
        secondary: "#A70635",
        tertiary: "#363636",
      },
      buttons: {
        primary: {
          backgroundColor: "#A70635",
          backgroundColorDisabled: "#dcdcdc",
          labelColor: "#ffffff",
          labelColorDisabled: "#8e8e8e",
          border: "1px solid #A70635",
        },
      },
      fonts: {
        title: {
          fontSize: '25px',
          fontFamily: 'system-ui'
        },
        subtitle: {
          fontSize: '17px',
          fontFamily: 'system-ui'
        },
        content: {
          fontSize: '15px',
          fontFamily: 'system-ui'
        },
        informative: {
          fontSize: '12px',
          fontFamily: 'system-ui'
        },
        button: {
          fontSize: '17px',
          fontFamily: 'system-ui'
        }
      }
    },
    moduleCustomization: {
      legends: {
        tapInstruction: 'Da un toque en el recuadro para empezar a firmar',
        buttonFinish: 'Terminar',
        initializing: 'iniciando',
        processing: 'procesando',
        recording: 'Grabando',
        focusFace: 'Enfoca tu rostro dentro de la guía'
      },
      legendsInstructions: {
        title: 'Video firma',
        subtitle: 'Enfoca tu rostro dentro de la guía y firma dentro del recuadro',
        buttonNext: 'Continuar',
        instructions: 'Recuerda no hacer uso de lentes de sol, gorras u otros elementos que dificulten la identificación de tu rostro.'
      },
      legendsPreview: {
        title: 'Firma',
        buttonRetry: 'Volver a firmar',
        buttonNext: 'Confirmar firma'
      }
    },
    iOS: {
      videoConstraints: {
        video: {
          width: { min: 640, ideal: 640, max: 1920 },
          height: { min: 480, ideal: 480 , max: 1080},
          facingMode: 'user'
        },
        audio: true
      }
    },
    android: {
      videoConstraints: {
        video: {
          width: { min: 640, ideal: 640, max: 1920 },
          height: { min: 480, ideal: 480 , max: 1080},
          facingMode: 'user'
        },
        audio: true
      }
    },
  },
  pathDependencies: {
    // imageDirectory: 'ASSETS_URL/'
  }
};

// errors
const ERROR_CODE = {
  BROWSER_NOT_SUPPORTED: -1,
  NOT_ACCEPT_CAMERA_PERMISSION: -2,
  VIDEO_CREATION_FAIL: -3,
  MEDIA_RECORDER_ERROR: -4,
  FACE_UNDETECTED: -5,
  REQUIRED_SIGNATURE: -6,
  VIDEO_EMPTY: -7,
  INVALID_SIGNATURE: -8,
  FAIL_LOAD_WASM: -9,
  NOT_READABLE_CAMERA: -10,
  MEDIA_RECORDER_NOT_SUPPORTED: -11,
};

// models
class ResponseEvent {
  event;
  data;
  constructor(event, data) {
    this.event = event;
    this.data = data;
  }
}

class Result {
  videoFace; // video as Blob
  videoSignature; // video as Blob
  imageSignature;
  signatureData; // 
  selfie; //image as base64 string
  constructor(data) {
    this.videoFace = data.videoFace;
    this.videoSignature = data.videoSignature;
    this.imageSignature = data.imageSignature;
    this.signatureData = data.signatureData;
    this.selfie = data.selfie;
  }
}

// subscribe to message event to recive the events from the iframe
window.addEventListener("message", (message) => {
  // IMPORTANT: check the origin of the data
  if (message.origin.includes("firmaautografa.com")) {
    if (message.data.event === EVENT_MODULE.MODULE_READY) { 
      // MODULE_READY
      // the modules is reaady for receive configuration
      initModule();
    } else if (message.data.event === EVENT_MODULE.PROCESS_INIT) { 
      // PROCESS_INIT
      // only informative
      console.log("Process init");
    } else if (message.data.event === EVENT_MODULE.CAMERA_ACCEPTED) { 
      // CAMERA_ACCEPTED
      // only informative
      console.log("Camera accepted");
    } else if (message.data.event === EVENT_MODULE.MODULE_CLOSED) { 
      // MODULE_CLOSED
      // module closed, the user clicked (X)
      console.log("module closed");
    } else if (message.data.event === EVENT_MODULE.PROCESS_ERROR) { 
      // PRROCESS_ERROR
      // show the error and try again
      console.error(message.data.data);
    } else if (message.data.event === EVENT_MODULE.PROCESS_COMPLETED) { 
      // PROCESS_COMPLETED
      // use the result as yuo fit
      alert("Process completed");
      const result = new Result(message.data.data);
      const faceVideoUrl = URL.createObjectURL(result.videoFace);
      const signatureVideoUrl = URL.createObjectURL(result.videoSignature);

      const containerResult = document.getElementById("container-result");
      const containerIframe = document.getElementById("container-iframe-signature");
      const faceVideo = document.getElementById("face-video");
      const signatureVideo = document.getElementById("signature-video");
      const signatureImage = document.getElementById("signature-img");
      const downloadFaceVideo = document.getElementById("donwload-face-video");
      const downloadSignatureVideo = document.getElementById("donwload-signature-video");

      containerIframe.style.display = "none";
      containerResult.style.display = "flex";
      faceVideo.src = faceVideoUrl;
      signatureVideo.src = signatureVideoUrl;
      downloadFaceVideo.href = faceVideoUrl;
      downloadSignatureVideo.href = signatureVideoUrl;
      signatureImage.src =  result.imageSignature;
    }
  }
});

function initIframe() {
  // get iframe
  const iframe = document.getElementById("fad-iframe-signature");
  // url - https://devapiframe.firmaautografa.com/fad-iframe-signature
  const tkn = "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX";
  const url = `https://devapiframe.firmaautografa.com/fad-iframe-signature?tkn=${tkn}`;
  // set src to iframe
  iframe.src = url;
}

function initModule() {
  const iframe = document.getElementById("fad-iframe-signature");
  iframe.contentWindow.postMessage(
    new ResponseEvent(EVENT_MODULE.INIT_MODULE, {
      configuration: CONFIGURATION,
    }),
    iframe.src
  );
}