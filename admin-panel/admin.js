document.addEventListener('DOMContentLoaded', () => {
    const loading = document.getElementById('loading');
    const recordsTable = document.getElementById('recordsTable');

    // Загрузка данных при загрузке страницы
    async function loadRecords() {
        try {
            const response = await fetch('/admin/get-records');
            if (!response.ok) throw new Error('Ошибка при загрузке данных.');

            const records = await response.json();
            populateTable(records);
            loading.style.display = 'none';
            recordsTable.style.display = 'table';
        } catch (error) {
            console.error('Ошибка:', error.message);
            loading.textContent = 'Не удалось загрузить данные.';
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


    // Форматирование даты
    function formDate(datestring) {
        const date = new Date(datestring);
        return date.toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    }


    // Заполнение таблицы данными
    function populateTable(records) {
        const tbody = recordsTable.querySelector('tbody');
        tbody.innerHTML = '';

        records.forEach(record => {
            const formatedTime = extractTime(record.recordTime);
            const row = document.createElement('tr');
            row.setAttribute('data-record-id', record.id); 

            row.innerHTML = `
                <td>${record.id}</td>
                <td>${record.clientName}</td>
                <td>${record.clientPhone}</td>
                <td>${record.hairdresserName} ${record.hairdresserSurname}</td>
                <td>${record.city}, ${record.street}, ${record.buildingNumber}</td>
                <td>${formDate(record.recordDate)}, ${formatedTime}</td>
                <td class="status">${record.isCompleted ? 'Выполнен' : 'В процессе'}</td>
                <td class="actions">
                    ${
                        !record.isCompleted
                            ? `<button class="complete-btn" onclick="markAsCompleted(${record.id})">Приём пройден</button>`
                            : ''
                    }
                    <button class="delete-btn" onclick="deleteRecord(${record.id})">Удалить</button>
                </td>
            `;

            tbody.appendChild(row);
        });
    }

    // Отметка о завершении приёма
    window.markAsCompleted = async (recordId) => {
        try {
            const response = await fetch(`/admin/complete-record/${recordId}`, { method: 'PUT' });
            if (!response.ok) throw new Error('Ошибка при обновлении статуса.');

           
            const rowToUpdate = document.querySelector(`tr[data-record-id="${recordId}"]`);
            if (rowToUpdate) {
                const statusCell = rowToUpdate.querySelector('.status');
                if (statusCell) {
                    statusCell.textContent = 'Выполнен'; 
                }

               
                const actionsCell = rowToUpdate.querySelector('.actions');
                if (actionsCell) {
                    const completeButton = actionsCell.querySelector('.complete-btn');
                    if (completeButton) {
                        completeButton.remove(); 
                    }
                }
            }

            alert('Приём успешно завершён.');
        } catch (error) {
            console.error('Ошибка:', error.message);
            alert('Не удалось завершить приём.');
        }
    };

    // Удаление записи
    window.deleteRecord = async (recordId) => {


        try {
            const response = await fetch(`/admin/delete-record/${recordId}`, { method: 'DELETE' });
            if (!response.ok) throw new Error('Ошибка при удалении записи.');

            // Удаление строки из таблицы
            const rowToRemove = document.querySelector(`tr[data-record-id="${recordId}"]`);
            if (rowToRemove) {
                rowToRemove.remove();
            }

            alert('Запись успешно удалена.');
        } catch (error) {
            console.error('Ошибка:', error.message);
            alert('Не удалось удалить запись.');
        }
    };

   
    let intervalId = null; 
    function startAutoReload() {
        intervalId = setInterval(loadRecords, 10000); 
    }

    function stopAutoReload() {
        if (intervalId) {
            clearInterval(intervalId); 
        }
    }

    
    loadRecords(); 
    startAutoReload();

    
    window.addEventListener('beforeunload', () => {
        stopAutoReload();
    });
});