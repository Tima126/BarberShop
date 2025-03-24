document.addEventListener('DOMContentLoaded', () => {
    const hairdresserSelect = document.getElementById('hairdresser-select');
    const datePicker = document.getElementById('date-picker');
    const startTimeInput = document.getElementById('start-time');
    const endTimeInput = document.getElementById('end-time');
    const addSlot = document.getElementById('add-slot');
    const scheduleTableBody = document.querySelector('#schedule-table tbody');
    const loading = document.getElementById('loading');
    const scheduleTable = document.getElementById('schedule-table');
   
    // Загрузка списка парикмахеров
    async function loadHairdressers() {
        try {
            const response = await fetch('/api/hairdressers'); 
            if (!response.ok) throw new Error('Ошибка при загрузке парикмахеров.');

            const hairdressers = await response.json();
            hairdresserSelect.innerHTML = '';
            hairdressers.forEach(hairdresser => {
                const option = document.createElement('option');
                option.value = hairdresser.hairdresserid;
                option.textContent = `${hairdresser.hairdresser_name} ${hairdresser.hairdresser_surname}`;
                hairdresserSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Ошибка:', error.message); 
        }
    }

    // выгрузка для расписание 
    async function loadSchedule() {
        try {
            const response = await fetch('/api/schedule');
            if (!response.ok) throw new Error('Ошибка при загрузке расписания.');

            const schedule = await response.json();
            
            populateScheduleTable(schedule);

            loading.style.display = 'none';
            scheduleTable.style.display = 'table';



        } catch (error) {
            console.error('Ошибка:', error.message);
            loading.textContent = 'Не удалось загрузить данные.';
        }
    }


// ------------------------
// функици для форматирование даты

// Форматирование Даты
function formDate(datestring){ 
    const date = new Date(datestring);

    return date.toLocaleDateString('ru-RU', {
        day:'numeric',
        month:'long',
        year:'numeric'
    });
}

// Форматирование времени
function formatTime(timeString) {
    const date = new Date (`1970-01-01T${timeString}`)
    return date.toLocaleTimeString('ry-RU', {
        hour:'2-digit',
        minute:'2-digit'
    });
}
//-------------------------


    // Функциия для заполнения таблицы
    function populateScheduleTable(schedule) {
        scheduleTableBody.innerHTML = '';

        schedule.forEach(slot =>{
            const row = document.createElement('tr');
            const formattedDate = formDate(slot.workdate); 
            const formattedStartTime = formatTime(slot.starttime); 
            const formattedEndTime = formatTime(slot.endtime);


            row.innerHTML = `
                <td>${slot.scheduleid}
                <td>${slot.hairdresser_name} ${slot.hairdresser_surname}</td>
                <td>${formattedDate}</td>
                <td>${formattedStartTime}</td>
                <td>${formattedEndTime}</td>
            ` ;
            
            scheduleTableBody.appendChild(row);
        });
        

    }
   
    loadHairdressers();
    loadSchedule();

});