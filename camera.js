/**
 * MAZOEZI In-App Camera Capture
 * getUserMedia, confirm/retake, compress for local storage
 */

export async function openCameraCapture(onCapture) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  const modal = document.createElement('div');
  modal.className = 'modal-overlay show';
  modal.innerHTML = `
    <div class="modal camera-modal">
      <h2>Take Photo</h2>
      <div class="camera-view"><video playsinline autoplay></video></div>
      <div class="camera-buttons">
        <button type="button" class="modal-btn secondary" id="cameraCancel">Cancel</button>
        <button type="button" class="modal-btn primary" id="cameraCapture"><i class="fas fa-camera"></i> Capture</button>
      </div>
    </div>
  `;

  const videoEl = modal.querySelector('video');
  let stream;
  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
  } catch (e) {
    if (onCapture) onCapture(null);
    return;
  }
  document.body.appendChild(modal);
  videoEl.srcObject = stream;

  const stop = () => {
    stream.getTracks().forEach(t => t.stop());
    modal.remove();
  };

  modal.querySelector('#cameraCancel').onclick = stop;

  modal.querySelector('#cameraCapture').onclick = () => {
    canvas.width = videoEl.videoWidth;
    canvas.height = videoEl.videoHeight;
    ctx.drawImage(videoEl, 0, 0);
    stop();
    canvas.toBlob(blob => {
      if (blob) onCapture(blob);
    }, 'image/jpeg', 0.85);
  };
}
