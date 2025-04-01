// Initial loader handling
// Create toast element
const toastContainer = document.createElement('div');
toastContainer.style.cssText = 'position: fixed; top: 150px; left: 20px; background: #4CAF50; color: white; padding: 16px; border-radius: 4px; z-index: 1000; opacity: 0; transition: opacity 0.3s ease-in-out;';
document.body.appendChild(toastContainer);

// Show toast message function
function showToast(message, duration = 2000) {
    toastContainer.textContent = message;
    toastContainer.style.opacity = '1';
    setTimeout(() => {
        toastContainer.style.opacity = '0';
    }, duration);
}

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const loaderElement = document.querySelector('.app-loader');
        const response = await fetch(`${API_ENDPOINT}?blockNo=test`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (Array.isArray(data)) {
            showToast('Welcome to Rashi Granite Block Search');
            loaderElement.classList.add('hidden');
        } else {
            throw new Error('Invalid data format received');
        }
    } catch (error) {
        console.error('Connection error:', error);
        alert('Unable to connect to the server. Please check your internet connection and try again.');
        // Wait a bit before reloading to prevent rapid reload loops
        setTimeout(() => location.reload(), 2000);
    }
});

// API endpoint configuration
const API_ENDPOINT = window.location.hostname === 'localhost' ? 'http://localhost:3000/api/data' : '/.netlify/functions/fetchData';

// Search Data function
async function searchData() {
    const blockNo = document.getElementById('blockNo').value;
    
    if (!blockNo) {
        alert('Block No is required');
        return;
    }

    const loaderOverlay = document.querySelector('.loader-overlay');
    loaderOverlay.classList.add('active');
    
    const partNo = document.getElementById('partNo').value;
    const thickness = document.getElementById('thickness').value;

    try {
        const response = await fetch(`${API_ENDPOINT}?blockNo=${blockNo}&partNo=${partNo}&thickness=${thickness}`);
        const data = await response.json();
        console.log('API Response:', data);
        displayData(data);
    } catch (error) {
        console.error('Error fetching data:', error);
    } finally {
        loaderOverlay.classList.remove('active');
    }
}

// Display Data function
function displayData(data) {
    const tableHead = document.querySelector('#dataTable thead');
    const tableBody = document.querySelector('#dataTable tbody');
    const colorDisplay = document.getElementById('colorDisplay');
    tableHead.innerHTML = '';
    tableBody.innerHTML = '';

    if (data.length > 0) {
        const colour1 = data[0][21]; // Column V (index 21)
        const colour2 = data[0][22]; // Column W (index 22)
        colorDisplay.innerHTML = `Fac Colour: ${colour1} <br> Sub Colour: ${colour2}`;
        colorDisplay.style.color = colour1;
        colorDisplay.style.backgroundColor = colour2;

        // Define headers and check which columns have data
        const headers = ['Block No', 'Part', 'Thk cm', 'Nos', 'Grind', 'Net', 'Epoxy', 'Polish', 
                        'Leather', 'Lapotra', 'Honed', 'Shot', 'Pol R', 'Bal', 'B SP', 'Edge', 
                        'Meas', 'L cm', 'H cm', 'Status', 'Date'];
        const nonEmptyColumns = [];

        // Check each column for non-empty values
        for(let i = 0; i <= 20; i++) {
            const hasData = data.some(row => row[i] && row[i].toString().trim() !== '');
            if (hasData) {
                nonEmptyColumns.push(i);
            }
        }

        // Create table headers only for non-empty columns
        const headerRow = document.createElement('tr');
        nonEmptyColumns.forEach(colIndex => {
            const th = document.createElement('th');
            th.textContent = headers[colIndex];
            headerRow.appendChild(th);
        });
        tableHead.appendChild(headerRow);

        // Create table body with only non-empty columns
        data.forEach(row => {
            const tr = document.createElement('tr');
            nonEmptyColumns.forEach(colIndex => {
                const td = document.createElement('td');
                td.textContent = row[colIndex] || '';
                tr.appendChild(td);
            });
            tableBody.appendChild(tr);
        });
    } else {
        colorDisplay.innerHTML = 'No data found';
        colorDisplay.style.color = 'black';
        colorDisplay.style.backgroundColor = 'transparent';
    }
}

// Clear Data function
function clearData() {
    document.getElementById('blockNo').value = '';
    document.getElementById('partNo').value = '';
    document.getElementById('thickness').value = '';
    document.getElementById('colorDisplay').innerHTML = '';
    document.querySelector('#dataTable tbody').innerHTML = '';
}

// Existing sign-up and OTP functions
async function sendOTP() {
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const mobile = document.getElementById('mobile').value;

    const response = await fetch(AUTH_ENDPOINT, {
        method: 'POST',
        body: JSON.stringify({ action: 'generate', email, mobile }),
    });

    const result = await response.json();
    if (response.ok) {
        document.getElementById('signupForm').style.display = 'none';
        document.getElementById('otpForm').style.display = 'block';
        document.getElementById('message').textContent = 'OTP sent to your email and mobile.';
    } else {
        document.getElementById('message').textContent = result.error || 'Failed to send OTP.';
    }
}

async function verifyOTP() {
    const email = document.getElementById('email').value;
    const otp = document.getElementById('otp').value;

    const response = await fetch(AUTH_ENDPOINT, {
        method: 'POST',
        body: JSON.stringify({ action: 'verify', email, otp }),
    });

    const result = await response.json();
    if (response.ok) {
        document.getElementById('message').textContent = 'OTP verified! Sign-up successful.';
    } else {
        document.getElementById('message').textContent = result.error || 'Invalid OTP.';
    }
}

// New sign-up and OTP functions
async function sendOTP() {
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const mobile = document.getElementById('mobile').value;

    const response = await fetch('/.netlify/functions/auth', {
        method: 'POST',
        body: JSON.stringify({ action: 'generate', email, mobile }),
    });

    const result = await response.json();
    if (response.ok) {
        document.getElementById('signupForm').style.display = 'none';
        document.getElementById('otpForm').style.display = 'block';
        document.getElementById('message').textContent = 'OTP sent to your email and mobile.';
    } else {
        document.getElementById('message').textContent = result.error || 'Failed to send OTP.';
    }
}

async function verifyOTP() {
    const email = document.getElementById('email').value;
    const otp = document.getElementById('otp').value;

    const response = await fetch('/.netlify/functions/auth', {
        method: 'POST',
        body: JSON.stringify({ action: 'verify', email, otp }),
    });

    const result = await response.json();
    if (response.ok) {
        document.getElementById('message').textContent = 'OTP verified! Sign-up successful.';
    } else {
        document.getElementById('message').textContent = result.error || 'Invalid OTP.';
    }
}

// Voice Input functionality
function startVoiceInput(inputId) {
    if (!('webkitSpeechRecognition' in window)) {
        alert('Voice input is not supported in your browser. Please use Chrome.');
        return;
    }

    const recognition = new webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    const micButton = document.querySelector(`#${inputId}`).nextElementSibling;
    micButton.style.color = '#ff4444';

    recognition.onstart = () => {
        micButton.style.color = '#ff4444';
    };

    recognition.onend = () => {
        micButton.style.color = 'currentColor';
    };

    recognition.onresult = (event) => {
        let transcript = event.results[0][0].transcript.trim().toLowerCase();
        
        // Process single letters and numbers
        const singleLetterMap = {
            'hey': 'a', 'bee': 'b', 'see': 'c', 'dee': 'd', 'ee': 'e',
            'ef': 'f', 'gee': 'g', 'aitch': 'h', 'eye': 'i', 'jay': 'j',
            'kay': 'k', 'el': 'l', 'em': 'm', 'en': 'n', 'oh': 'o',
            'pee': 'p', 'queue': 'q', 'are': 'r', 'es': 's', 'tee': 't',
            'you': 'u', 'vee': 'v', 'double you': 'w', 'ex': 'x',
            'why': 'y', 'zed': 'z', 'zero': '0', 'one': '1', 'two': '2',
            'three': '3', 'four': '4', 'five': '5', 'six': '6',
            'seven': '7', 'eight': '8', 'nine': '9'
        };

        // Check for single letter/number pronunciations
        if (singleLetterMap[transcript]) {
            transcript = singleLetterMap[transcript];
        } else if (transcript.length === 1) {
            // Keep single character inputs as-is
            transcript = transcript;
        } else {
            // Remove spaces and convert number words
            transcript = transcript.replace(/\s+/g, '');
        }

        document.getElementById(inputId).value = transcript;
        // Trigger search after voice input is complete
        searchData();
    };

    recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        micButton.style.color = 'currentColor';
    };

    recognition.start();
}

document.addEventListener('DOMContentLoaded', () => {
    // Add input event listeners to search fields
    const searchFields = ['blockNo', 'partNo', 'thickness'];
    searchFields.forEach(fieldId => {
        document.getElementById(fieldId).addEventListener('input', debounce(() => {
            if (document.getElementById('blockNo').value) {
                searchData();
            }
        }, 300));
    });
});

// Debounce function to prevent too many API calls
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}