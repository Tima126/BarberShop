document.addEventListener('DOMContentLoaded', () => {
    const hairdresserSelect = document.getElementById('input_hairdresser');
    const datePicker = document.getElementById('date-picker');
    const slotInput = document.getElementById('input_slot');
    const serviceSelect = document.getElementById('input_services');

    // Функция для загрузки услуг
    async function loadService() {
        try {
            const response = await fetch('/Zapis/Service');

            if (!response.ok) throw new Error("Ошибка при загрузке услуг");

            const service = await response.json();
            console.log('Данные, полученные с сервера:', service);

            if (service.length === 0) {
                serviceSelect.innerHTML = '<option value="">Нет услуг</option>';
                return;
            }

            serviceSelect.innerHTML = '';
            service.forEach(servic => {
                const option = document.createElement('option');
                option.value = servic.serviceid;
                option.textContent = `${servic.service_name} - ${servic.service_cost}.руб`;
                serviceSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Ошибка:', error.message);
            serviceSelect.innerHTML = '<option value="">Ошибка загрузки</option>';
        }
    }

    // Загрузка списка парикмахеров
    async function loadHairdressers() {
        try {
            const response = await fetch('/Zapis/hairdresser');

            if (!response.ok) throw new Error('Ошибка при загрузке парикмахера.');

            const hairdressers = await response.json();

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

    // Загрузка слотов для записи
    async function loadSlots(hairdresserId, date) {
        try {
            if (!hairdresserId || !date) {
                slotInput.innerHTML = '<option value="">Выберите дату и парикмахера</option>';
                return;
            }

            const response = await fetch(`/Zapis/slots?hairdresserId=${hairdresserId}&date=${date}`);
            console.log('Отправленные данные', { hairdresserId, date });

            if (!response.ok) throw new Error('Ошибка при загрузке слотов.');

            const slots = await response.json();

            if (slots.length === 0) {
                slotInput.innerHTML = '<option value="">Нет доступных слотов</option>';
                return;
            }

            slotInput.innerHTML = '';
            slots.forEach(slot => {
                const option = document.createElement('option');
                option.value = slot.scheduleid;
                option.textContent = `${slot.starttime}`;
                slotInput.appendChild(option);
            });
        } catch (error) {
            console.error('Ошибка:', error.message);
            slotInput.innerHTML = '<option value="">Ошибка загрузки</option>';
        }
    }

    // Обработчики событий для обновления слотов
    hairdresserSelect.addEventListener('change', () => {
        const selectDate = datePicker.value;
        const selectHairdresserId = hairdresserSelect.value;
        loadSlots(selectHairdresserId, selectDate);
    });

    datePicker.addEventListener('change', () => {
        const selectDate = datePicker.value;
        const selectHairdresserId = hairdresserSelect.value;
        loadSlots(selectHairdresserId, selectDate);
    });

    
    loadService(); 
    loadHairdressers();
});