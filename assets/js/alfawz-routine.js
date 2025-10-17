(function () {
    'use strict';

    const section = document.getElementById('alfawz-routine-section');
    if (!section) {
        return;
    }

    const cardsContainer = section.querySelector('[data-routine-cards]');
    if (!cardsContainer) {
        return;
    }

    const routineData = window.alfawzRoutineData || {};
    const timezoneName = typeof routineData.timezone === 'string' ? routineData.timezone : '';
    const gmtOffset = Number(routineData.gmtOffset);
    const hasOffset = !Number.isNaN(gmtOffset);

    let timezoneFormatter = null;

    if (timezoneName) {
        try {
            timezoneFormatter = new Intl.DateTimeFormat('en-US', {
                timeZone: timezoneName,
                hour12: false,
                weekday: 'long',
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
        } catch (error) {
            timezoneFormatter = null;
        }
    }

    const storageKey = 'alfawzRoutineStates';
    const storageAvailable = (function () {
        try {
            const testKey = '__alfawzRoutineTest__';
            window.localStorage.setItem(testKey, '1');
            window.localStorage.removeItem(testKey);
            return true;
        } catch (error) {
            return false;
        }
    })();

    const storageState = storageAvailable ? readStorage() : {};
    const confettiHost = document.getElementById('alfawz-dashboard-confetti') || createConfettiHost();
    const routineAnnouncement = document.getElementById('alfawz-routine-announcement') || createRoutineAnnouncement();

    const routineConfigs = {
        morning: {
            id: 'morning',
            icon: '🕌',
            title: 'Morning Routine',
            cardClasses: 'bg-white border border-emerald-100 rounded-xl p-5 shadow-sm animate-fade-in transition-shadow duration-300 hover:shadow-md',
            titleClass: 'text-lg font-bold text-emerald-700',
            listClass: 'space-y-3',
            hoverClasses: 'hover:bg-emerald-50 focus:ring-emerald-500',
            checkBorder: 'border-emerald-500',
            checkFill: 'bg-emerald-500',
            items: [
                { id: 'ayat-al-kursi', label: 'Ayat Al-Kursi' },
                { id: 'baqarah-last-verses', label: 'Last 2 Verses of Al-Baqarah' }
            ]
        },
        jumuah: {
            id: 'jumuah',
            icon: '📿',
            title: 'Jumu’ah Routine',
            cardClasses: 'bg-white border border-blue-100 rounded-xl p-5 shadow-sm animate-fade-in transition-shadow duration-300 hover:shadow-md',
            titleClass: 'text-lg font-bold text-blue-700',
            listClass: 'space-y-3',
            hoverClasses: 'hover:bg-blue-50 focus:ring-blue-500',
            checkBorder: 'border-blue-500',
            checkFill: 'bg-blue-500',
            items: [
                { id: 'kahf', label: 'Surah Al-Kahf (Partial or Full)' }
            ]
        },
        night: {
            id: 'night',
            icon: '🌙',
            title: 'Night Routine',
            cardClasses: 'bg-white border border-purple-100 rounded-xl p-5 shadow-sm animate-fade-in transition-shadow duration-300 hover:shadow-md',
            titleClass: 'text-lg font-bold text-purple-700',
            listClass: 'space-y-3',
            hoverClasses: 'hover:bg-purple-50 focus:ring-purple-500',
            checkBorder: 'border-purple-500',
            checkFill: 'bg-purple-500',
            items: [
                { id: 'mulk', label: 'Surah Al-Mulk' },
                { id: 'three-q', label: 'Surah Ikhlas, Falaq, Nas' }
            ]
        }
    };

    let lastSignature = '';
    let currentDateKey = '';
    const routineCelebrations = new Map();
    const routineItemCelebrations = new Map();

    renderRoutines(true);
    window.setInterval(renderRoutines, 60 * 1000);

    function renderRoutines(force) {
        const context = getZonedContext();
        if (!context) {
            hideSection();
            return;
        }

        if (currentDateKey !== context.dateKey) {
            currentDateKey = context.dateKey;
            if (!storageState[currentDateKey]) {
                storageState[currentDateKey] = {};
            }
            routineCelebrations.clear();
            routineItemCelebrations.clear();
            persistStorage();
        }

        const activeConfigs = getActiveRoutines(context);
        const signature = activeConfigs.map(function (config) {
            return config.id;
        }).join('|') + '|' + currentDateKey;

        if (!force && signature === lastSignature) {
            return;
        }

        lastSignature = signature;

        cardsContainer.innerHTML = '';

        if (!activeConfigs.length) {
            hideSection();
            return;
        }

        showSection();

        activeConfigs.forEach(function (config, index) {
            const card = buildRoutineCard(config, index);
            cardsContainer.appendChild(card);
        });
    }

    function hideSection() {
        section.classList.add('hidden');
        section.setAttribute('aria-hidden', 'true');
        cardsContainer.innerHTML = '';
    }

    function showSection() {
        section.classList.remove('hidden');
        section.setAttribute('aria-hidden', 'false');
    }

    function getZonedContext() {
        const now = new Date();

        if (timezoneFormatter) {
            const parts = timezoneFormatter.formatToParts(now);
            const values = {};

            for (let index = 0; index < parts.length; index++) {
                const part = parts[index];
                if (part.type !== 'literal') {
                    values[part.type] = part.value;
                }
            }

            if (!values.year || !values.month || !values.day || !values.hour || !values.minute) {
                return null;
            }

            return {
                hour: parseInt(values.hour, 10),
                minute: parseInt(values.minute, 10),
                weekday: values.weekday || '',
                dateKey: values.year + '-' + values.month + '-' + values.day
            };
        }

        let zonedDate = now;

        if (hasOffset) {
            const utcMillis = now.getTime() + (now.getTimezoneOffset() * 60000);
            zonedDate = new Date(utcMillis + gmtOffset * 60 * 60 * 1000);
        }

        return {
            hour: zonedDate.getHours(),
            minute: zonedDate.getMinutes(),
            weekday: zonedDate.toLocaleDateString('en-US', { weekday: 'long' }),
            dateKey: zonedDate.getFullYear() + '-' + pad(zonedDate.getMonth() + 1) + '-' + pad(zonedDate.getDate())
        };
    }

    function getActiveRoutines(context) {
        const routines = [];
        const lowerWeekday = (context.weekday || '').toLowerCase();
        const hour = context.hour;

        if (hour >= 5 && hour < 12) {
            routines.push(routineConfigs.morning);
        }

        if (lowerWeekday === 'friday') {
            routines.push(routineConfigs.jumuah);
        }

        if (hour >= 20 || hour < 5) {
            routines.push(routineConfigs.night);
        }

        return routines;
    }

    function buildRoutineCard(config, index) {
        const card = document.createElement('div');
        card.className = config.cardClasses;
        card.setAttribute('data-routine', config.id);
        card.setAttribute('role', 'listitem');
        card.style.animationDelay = (index * 80) + 'ms';

        const header = document.createElement('div');
        header.className = 'mb-4 flex items-center';

        const icon = document.createElement('div');
        icon.className = 'mr-3 text-2xl';
        icon.textContent = config.icon;

        const title = document.createElement('h3');
        title.className = config.titleClass;
        title.textContent = config.title;

        header.appendChild(icon);
        header.appendChild(title);
        card.appendChild(header);

        const list = document.createElement('div');
        list.className = config.listClass;

        const dayState = storageState[currentDateKey] || {};

        config.items.forEach(function (item) {
            const itemElement = buildRoutineItem(config, item, dayState);
            list.appendChild(itemElement);
        });

        card.appendChild(list);
        return card;
    }

    function buildRoutineItem(config, item, dayState) {
        const itemKey = config.id + ':' + item.id;
        const isComplete = Boolean(dayState[itemKey]);

        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'group flex w-full items-start rounded-lg px-3 py-4 text-left transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white ' + config.hoverClasses;
        button.setAttribute('data-routine-item', itemKey);
        button.setAttribute('aria-pressed', isComplete ? 'true' : 'false');

        const indicatorWrapper = document.createElement('span');
        indicatorWrapper.className = 'mr-3 mt-1 flex h-5 w-5 items-center justify-center rounded-full border-2 ' + config.checkBorder + ' transition-transform duration-200 ease-out';
        indicatorWrapper.setAttribute('aria-hidden', 'true');

        const indicatorDot = document.createElement('span');
        indicatorDot.className = 'h-2 w-2 rounded-full ' + config.checkFill + ' opacity-0 transition-opacity duration-300';
        if (isComplete) {
            indicatorDot.classList.add('opacity-100');
        }

        indicatorWrapper.appendChild(indicatorDot);

        const label = document.createElement('span');
        label.className = 'text-base text-gray-800';
        label.textContent = item.label;

        button.appendChild(indicatorWrapper);
        button.appendChild(label);

        if (isComplete) {
            button.classList.add('is-complete');
        }

        button.addEventListener('click', function () {
            const nextState = !button.classList.contains('is-complete');
            button.classList.toggle('is-complete', nextState);
            button.setAttribute('aria-pressed', nextState ? 'true' : 'false');
            indicatorDot.classList.toggle('opacity-100', nextState);

            indicatorWrapper.classList.add('scale-95');
            window.setTimeout(function () {
                indicatorWrapper.classList.remove('scale-95');
            }, 180);

            updateState(itemKey, nextState);
            if (nextState) {
                celebrateRoutineItem(config, item);
                if (isRoutineComplete(config)) {
                    celebrateRoutineCompletion(config);
                }
            } else {
                resetRoutineCelebration(config);
            }
        });

        return button;
    }

    function updateState(itemKey, completed) {
        if (!currentDateKey) {
            return;
        }

        if (!storageState[currentDateKey]) {
            storageState[currentDateKey] = {};
        }

        if (completed) {
            storageState[currentDateKey][itemKey] = true;
        } else {
            delete storageState[currentDateKey][itemKey];
        }

        persistStorage();
    }

    function celebrateRoutineCompletion(config) {
        const key = routineKey(config);
        if (!key) {
            return;
        }

        const now = Date.now();
        const previous = routineCelebrations.get(key) || 0;

        if (now - previous < 60000) {
            return;
        }

        routineCelebrations.set(key, now);
        spawnRoutineConfetti(28);
        announceRoutine('Takbir! ' + (config.title || 'Routine') + ' complete.');
        const payload = buildRoutineCelebrationPayload(config, null, 'routine');
        if (payload && window.AlfawzCelebrations && typeof window.AlfawzCelebrations.celebrate === 'function') {
            window.AlfawzCelebrations.celebrate('time', payload);
        }
    }

    function resetRoutineCelebration(config) {
        const key = routineKey(config);
        if (!key) {
            return;
        }
        routineCelebrations.delete(key);
    }

    function celebrateRoutineItem(config, item) {
        if (!config || !item) {
            return;
        }
        const key = config.id + ':' + item.id + ':' + currentDateKey;
        const now = Date.now();
        const previous = routineItemCelebrations.get(key) || 0;
        if (now - previous < 60000) {
            return;
        }
        routineItemCelebrations.set(key, now);

        const payload = buildRoutineCelebrationPayload(config, item, 'item');
        if (payload && window.AlfawzCelebrations && typeof window.AlfawzCelebrations.celebrate === 'function') {
            window.AlfawzCelebrations.celebrate('time', payload);
        }
    }

    function buildRoutineCelebrationPayload(config, item, scope) {
        const routineTitle = config && config.title ? config.title : 'Routine';

        if (scope === 'item' && item) {
            if (item.id === 'kahf') {
                return {
                    title: 'Surah Al-Kahf Complete',
                    message: 'You completed Surah Al-Kahf this blessed Friday. May it be a light between the two Fridays.',
                    detail: 'Share the reminder with family or review key ayat to deepen the benefit.',
                    cta: 'Reflect on the surah',
                };
            }
            if (item.id === 'three-q') {
                return {
                    title: 'The Three Quls recited',
                    message: 'Surah Ikhlas, Al-Falaq, and An-Nas have wrapped your routine in protection.',
                    detail: 'Repeat them again at the next sunrise or sunset for continuous guard.',
                    cta: 'Log the next adhkar',
                };
            }

            return {
                title: routineTitle + ' milestone',
                message: item.label + ' complete. Allahumma barik!',
                detail: 'Stay consistent to keep the blessings flowing.',
                cta: 'Keep the routine going',
            };
        }

        if (scope === 'routine') {
            if (config.id === 'jumuah') {
                return {
                    title: 'Jumu’ah light secured',
                    message: 'Your Jumu’ah routine is complete. May this effort illuminate the week ahead.',
                    detail: 'Encourage a loved one to recite along with you for multiplied reward.',
                    cta: 'Review favourite ayat',
                };
            }
            if (config.id === 'morning') {
                return {
                    title: 'Morning adhkar complete',
                    message: 'Your morning routine is recorded. May your day shine with remembrance.',
                    detail: 'Carry the nur forward by revisiting these verses throughout the day.',
                    cta: 'Plan the next recitation',
                };
            }
            if (config.id === 'night') {
                return {
                    title: 'Night protection complete',
                    message: 'Your evening adhkar and recitations are complete. Rest under Allah’s care.',
                    detail: 'Close the night with gratitude and a heartfelt dua.',
                    cta: 'Prepare for tomorrow',
                };
            }

            return {
                title: routineTitle + ' complete',
                message: 'Takbir! You finished the ' + routineTitle.toLowerCase() + '.',
                detail: 'Stay steadfast and let your routine blossom every day.',
                cta: 'Set your next intention',
            };
        }

        return null;
    }

    function isRoutineComplete(config) {
        if (!config || !currentDateKey) {
            return false;
        }

        const dayState = storageState[currentDateKey] || {};
        return config.items.every(function (item) {
            const itemKey = config.id + ':' + item.id;
            return Boolean(dayState[itemKey]);
        });
    }

    function routineKey(config) {
        if (!config || !currentDateKey) {
            return '';
        }
        return config.id + ':' + currentDateKey;
    }

    function announceRoutine(message) {
        if (!routineAnnouncement || !message) {
            return;
        }

        routineAnnouncement.textContent = '';
        routineAnnouncement.textContent = message;
    }

    function spawnRoutineConfetti(count) {
        const host = confettiHost || section;
        if (!host) {
            return;
        }

        const total = typeof count === 'number' && count > 0 ? count : 24;

        for (let index = 0; index < total; index++) {
            const piece = document.createElement('span');
            piece.className = 'alfawz-confetti-piece';
            piece.style.setProperty('--alfawz-confetti-x', (Math.random() * 100) + '%');
            piece.style.setProperty('--alfawz-confetti-delay', (Math.random() * 150) + 'ms');
            piece.style.setProperty('--alfawz-confetti-duration', (1200 + Math.random() * 600) + 'ms');
            host.appendChild(piece);
            window.setTimeout(function () {
                piece.remove();
            }, 2200);
        }
    }

    function createConfettiHost() {
        const host = document.createElement('div');
        host.className = 'alfawz-confetti-host';
        host.setAttribute('aria-hidden', 'true');
        section.appendChild(host);
        return host;
    }

    function createRoutineAnnouncement() {
        const announcer = document.createElement('p');
        announcer.id = 'alfawz-routine-announcement';
        announcer.className = 'screen-reader-text';
        announcer.setAttribute('role', 'status');
        announcer.setAttribute('aria-live', 'polite');
        section.insertBefore(announcer, section.firstChild);
        return announcer;
    }

    function persistStorage() {
        if (!storageAvailable) {
            return;
        }

        try {
            window.localStorage.setItem(storageKey, JSON.stringify(storageState));
        } catch (error) {
            // Fail silently; storage quota issues should not break the routine UI.
        }
    }

    function readStorage() {
        try {
            const raw = window.localStorage.getItem(storageKey);
            if (!raw) {
                return {};
            }

            const parsed = JSON.parse(raw);
            return parsed && typeof parsed === 'object' ? parsed : {};
        } catch (error) {
            return {};
        }
    }

    function pad(value) {
        return String(value).padStart(2, '0');
    }
})();
