let selectedFiles = [];
let currentMode = 'files'; // 'files' or 'folder'

// Initialize event listeners when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    setupTabs();
    setupQualitySlider();
    setupFileInputs();
    setupDragAndDrop();
    setupConvertButton();
    setupClipboardPaste();
});

function setupTabs() {
    const filesTab = document.getElementById('filesTab');
    const folderTab = document.getElementById('folderTab');
    const filesSection = document.getElementById('filesSection');
    const folderSection = document.getElementById('folderSection');

    filesTab.addEventListener('click', () => {
        currentMode = 'files';
        filesTab.classList.add('active', 'text-blue-500');
        folderTab.classList.remove('active', 'text-blue-500');
        filesTab.classList.remove('text-gray-600');
        folderTab.classList.add('text-gray-600');
        filesSection.classList.remove('hidden');
        folderSection.classList.add('hidden');
    });

    folderTab.addEventListener('click', () => {
        currentMode = 'folder';
        folderTab.classList.add('active', 'text-blue-500');
        filesTab.classList.remove('active', 'text-blue-500');
        folderTab.classList.remove('text-gray-600');
        filesTab.classList.add('text-gray-600');
        folderSection.classList.remove('hidden');
        filesSection.classList.add('hidden');
    });
}

function setupQualitySlider() {
    const qualitySlider = document.getElementById('quality');
    const qualityValue = document.getElementById('qualityValue');
    
    function updateSlider(value) {
        qualityValue.textContent = `${value}%`;
        const percent = (value - qualitySlider.min) / (qualitySlider.max - qualitySlider.min) * 100;
        qualitySlider.style.backgroundImage = `linear-gradient(90deg, #3b82f6 ${percent}%, #e2e8f0 ${percent}%)`;
    }
    
    qualitySlider.addEventListener('input', (e) => updateSlider(e.target.value));
    updateSlider(qualitySlider.value); // Initialize slider
}

function setupFileInputs() {
    const imageInput = document.getElementById('imageInput');
    const selectImagesBtn = document.getElementById('selectImagesBtn');
    const folderInput = document.getElementById('folderInput');
    const selectFolderBtn = document.getElementById('selectFolderBtn');
    
    selectImagesBtn.addEventListener('click', () => imageInput.click());
    selectFolderBtn.addEventListener('click', () => folderInput.click());

    imageInput.addEventListener('change', handleFileSelect);
    folderInput.addEventListener('change', handleFolderSelect);
}

function setupDragAndDrop() {
    const filesDropZone = document.querySelector('#filesSection .drop-zone');
    const folderDropZone = document.querySelector('#folderSection .drop-zone');
    
    // Setup files drop zone
    setupDropZone(filesDropZone, async (items) => {
        const files = [];
        for (let item of items) {
            if (item.kind === 'file') {
                const file = item.getAsFile();
                if (file && file.type.startsWith('image/')) {
                    // Check if file already exists
                    const isDuplicate = selectedFiles.some(existingFile => 
                        existingFile.name === file.name && 
                        existingFile.size === file.size
                    );
                    if (!isDuplicate) {
                        files.push(file);
                    }
                }
            }
        }
        if (files.length > 0) {
            appendFiles(files);
        }
    });

    // Setup folder drop zone
    setupDropZone(folderDropZone, async (items) => {
        const files = [];
        for (let item of items) {
            if (item.kind === 'file') {
                const entry = item.webkitGetAsEntry();
                if (entry && entry.isDirectory) {
                    const folderFiles = await readEntryContents(entry);
                    // Filter out duplicates
                    const newFiles = folderFiles.filter(newFile => 
                        !selectedFiles.some(existingFile => 
                            existingFile.name === newFile.name && 
                            existingFile.size === newFile.size
                        )
                    );
                    files.push(...newFiles);
                }
            }
        }
        if (files.length > 0) {
            appendFolderFiles(files);
        }
    });
}

function setupDropZone(zone, onDrop) {
    if (!zone) return;

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        zone.addEventListener(eventName, preventDefaults, false);
    });

    ['dragenter', 'dragover'].forEach(eventName => {
        zone.addEventListener(eventName, () => {
            zone.classList.add('drag-over');
        });
    });

    ['dragleave', 'drop'].forEach(eventName => {
        zone.addEventListener(eventName, () => {
            zone.classList.remove('drag-over');
        });
    });

    zone.addEventListener('drop', async (e) => {
        const items = Array.from(e.dataTransfer.items);
        await onDrop(items);
    });
}

async function readEntryContents(entry) {
    return new Promise((resolve) => {
        const files = [];
        
        if (entry.isFile) {
            entry.file(file => {
                if (file.type.startsWith('image/')) {
                    files.push(file);
                }
                resolve(files);
            });
        } else if (entry.isDirectory) {
            const dirReader = entry.createReader();
            readAllEntries(dirReader, []).then(entries => {
                Promise.all(entries.map(entry => readEntryContents(entry)))
                    .then(fileArrays => {
                        resolve(fileArrays.flat());
                    });
            });
        } else {
            resolve(files);
        }
    });
}

async function readAllEntries(dirReader, existingResults) {
    return new Promise((resolve) => {
        dirReader.readEntries(entries => {
            if (entries.length === 0) {
                resolve(existingResults);
            } else {
                readAllEntries(dirReader, existingResults.concat(Array.from(entries)))
                    .then(resolve);
            }
        });
    });
}

function setupConvertButton() {
    const convertBtn = document.getElementById('convertBtn');
    convertBtn.addEventListener('click', convertImages);
}

function setupClipboardPaste() {
    document.addEventListener('paste', async (e) => {
        e.preventDefault();
        
        const items = (e.clipboardData || e.originalEvent.clipboardData).items;
        const imagePromises = [];
        
        // First, collect all promises for image processing
        for (const item of items) {
            if (item.type.indexOf('image') === 0) {
                const file = item.getAsFile();
                if (file) {
                    imagePromises.push(
                        new Promise((resolve) => {
                            // Create a unique name for the file
                            const timestamp = new Date().getTime() + Math.random().toString(36).substring(7);
                            const newFile = new File([file], `pasted-image-${timestamp}.${file.type.split('/')[1] || 'png'}`, {
                                type: file.type
                            });
                            resolve(newFile);
                        })
                    );
                }
            }
        }

        // Wait for all images to be processed
        try {
            const imageFiles = await Promise.all(imagePromises);
            
            // Filter out duplicates
            const uniqueFiles = imageFiles.filter(newFile => 
                !selectedFiles.some(existingFile => 
                    existingFile.name === newFile.name && 
                    existingFile.size === newFile.size
                )
            );

            if (uniqueFiles.length > 0) {
                appendFiles(uniqueFiles);
                showToast(`${uniqueFiles.length} image(s) pasted successfully`, 'success');
            }
        } catch (error) {
            console.error('Error processing pasted images:', error);
            showToast('Error processing some images', 'error');
        }
    });
}

// Handle folder selection
function handleFolderSelect(event) {
    const newFiles = Array.from(event.target.files).filter(file => 
        file.type.startsWith('image/')
    );
    
    appendFolderFiles(newFiles);
}

// Append new folder files to existing selection
function appendFolderFiles(newFiles) {
    const uniqueFiles = newFiles.filter(newFile => 
        !selectedFiles.some(existingFile => 
            existingFile.name === newFile.name && 
            existingFile.size === newFile.size
        )
    );

    if (uniqueFiles.length === 0) {
        showToast('No new images found in the folder', 'info');
        return;
    }

    selectedFiles = [...selectedFiles, ...uniqueFiles];
    updateFolderFileList();

    // Show folder path
    const folderPath = document.getElementById('folderPath');
    if (uniqueFiles.length > 0) {
        const path = uniqueFiles[0].webkitRelativePath.split('/')[0];
        folderPath.textContent = `Selected folder: ${path} (${selectedFiles.length} images total)`;
        showToast(`Added ${uniqueFiles.length} new image${uniqueFiles.length === 1 ? '' : 's'}`, 'success');
    }
}

// Handle file selection
function handleFileSelect(event) {
    const newFiles = Array.from(event.target.files);
    appendFiles(newFiles);
}

// Append new files to existing selection
function appendFiles(newFiles) {
    const validFiles = newFiles.filter(file => file.type.startsWith('image/'));
    const uniqueFiles = validFiles.filter(newFile => 
        !selectedFiles.some(existingFile => 
            existingFile.name === newFile.name && 
            existingFile.size === newFile.size
        )
    );

    if (uniqueFiles.length === 0) {
        showToast('These images have already been added', 'info');
        return;
    }

    selectedFiles = [...selectedFiles, ...uniqueFiles];
    updateFileList();
    showToast(`Added ${uniqueFiles.length} new image${uniqueFiles.length === 1 ? '' : 's'}`, 'success');
}

// Update the file list in the UI
function updateFileList() {
    const fileList = document.getElementById('fileList');
    fileList.innerHTML = '';

    selectedFiles.forEach((file, index) => {
        const fileItem = createFileItem(file, index);
        fileList.appendChild(fileItem);
    });
}

// Update the folder file list in the UI
function updateFolderFileList() {
    const folderFileList = document.getElementById('folderFileList');
    folderFileList.innerHTML = '';

    selectedFiles.forEach((file, index) => {
        const fileItem = createFileItem(file, index);
        folderFileList.appendChild(fileItem);
    });
}

// Create a file item element
function createFileItem(file, index) {
    const fileDiv = document.createElement('div');
    fileDiv.className = 'flex items-center justify-between p-2 bg-white rounded-lg shadow-sm mb-2 hover:bg-gray-50 group';
    
    // Left side with preview and filename
    const leftDiv = document.createElement('div');
    leftDiv.className = 'flex items-center flex-1 min-w-0 mr-2';
    
    // Image preview container
    const previewContainer = document.createElement('div');
    previewContainer.className = 'w-10 h-10 flex-shrink-0 mr-3';
    
    const preview = document.createElement('img');
    preview.className = 'w-full h-full object-cover rounded';
    preview.src = 'placeholder.png'; // Default placeholder
    
    // Load actual preview
    const reader = new FileReader();
    reader.onload = (e) => {
        preview.src = e.target.result;
    };
    reader.readAsDataURL(file);
    
    previewContainer.appendChild(preview);
    
    // Filename container with truncation
    const filenameContainer = document.createElement('div');
    filenameContainer.className = 'flex-1 min-w-0';
    
    const filename = document.createElement('p');
    filename.className = 'text-sm text-gray-900 truncate';
    filename.title = file.name; // Show full name on hover
    filename.textContent = file.name;
    
    const fileSize = document.createElement('p');
    fileSize.className = 'text-xs text-gray-500';
    fileSize.textContent = formatFileSize(file.size);
    
    filenameContainer.appendChild(filename);
    filenameContainer.appendChild(fileSize);
    
    // Right side with remove button
    const removeButton = document.createElement('button');
    removeButton.className = 'flex-shrink-0 ml-2 p-1 text-gray-400 hover:text-red-500 focus:outline-none transition-colors duration-200';
    removeButton.innerHTML = '<i class="fas fa-times"></i>';
    removeButton.title = 'Remove file';
    removeButton.onclick = () => {
        selectedFiles = selectedFiles.filter((_, i) => i !== index);
        updateFileList();
        updateFolderFileList();
        showToast('File removed', 'info');
    };
    
    // Assemble the components
    leftDiv.appendChild(previewContainer);
    leftDiv.appendChild(filenameContainer);
    fileDiv.appendChild(leftDiv);
    fileDiv.appendChild(removeButton);
    
    return fileDiv;
}

// Format file size to human-readable format
function formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

// Remove a file from the selection
function removeFile(index) {
    selectedFiles.splice(index, 1);
    if (currentMode === 'files') {
        updateFileList();
    } else {
        updateFolderFileList();
    }
}

// Main conversion function
async function convertImages() {
    const convertBtn = document.getElementById('convertBtn');
    
    if (selectedFiles.length === 0) {
        showToast('Please select at least one image', 'error');
        return;
    }

    const maxSize = parseInt(document.getElementById('maxSize').value);
    const quality = parseInt(document.getElementById('quality').value);
    
    console.log('Starting conversion with settings:', {
        numberOfFiles: selectedFiles.length,
        maxSize,
        quality
    });
    
    // Disable convert button and show loading state
    convertBtn.disabled = true;
    convertBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Converting...';
    
    // Show progress section
    const progressSection = document.getElementById('progressSection');
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');
    progressSection.classList.remove('hidden');
    
    const convertedFiles = [];
    let totalSize = 0;
    let convertedSize = 0;
    
    // Process each image
    for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const progress = ((i + 1) / selectedFiles.length) * 100;
        progressBar.style.width = `${progress}%`;
        progressText.textContent = `Converting ${i + 1} of ${selectedFiles.length}: ${file.name}`;

        console.log(`Processing file ${i + 1}/${selectedFiles.length}:`, file.name);

        try {
            const webpBlob = await processImage(file, maxSize, quality);
            const fileName = file.name.replace(/\.[^/.]+$/, '') + '.webp';
            convertedFiles.push({ blob: webpBlob, name: fileName });
            
            totalSize += file.size;
            convertedSize += webpBlob.size;
        } catch (error) {
            console.error('Error processing image:', error);
            showToast(`Error processing ${file.name}: ${error.message}`, 'error');
        }
    }

    // Handle file downloads
    if (convertedFiles.length > 0) {
        const compressionRatio = ((totalSize - convertedSize) / totalSize * 100).toFixed(1);
        progressText.textContent = `Compression complete! Saved ${compressionRatio}% of space`;
        
        if (convertedFiles.length > 3) {
            // Create ZIP file for multiple images
            try {
                progressText.textContent = 'Creating ZIP file...';
                const zip = new JSZip();
                
                // Add all converted files to the ZIP
                convertedFiles.forEach(file => {
                    zip.file(file.name, file.blob);
                });
                
                // Generate the ZIP file
                const zipBlob = await zip.generateAsync({
                    type: 'blob',
                    compression: 'DEFLATE',
                    compressionOptions: { level: 9 }
                });
                
                // Download the ZIP file
                const zipName = `webp_images_${new Date().getTime()}.zip`;
                downloadFile(zipBlob, zipName);
                
                showToast('ZIP file downloaded successfully!', 'success');
                progressText.textContent = `Conversion complete! ${convertedFiles.length} images compressed and zipped`;
            } catch (error) {
                console.error('Error creating ZIP:', error);
                showToast('Error creating ZIP file. Downloading files individually...', 'warning');
                // Fallback to individual downloads
                convertedFiles.forEach(file => downloadFile(file.blob, file.name));
            }
        } else {
            // Download files individually if 3 or fewer
            convertedFiles.forEach(file => downloadFile(file.blob, file.name));
            showToast('Images converted and downloaded successfully!', 'success');
        }
    }

    // Reset UI
    setTimeout(() => {
        progressSection.classList.add('hidden');
        progressBar.style.width = '0%';
        convertBtn.disabled = false;
        convertBtn.innerHTML = '<i class="fas fa-magic mr-2"></i>Convert to WebP';
    }, 3000);
}

// Helper function to download a file
function downloadFile(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Show toast notification
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `fixed bottom-4 right-4 px-4 py-2 rounded-lg text-white text-sm font-medium shadow-lg transition-all duration-300 transform translate-y-0 opacity-100 z-50 ${
        type === 'error' ? 'bg-red-500' :
        type === 'success' ? 'bg-green-500' :
        type === 'warning' ? 'bg-yellow-500' :
        'bg-blue-500'
    }`;
    
    const icon = document.createElement('i');
    icon.className = `fas fa-${
        type === 'error' ? 'exclamation-circle' :
        type === 'success' ? 'check-circle' :
        type === 'warning' ? 'exclamation-triangle' :
        'info-circle'
    } mr-2`;
    
    toast.appendChild(icon);
    toast.appendChild(document.createTextNode(message));
    document.body.appendChild(toast);
    
    // Animate in
    requestAnimationFrame(() => {
        toast.style.transform = 'translateY(0)';
        toast.style.opacity = '1';
    });
    
    // Remove after 3 seconds
    setTimeout(() => {
        toast.style.transform = 'translateY(20px)';
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Process a single image
async function processImage(file, maxSize, quality) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const reader = new FileReader();

        reader.onload = function(e) {
            img.src = e.target.result;
        };

        img.onload = function() {
            try {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                console.log('Original dimensions:', width, 'x', height);
                console.log('Target max size:', maxSize);

                // Resize if necessary
                if (width > maxSize || height > maxSize) {
                    if (width > height) {
                        height *= maxSize / width;
                        width = maxSize;
                    } else {
                        width *= maxSize / height;
                        height = maxSize;
                    }
                }

                console.log('New dimensions:', width, 'x', height);

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                
                // Use better image rendering
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';
                
                ctx.drawImage(img, 0, 0, width, height);

                console.log('Converting to WebP with quality:', quality);

                // Convert to WebP with proper MIME type
                canvas.toBlob(
                    (blob) => {
                        if (blob) {
                            console.log('WebP conversion successful, blob size:', blob.size);
                            resolve(blob);
                        } else {
                            console.error('WebP conversion failed - no blob created');
                            reject(new Error('WebP conversion failed - no blob created'));
                        }
                    },
                    'image/webp',
                    quality / 100
                );
            } catch (error) {
                console.error('Error in image processing:', error);
                reject(error);
            }
        };

        img.onerror = (error) => {
            console.error('Failed to load image:', error);
            reject(new Error('Failed to load image'));
        };

        reader.onerror = (error) => {
            console.error('Failed to read file:', error);
            reject(new Error('Failed to read file'));
        };

        reader.readAsDataURL(file);
    });
}

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}
