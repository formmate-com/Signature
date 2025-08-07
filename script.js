document.addEventListener('DOMContentLoaded', () => {
    // Get all necessary DOM elements
    const uploadInput = document.getElementById('signature-upload');
    const widthInput = document.getElementById('width-input');
    const heightInput = document.getElementById('height-input');
    const aspectLock = document.getElementById('aspect-lock');
    const resizeBtn = document.getElementById('resize-btn');
    const resultSection = document.getElementById('result-section');
    const canvas = document.getElementById('result-canvas');
    const downloadBtn = document.getElementById('download-btn');
    const ctx = canvas.getContext('2d');

    let originalImage = null;
    let originalWidth = 0;
    let originalHeight = 0;

    // Event listener for file upload
    uploadInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            originalImage = new Image();
            originalImage.onload = () => {
                // Store original dimensions and set them as default values
                originalWidth = originalImage.width;
                originalHeight = originalImage.height;
                widthInput.value = originalWidth;
                heightInput.value = originalHeight;
            };
            originalImage.src = event.target.result;
        };
        reader.readAsDataURL(file);
    });
    
    // Function to maintain aspect ratio
    const handleAspectRatio = (changedInput) => {
        if (!aspectLock.checked || originalWidth === 0) return;

        const newWidth = parseInt(widthInput.value);
        const newHeight = parseInt(heightInput.value);
        const ratio = originalWidth / originalHeight;

        if (changedInput === 'width' && newWidth > 0) {
            heightInput.value = Math.round(newWidth / ratio);
        } else if (changedInput === 'height' && newHeight > 0) {
            widthInput.value = Math.round(newHeight * ratio);
        }
    };

    widthInput.addEventListener('input', () => handleAspectRatio('width'));
    heightInput.addEventListener('input', () => handleAspectRatio('height'));

    // Event listener for the resize button
    resizeBtn.addEventListener('click', () => {
        if (!originalImage) {
            alert('Please upload a signature image first.');
            return;
        }

        const newWidth = parseInt(widthInput.value);
        const newHeight = parseInt(heightInput.value);

        if (isNaN(newWidth) || isNaN(newHeight) || newWidth <= 0 || newHeight <= 0) {
            alert('Please enter valid width and height.');
            return;
        }

        // Set canvas dimensions
        canvas.width = newWidth;
        canvas.height = newHeight;

        // Draw the image onto the canvas with the new dimensions
        ctx.drawImage(originalImage, 0, 0, newWidth, newHeight);

        // Prepare the download link
        downloadBtn.href = canvas.toDataURL('image/png');

        // Show the result section
        resultSection.classList.remove('hidden');
        downloadBtn.classList.remove('hidden');
    });
});
