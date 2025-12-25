document.addEventListener('DOMContentLoaded', () => {
    const pulsarContainer = document.querySelector('.pulsar-container');
    const totalCountEl = document.getElementById('total-count');
    const ledgerTableBody = document.querySelector('#ledger-table tbody');

    let totalDetected = 0;
    let tableRowCount = 0;
    const minimizeBtn = document.getElementById('minimize-ledger');
    const ledgerContainer = document.querySelector('.ledger-container');

    if (minimizeBtn && ledgerContainer) {
        minimizeBtn.addEventListener('click', () => {
            ledgerContainer.classList.toggle('minimized');
            const icon = minimizeBtn.querySelector('i');
            if (ledgerContainer.classList.contains('minimized')) {
                icon.classList.remove('fa-minus');
                icon.classList.add('fa-plus');
            } else {
                icon.classList.remove('fa-plus');
                icon.classList.add('fa-minus');
            }
        });
    }

    if (!pulsarContainer) return;

    function generateCoordinate() {
        // Format: JHHMM+DDMM
        const h = Math.floor(Math.random() * 24).toString().padStart(2, '0');
        const m = Math.floor(Math.random() * 60).toString().padStart(2, '0');

        // Declination -90 to +90
        const decSign = Math.random() > 0.5 ? '+' : '-';
        const d = Math.floor(Math.random() * 90).toString().padStart(2, '0');
        const dm = Math.floor(Math.random() * 60).toString().padStart(2, '0');

        return `J${h}${m}${decSign}${d}${dm}`;
    }

    function generatePeriod() {
        // 0.5s to 1.7s
        return (Math.random() * 1.2 + 0.5).toFixed(4);
    }

    function addToLedger(type, name, typeClass) {
        totalDetected++;
        totalCountEl.textContent = totalDetected;

        // If table has 20 items, clear rows but keep count
        if (tableRowCount >= 20) {
            ledgerTableBody.innerHTML = '';
            tableRowCount = 0;
        }

        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="${typeClass}">${type}</td>
            <td>${name}</td>
        `;
        ledgerTableBody.appendChild(row);
        tableRowCount++;
    }

    function spawnTransient() {
        const transient = document.createElement('div');
        transient.classList.add('transient-object');

        // Random position (covers almost full screen)
        const top = Math.random() * 96 + 2;
        const left = Math.random() * 96 + 2;

        transient.style.top = `${top}%`;
        transient.style.left = `${left}%`;

        // Create Tooltip Card
        const tooltip = document.createElement('div');
        tooltip.classList.add('tooltip-card');

        // Smart Positioning: If too close to top (< 35%) (covers header), show below
        if (top < 35) {
            tooltip.classList.add('below');
        }

        // Select Type
        const typeRoll = Math.random();

        let coords = generateCoordinate();
        let typeLabel = '';
        let infoText = '';
        let typeClass = ''; // For ledger styling

        // Split into 5 distinct types (20% each)
        if (typeRoll < 0.20) {
            // PULSAR
            transient.classList.add('type-pulsar');
            typeLabel = 'Pulsar';
            typeClass = 'ledger-pulsar';

            const period = generatePeriod();
            const unit = period < 1 ? 'ms' : 's';
            const displayPeriod = period < 1 ? (period * 1000).toFixed(2) : period;

            // Sync animation speed
            transient.style.animationDuration = `${period}s`;

            infoText = `New Pulsar Detected!<br><br>Name: ${coords}<br>Period: ${displayPeriod} ${unit}`;

        } else if (typeRoll < 0.40) {
            // SUPERNOVA
            transient.classList.add('type-supernova');
            typeLabel = 'Supernova';
            typeClass = 'ledger-supernova';

            const year = 2025; // Fixed year
            const letters = String.fromCharCode(97 + Math.floor(Math.random() * 26)) +
                String.fromCharCode(97 + Math.floor(Math.random() * 26));

            const snName = `SN ${year}${letters}`;
            coords = snName;

            infoText = `New Supernova Detected!<br><br>Name: ${snName}`;
            transient.style.animationDuration = '10s';

        } else if (typeRoll < 0.60) {
            // SCINTILLATOR
            transient.classList.add('type-scintillator');
            typeLabel = 'Scintillator';
            typeClass = 'ledger-scintillator';

            infoText = `New Rapid Scintillator Detected!<br><br>Name: ${coords}`;
            transient.style.animationDuration = `${(Math.random() * 0.5 + 0.1).toFixed(2)}s`;

        } else if (typeRoll < 0.80) {
            // UNKNOWN
            transient.classList.add('type-unknown');
            typeLabel = 'Unknown';
            typeClass = 'ledger-unknown';

            infoText = `Unknown Transient Detected!<br><br>Signal Pattern: Chaotic`;
            // Animation defined in CSS

        } else {
            // COSMIC RAY
            transient.classList.add('type-cosmic-ray');
            typeLabel = 'Cosmic Ray';
            typeClass = 'ledger-cosmic-ray';

            coords = "-";

            // Rotate randomly but ALWAYS SLANTED (avoid horizontal 0/180)
            // Range: 20-70 (NE), 110-160 (SE), 200-250 (SW), 290-340 (NW)
            // Base angle 20-70
            let angle = Math.floor(Math.random() * 50 + 20);

            // Randomly flip quadrants
            if (Math.random() > 0.5) angle += 90; // now 20-160 range mostly
            if (Math.random() > 0.5) angle += 180;

            // Allow some randomness but keep away from 0/180/360
            // Actually simpler: just generate 0-360 then check if horizontal-ish
            // But let's stick to the generated ranges above which approximate 45deg diagonals

            transient.style.setProperty('--rotation', `${angle}deg`);

            infoText = `Cosmic Ray Detected!<br><br>High Energy Particle`;
            transient.style.animationDuration = '4s';
        }

        // Build Tooltip HTML
        tooltip.innerHTML = `
            <div>${infoText}</div>
            <button class="add-btn">Add +</button>
        `;

        // Button Click Handler
        const btn = tooltip.querySelector('.add-btn');
        btn.onclick = (e) => {
            e.stopPropagation(); // Prevent bubbling if needed
            addToLedger(typeLabel, coords, typeClass);

            // Hide tooltip but keep object
            tooltip.style.display = 'none';
        };


        transient.appendChild(tooltip);
        pulsarContainer.appendChild(transient);

        // Click handler for mobile/desktop interaction
        transient.addEventListener('click', (e) => {
            // Close other active transients
            document.querySelectorAll('.transient-object.active').forEach(el => {
                if (el !== transient) el.classList.remove('active');
            });
            transient.classList.toggle('active');
        });

        // Remove after 12 seconds
        setTimeout(() => {
            if (document.body.contains(transient)) {
                transient.remove();
            }
        }, 12000);
    }

    // Spawn a transient every 10 seconds
    setInterval(spawnTransient, 10000);

    // Initial spawn
    spawnTransient();
});
