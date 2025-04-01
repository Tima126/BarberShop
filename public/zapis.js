document.addEventListener('DOMContentLoaded', () => {

    const hairdresserSelect = document.getElementById('input_hairdresser');
    const datePicker = document.getElementById('date-picker');
    const slotInput = document.getElementById('input_slot');
    const serviceSelect = document.getElementById('input_services');
<<<<<<< Updated upstream



    // загрузка услуг
   async function LoadYslug() {
        try {
            const response = await fetch('/Zapis/Uslugi');
            
            if (!response.ok) {
                throw new Error('Ошибка при загрузке данных услуг');
            }

            const uslug = await response.json();

            serviceSelect.innerHTML = '';

            if (uslug.length === 0) {
                serviceSelect.innerHTML = '<option value="">Нет доступных услуг</option>';
                return;
            }

            
            uslug.forEach(service => {
                const option = document.createElement('option');
                option.value = service.serviceid;
                option.textContent = service.service_name;
                serviceSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Ошибка:', error.message);
            serviceSelect.innerHTML = '<option value="">Ошибка загрузки</option>';
        }
    }

=======
<<<<<<< HEAD
    
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
=======
>>>>>>> Stashed changes



    // загрузка услуг
   async function LoadYslug() {
        try {
            const response = await fetch('/Zapis/Uslugi');
            
            if (!response.ok) {
                throw new Error('Ошибка при загрузке данных услуг');
            }

            const uslug = await response.json();

            serviceSelect.innerHTML = '';

            if (uslug.length === 0) {
                serviceSelect.innerHTML = '<option value="">Нет доступных услуг</option>';
                return;
            }

            
            uslug.forEach(service => {
                const option = document.createElement('option');
                option.value = service.serviceid;
                option.textContent = service.service_name;
>>>>>>> d71d60a26f161dcc532f52320acf76af746c7aef
                serviceSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Ошибка:', error.message);
            serviceSelect.innerHTML = '<option value="">Ошибка загрузки</option>';
        }
    }

<<<<<<< HEAD
    loadService(); 
=======
>>>>>>> d71d60a26f161dcc532f52320acf76af746c7aef


    // Загрузка списка парикмахеров,  маршрут для сервера /Zapis/hairdresser
    async function loadHairdressers() {
        try {
            const response = await fetch('/Zapis/hairdresser');

            if (!response) throw new Error('Ошибка при загрузке парикмахера.');

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

    // загрузка слотов для записи которые назначил админ 
    async function loadSlots(hairdresserId, date) {
        try {

            if (!hairdresserId || !date) {
                slotInput.innerHTML = '<option value="">Выберите дату и парикмахера</option>';
                return;
            }
            const response = await fetch(`/Zapis/slots?hairdresserId=${hairdresserId}&date=${date}`);
            console.log('Отправленные данные', { hairdresserId, date })



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
                option.textContent = `${slot.starttime}`
                slotInput.appendChild(option);
            });



        } catch (error) {
            console.error('Ошибка:', error.message);
            slotInput.innerHTML = '<option value="">Ошибка загрузки</option>';
        }
    }

    
    hairdresserSelect.addEventListener('change', () => {
        const selectDate = datePicker.value;
        const selectHasirdresserId = hairdresserSelect.value;


        loadSlots(selectHasirdresserId, selectDate);
    });


<<<<<<< Updated upstream
=======
<<<<<<< HEAD
    datePicker.addEventListener('change', () => {
=======
>>>>>>> Stashed changes




    datePicker.addEventListener('change', () =>{
>>>>>>> d71d60a26f161dcc532f52320acf76af746c7aef
        const selectDate = datePicker.value;
        const selectHasirdresserId = hairdresserSelect.value;
        loadSlots(selectHasirdresserId, selectDate);

    });

    LoadYslug()
    loadHairdressers()
   
});



