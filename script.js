document.addEventListener('DOMContentLoaded', () => {
    // Get all necessary DOM elements
    const uploadInput = document.getElementById('signature-upload');
    const widthInput = document.getElementById('width-input');
    const heightInput = document.getElementById('height-input');
    const unitSelector = document.getElementById('unit-selector');
    const aspectLock = document.getElementById('aspect-lock');
    const resizeBtn = document.getElementById('resize-btn');
    const resultSection = document.getElementById('result-section');
    const canvas = document.getElementById('result-canvas');
    const pixelDimensions = document.getElementById('pixel-dimensions');
    const downloadBtn = document.getElementById('download-btn');
    const ctx = canvas.getContext('2d');

    let originalImage = null;
    let originalWidthPx = 0;
    let originalHeightPx = 0;

    // --- Conversion Constants ---
    const DPI = 96; 
    const CM_PER_INCH = 2.54;

    // --- Unit Conversion Function ---
    const convertToPixels = (value, unit) => {
        if (unit === 'px') return value;
        if (unit === 'in') return value * DPI;
        if (unit === 'cm') return (value / CM_PER_INCH) * DPI;
        return 0;
    };

    // --- Event listener for file upload ---
    uploadInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            originalImage = new Image();
            originalImage.onload = () => {
                originalWidthPx = originalImage.width;
                originalHeightPx = originalImage.height;
                // Set default values in pixels
                widthInput.value = originalWidthPx;
                heightInput.value = originalHeightPx;
                unitSelector.value = 'px';
            };
            originalImage.src = event.target.result;
        };
        reader.readAsDataURL(file);
    });
    
    // --- Aspect Ratio Handling ---
    const handleAspectRatio = (changedInput) => {
        if (!aspectLock.checked || originalWidthPx === 0) return;
        const newWidth = parseFloat(widthInput.value);
        const newHeight = parseFloat(heightInput.value);
        const ratio = originalWidthPx / originalHeightPx;

        if (changedInput === 'width' && newWidth > 0) {
            heightInput.value = (newWidth / ratio).toFixed(2);
        } else if (changedInput === 'height' && newHeight > 0) {
            widthInput.value = (newHeight * ratio).toFixed(2);
        }
    };

    widthInput.addEventListener('input', () => handleAspectRatio('width'));
    heightInput.addEventListener('input', () => handleAspectRatio('height'));

    // --- High-Quality Image Resizing Function ---
    const resizeImageWithQuality = (img, targetWidth, targetHeight) => {
        let currentWidth = img.width;
        let currentHeight = img.height;
        
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        tempCtx.imageSmoothingQuality = 'high';

        // Set the final canvas to the target size
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        ctx.imageSmoothingQuality = 'high';
        
        // Use a multi-step downscaling approach for better quality
        // This is most effective when reducing size significantly
        let tempImg = img;
        while (currentWidth > targetWidth * 2 && currentHeight > targetHeight * 2) {
            currentWidth *= 0.5;
            currentHeight *= 0.5;
            tempCanvas.width = currentWidth;
            tempCanvas.height = currentHeight;
            tempCtx.drawImage(tempImg, 0, 0, currentWidth, currentHeight);
            tempImg = tempCanvas; // Use the downscaled canvas as the new source
        }

        // Draw the final image from the last scaled-down version
        ctx.drawImage(tempImg, 0, 0, currentWidth, currentHeight, 0, 0, targetWidth, targetHeight);
    };

    // --- Resize Button Logic (Combines all features) ---
    resizeBtn.addEventListener('click', () => {
        if (!originalImage) {
            alert('Please upload a signature image first.');
            return;
        }

        const widthValue = parseFloat(widthInput.value);
        const heightValue = parseFloat(heightInput.value);
        const selectedUnit = unitSelector.value;

        if (isNaN(widthValue) || isNaN(heightValue) || widthValue <= 0 || heightValue <= 0) {
            alert('Please enter valid width and height.');
            return;
        }

        const finalWidthPx = Math.round(convertToPixels(widthValue, selectedUnit));
        const finalHeightPx = Math.round(convertToPixels(heightValue, selectedUnit));
        
        if (finalWidthPx <= 0 || finalHeightPx <= 0) {
             alert('The calculated pixel dimensions are too small. Please enter larger values.');
             return;
        }

        // Call the high-quality resize function
        resizeImageWithQuality(originalImage, finalWidthPx, finalHeightPx);

        // Prepare the download link using PNG format for best quality
        downloadBtn.href = canvas.toDataURL('image/png', 1.0);

        // Show the final dimensions in pixels
        pixelDimensions.textContent = `Final size: ${finalWidthPx}px (width) x ${finalHeightPx}px (height)`;

        // Show the result section
        resultSection.classList.remove('hidden');
        downloadBtn.classList.remove('hidden');
    });
});
