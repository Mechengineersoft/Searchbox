// Initial loader handling
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        document.querySelector('.app-loader').classList.add('hidden');
    }, 1500);
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
    const tableBody = document.querySelector('#dataTable tbody');
    const colorDisplay = document.getElementById('colorDisplay');
    tableBody.innerHTML = '';

    if (data.length > 0) {
        const [blockNo, partNo, thickness, nos, colour1, colour2] = data[0];
        colorDisplay.innerHTML = `Fac Colour: ${colour1} <br> Sub Colour: ${colour2}`;
        colorDisplay.style.color = colour1;
        colorDisplay.style.backgroundColor = colour2;

        data.forEach(row => {
            const tr = document.createElement('tr');
            for(let i = 0; i < 4; i++) {
                const td = document.createElement('td');
                td.textContent = row[i];
                tr.appendChild(td);
            };
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
        const transcript = event.results[0][0].transcript;
        document.getElementById(inputId).value = transcript;
    };

    recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        micButton.style.color = 'currentColor';
    };

    recognition.start();
}