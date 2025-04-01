document.addEventListener('DOMContentLoaded', () => {
    const hairdresserSelect = document.getElementById('hairdresser-select');
    const datePicker = document.getElementById('date-picker');
    const startTimeInput = document.getElementById('start-time');
    const endTimeInput = document.getElementById('end-time');
    const addSlot = document.getElementById('add-slot');
    const scheduleTableBody = document.querySelector('#schedule-table tbody');

    // Загрузка списка парикмахеров
    async function loadHairdressers() {
        try {
            const response = await fetch('/api/hairdressers');
            if (!response.ok) throw new Error('Ошибка при загрузке парикмахеров.');

            const hairdressers = await response.json();
            console.log('Загруженные парикмахеры:', hairdressers); // Отладочное сообщение

            if (hairdressers.length === 0) {
                hairdresserSelect.innerHTML = '<option value="">Нет доступных парикмахеров</option>';
                return;
            }

            hairdresserSelect.innerHTML = '';
            hairdressers.forEach(hairdresser => {
                const option = document.createElement('option');
                option.value = hairdresser.hairdresserid; 
                option.textContent = `${hairdresser.hairdresser_name} ${hairdresser.hairdresser_surname}`;
                hairdresserSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Ошибка:', error.message);
            hairdresserSelect.innerHTML = '<option value="">Ошибка загрузки</option>';
        }
    }

    // Загрузка расписания
    async function loadSchedule() {
        try {
            const response = await fetch('/api/schedule');
            if (!response.ok) throw new Error('Ошибка при загрузке расписания.');
    
            const schedule = await response.json();
            console.log('Данные из API:', schedule); 
    
            populateScheduleTable(schedule);
        } catch (error) {
            console.error('Ошибка:', error.message);
            scheduleTableBody.innerHTML = '<tr><td colspan="5">Не удалось загрузить данные.</td></tr>';
        }
    }

    function extractTime(isoString) {
        if (!isoString) return 'Invalid Time'; 
    
        const date = new Date(isoString);
        if (isNaN(date)) return 'Invalid Time'; 
    
        const hours = String(date.getUTCHours()).padStart(2, '0');
        const minutes = String(date.getUTCMinutes()).padStart(2, '0');
        const seconds = String(date.getUTCSeconds()).padStart(2, '0');
    
        return `${hours}:${minutes}:${seconds}`;
    }

    // Добавление слота
    addSlot.addEventListener('click', async () => {
        
        const rawHairdresserId = hairdresserSelect.value;
        const date = datePicker.value; // Формат: YYYY-MM-DD
        const startTime = startTimeInput.value; // Формат: HH:mm
        const endTime = endTimeInput.value; // Формат: HH:mm
        const hairdresserId = parseInt(rawHairdresserId, 10);
    
        if (isNaN(hairdresserId)) {
            alert('Выберите корректного парикмахера.');
            return;
        }
    
        if (!date || !startTime || !endTime) {
            alert('Заполните все поля.');
            return;
        }
    
        // Добавляем секунды для времени
        const formattedStartTime = `${startTime}:00`;
        const formattedEndTime = `${endTime}:00`;
    
        console.log('Отправляемые данные:', { hairdresserId, date, formattedStartTime, formattedEndTime });
    
        try {
            const response = await fetch('/api/slotHair', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    hairdresserId,
                    date,
                    startTime: formattedStartTime,
                    endTime: formattedEndTime
                })
            });
    
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Ошибка сервера');
            }
    
            alert('Слот успешно добавлен.');
            loadSchedule();
        } catch (error) {
            console.error('Ошибка:', error.message);
            alert(`Ошибка: ${error.message}`);
        }
    });

    // Форматирование даты
    function formDate(datestring) {
        const date = new Date(datestring);
        return date.toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    }


    // Заполнение таблицы
    function populateScheduleTable(schedule) {
        scheduleTableBody.innerHTML = '';
    
        if (!schedule || schedule.length === 0) {
            scheduleTableBody.innerHTML = '<tr><td colspan="5">Нет доступных слотов.</td></tr>';
            return;
        }
    
        schedule.forEach(slot => {
            const formattedStartTime = extractTime(slot.starttime);
            const formattedEndTime = extractTime(slot.endtime);
    
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${slot.scheduleid}</td>
                <td>${slot.hairdresser_name} ${slot.hairdresser_surname}</td>
                <td>${formDate(slot.workdate)}</td>
                <td>${formattedStartTime}</td>
                <td>${formattedEndTime}</td>
            `;
            scheduleTableBody.appendChild(row);
        });
    }


    loadHairdressers();
    loadSchedule();
});