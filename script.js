let timelineAPI = { 
    data1: {
        id: 1,
        date: '2024-08-22',
        time: '03:16',
        heading: 'Hello',
        details: 'Hello world.'
    }
};

function dateSetter() {
    const date = new Date();
    document.querySelector('#dateInput').value = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
    document.querySelector('#timeInput').value = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
}

function showTimelineCreateModal(e) {
    if (e.target === e.currentTarget) {
        let timelineTableSelect = document.querySelector('.timeline-table');
        timelineTableSelect.querySelector('form').reset();
        timelineTableSelect.classList.toggle('d-none');
        dateSetter()
    }
}

document.addEventListener("DOMContentLoaded", function () {
    // for setting the date and time
    dateSetter();

    // for the add and delete modal
    document.querySelector('.timeline-table').addEventListener('click', showTimelineCreateModal);
    document.querySelector('#closeModalButton').addEventListener('click', showTimelineCreateModal);
    document.querySelector('.btn-create-timeline').addEventListener('click', () => {
        document.querySelector('.timeline-table').classList.toggle('d-none');
    });


    // for the creating timeline function
    const submitButton = document.querySelector('.submit-row-to-timeline');
    const timelineSection = document.querySelector('#timeline-create ol');
    const timelineMainForm = document.querySelector('#timelineForm');

    timelineMainForm.addEventListener('submit', function (event) {
        event.preventDefault(); // Prevent default form submission

        const dateInput = document.getElementById('dateInput').value;
        const timeInput = document.getElementById('timeInput').value;
        const titleInput = document.getElementById('titleInput').value;
        const noteInput = document.getElementById('noteInput').value;

        if (dateInput && timeInput && titleInput) {

            // Sort the timeline by date
            const timelineItems = Array.from(timelineSection.querySelectorAll('li'));
            timelineItems.sort((a, b) => {
                const dateA = new Date(a.querySelector('date').textContent + ' ' + a.querySelector('h6').textContent);
                const dateB = new Date(b.querySelector('date').textContent + ' ' + b.querySelector('h6').textContent);
                return dateA - dateB;
            });

            // Re-arrange the timeline items based on the sorted order
            timelineItems.forEach(item => timelineSection.appendChild(item));

            // Add new entry to timelineAPI object
            const maxID = Object.keys(timelineAPI).length
                ? Math.max(...Object.values(timelineAPI).map(item => item.id))
                : 0;
            const newID = maxID + 1;
            const newDataKey = `data${newID}`;

            timelineAPI[newDataKey] = {
                id: newID,
                date: dateInput,
                time: timeInput,
                heading: titleInput,
                details: noteInput || 'Nothing to say'
            };

            // console.log("Updated timelineAPI:", timelineAPI);

            timelineMainForm.reset();
            dateSetter();
            renderData()
            autoAlert('Timeline Created', 'success')
        } else {
            alert('Please fill out all fields.');
        }
    });
});


//for deleting the timeline 
document.addEventListener('click', e => {
    if (e.target.closest('.delete-timelines')) {

        currentEditKey = 'data' + e.target.closest('.delete-timelines').dataset.key;
        delete timelineAPI[currentEditKey];

        renderData()
        autoAlert(`Timeline no ${e.target.closest('.delete-timelines').dataset.key} data deleted!`, 'danger')
    }

});



let currentEditKey = null;
// for submitting the modal form
function handleFormSubmit(e) {
    e.preventDefault();

    if (!currentEditKey || !timelineAPI[currentEditKey]) return;

    timelineAPI[currentEditKey].date = document.getElementById('dateEditInput').value;
    timelineAPI[currentEditKey].time = document.getElementById('timeEditInput').value;
    timelineAPI[currentEditKey].heading = document.getElementById('titleEditInput').value;
    timelineAPI[currentEditKey].details = document.getElementById('noteEditInput').value;

    renderData();
    document.querySelector('.timeline-edit').classList.add('d-none');
    autoAlert(`Timeline no ${currentEditKey.replace('data', '')} edited successfully`, 'success');
}
document.querySelector('.timeline-edit form').addEventListener('submit', handleFormSubmit);
// for showing the modal form
document.addEventListener('click', (e) => {
    const editButton = e.target.closest('.edit-timelines');

    if (editButton) {
        const key = editButton.dataset.key;
        currentEditKey = `data${key}`;
        const timelineData = timelineAPI[currentEditKey];

        if (timelineData) {
            document.getElementById('dateEditInput').value = timelineData.date || '';
            document.getElementById('timeEditInput').value = timelineData.time || '';
            document.getElementById('titleEditInput').value = timelineData.heading || '';
            document.getElementById('noteEditInput').value = timelineData.details || 'Nothing to say';

            document.querySelector('.timeline-edit').classList.remove('d-none');
        }
    }
});



document.querySelector('#exitEditBtn').addEventListener('click', () => {
    document.querySelector('.timeline-edit').classList.add('d-none');
    autoAlert('Edit Cancel', 'warning')
});

// for moving the timeline 
document.querySelector('#editFormMove').addEventListener('mousedown', (e) => {
    const timelineEdit = document.querySelector('.timeline-edit');

    if (!timelineEdit) return;

    // Initial mouse positions and offsets
    let startX = e.clientX;
    let startY = e.clientY;
    let initialLeft = parseInt(window.getComputedStyle(timelineEdit).left, 10) || 0;
    let initialTop = parseInt(window.getComputedStyle(timelineEdit).top, 10) || 0;

    // Function to handle mouse movements
    function onMouseMove(e) {
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;

        timelineEdit.style.left = `${initialLeft + dx}px`;
        timelineEdit.style.top = `${initialTop + dy}px`;
    }

    // Function to stop dragging
    function onMouseUp() {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
    }

    // Add event listeners for mouse movement and release
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
});


//   for the rendering timeline
localStorage.getItem('currentTimeline') ? timelineAPI = JSON.parse(localStorage.getItem('currentTimeline')) : ''
// console.log(JSON.parse(localStorage.getItem('currentTimeline')));
function renderData() {
    document.querySelector('#timeline-create ol').innerHTML = ''


    Object.values(timelineAPI).map((v, k) => {
        const newTimelineItem = document.createElement('li');
        newTimelineItem.style.cursor = 'pointer'
        newTimelineItem.innerHTML = `
            <div class="timeline-note position-relative">
                <button class="btn btn-outline-success position-absolute end-0 top-0 mt-1 me-2 edit-timelines" data-key="${v.id}" style="width: 15%;"><i class="bi bi-pencil-square"></i></button>

                <button class="btn btn-outline-danger position-absolute end-0 top-0 mt-5 me-2 px-1 delete-timelines" data-key="${v.id}" style="width: 15%;"><i class="bi bi-trash"></i></button>

                <date>${v.date}</date>
                <h6>${v.time}</h6>
                <h4>${v.heading}</h4>
                <p>${v.details || 'Nothing to say'}</p>
            </div>
        `;

        document.querySelector('#timeline-create ol').appendChild(newTimelineItem);
    });
}
renderData()

// Zoom and Drag functionality
document.addEventListener("DOMContentLoaded", function () {
    const timelineSection = document.querySelector('#timeline-create ol');
    const timelineSectionMain = document.querySelector('#timeline-create');
    let scale = 1;
    let isDragging = false;
    let startX, startY;
    let offsetX = 0, offsetY = 0;

    document.querySelector('.Zoom-in').addEventListener('click', () => {
        scale += 0.1;
        timelineSection.style.transform = `scale(${scale}) translate(${offsetX}px, ${offsetY}px)`;
    });

    document.querySelector('.Zoom-out').addEventListener('click', () => {
        scale = Math.max(0.1, scale - 0.1); // Ensure scale doesn't go below 0.1
        timelineSection.style.transform = `scale(${scale}) translate(${offsetX}px, ${offsetY}px)`;
    });

    timelineSection.addEventListener('contextmenu', (e) => {
        e.preventDefault(); // Prevent the context menu from appearing
    });

    timelineSectionMain.addEventListener('mousedown', (e) => {
        if (e.button === 2) { // 2 is the right mouse button
            isDragging = true;
            startX = e.clientX - offsetX;
            startY = e.clientY - offsetY;
            timelineSection.classList.add('dragging');
        }
    });

    document.addEventListener('mousemove', (e) => {
        if (isDragging) {
            offsetX = e.clientX - startX;
            offsetY = e.clientY - startY;
            timelineSection.style.transform = `scale(${scale}) translate(${offsetX}px, ${offsetY}px)`;
        }
    });

    document.addEventListener('mouseup', (e) => {
        if (e.button === 2) { // Only stop dragging if the right mouse button is released
            isDragging = false;
            timelineSection.classList.remove('dragging');
        }
    });

    document.addEventListener('mouseleave', () => {
        isDragging = false;
        timelineSection.classList.remove('dragging');
    });

    // Arrow-based scrolling functionality
    const arrowPrev = document.getElementById("arrow_prev_btn");
    const arrowNext = document.getElementById("arrow_next_btn");
    const btnReset = document.querySelector(".btn-reset");
    const timeline = timelineSectionMain.querySelector('ol');
    const scrollAmount = 300; // Amount to scroll with each arrow click, adjust as needed

    btnReset.addEventListener('click', () => {
        scale = 1;
        offsetX = 0;
        offsetY = 0;
        timeline.style.transform = `scale(${scale}) translate(${0}px, ${0}px)`;
    });

    arrowNext.addEventListener('click', () => {
        offsetX = offsetX - scrollAmount;
        timeline.style.transform = `scale(${scale}) translate(${offsetX}px, ${offsetY}px)`;
    });

    arrowPrev.addEventListener('click', () => {
        offsetX = offsetX + scrollAmount;
        timeline.style.transform = `scale(${scale}) translate(${offsetX}px, ${offsetY}px)`;
    });
});

// Download as PNG functionality
document.querySelector(".png__download").addEventListener("click", function () {
    const pageHeader = document.querySelector(".page-header");
    const timelineElement = document.querySelector(".timeline");

    const combinedElement = document.createElement('div');
    combinedElement.style.display = 'block';
    combinedElement.appendChild(timelineElement.cloneNode(true));

    document.body.appendChild(combinedElement);

    html2canvas(combinedElement, {
        useCORS: true,
        onclone: (clonedDoc) => {
            // Example: Ensure visibility of text or any other specific tweaks
            clonedDoc.querySelector('.timeline').style.visibility = 'visible';
        }
    }).then(function (canvas) {
        document.body.removeChild(combinedElement);

        const link = document.createElement('a');
        link.href = canvas.toDataURL("image/png");
        link.download = 'timeline.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        autoAlert('Image Downloaded Successfully', 'success')
    });
});


document.querySelector('#btn_reset_timeline').addEventListener("click", () => {
    timelineAPI = {}
    renderData()
    autoAlert('Timeline Reset!!', 'danger')
})



document.querySelector('#save_local_button').addEventListener("click", () => {
    localStorage.setItem('currentTimeline', JSON.stringify(timelineAPI))
    autoAlert('Saved into Browser', 'success')
})

document.querySelector('#delete_local_button').addEventListener("click", () => {
    localStorage.removeItem('currentTimeline')
    autoAlert('Deleted From Browser', 'danger')
})

document.querySelector('#download_local_button').addEventListener("click", () => {
    timelineAPI = JSON.parse(localStorage.getItem('currentTimeline'))
    renderData()
    autoAlert('Timeline Reloaded.', 'success')
})



let autoSaveToggle = JSON.parse(localStorage.getItem('autoSave')) || false;
let autoSaveInterval = null;
autoSaveToggle? autoAlert('Your Autosave is currently Running', 'warning'):''
function setupAutoSave() {
    if (autoSaveToggle) {
        document.querySelector('#autosave_local_button i').classList.add('bg-success', 'text-white');
        autoSaveInterval = setInterval(() => {
            if (timelineAPI) {
                localStorage.setItem('currentTimeline', JSON.stringify(timelineAPI));
                // console.log('Timeline autosaved.');
            }
        }, 500);
    } else {
        document.querySelector('#autosave_local_button i').classList.remove('bg-success', 'text-white');
        clearInterval(autoSaveInterval);
        autoSaveInterval = null;
    }
}
setupAutoSave();

document.querySelector('#autosave_local_button').addEventListener("click", () => {
    autoSaveToggle = !autoSaveToggle;
    localStorage.setItem('autoSave', autoSaveToggle);
    setupAutoSave();
    autoAlert(autoSaveToggle ? 'Autosave On' : 'Autosave Off', autoSaveToggle ? 'success' : 'warning');
});



document.querySelector('#downloading_local_btn').addEventListener("click", () => downloadJSON(timelineAPI))
function downloadJSON(data, filename = 'Timeline.json') {

    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = (prompt('Type the name of the file') || 'Timeline') + '.json';
    link.click();
    document.body.appendChild(link);
    document.body.removeChild(link);
    autoAlert('File Downloaded Successfully!', 'success')
}

document.querySelector('#Uploading_local_btn').addEventListener("click", (e) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.click();

    input.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.readAsText(file);
            reader.onload = (event) => {
                try {
                    const jsonData = JSON.parse(event.target.result);
                    timelineAPI = jsonData;
                    renderData()
                    autoAlert('File Uploaded Successfully!', 'success')
                } catch (error) {
                }
            };
            reader.onerror = (error) => {
                // console.error('Error reading file:', error);
            };
        }
    });
});




function autoAlert(alertName, alertType) {
    const alertHTML = `
        <div class="alert alert-${alertType || 'warning'} alert-dismissible fade show px-0 pb-0 overflow-hidden my-1 me-2" role="alert">
            <p class="px-3">${alertName || 'Eror Ocurred!!'}</p>
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            <div class="progress rounded-0 h-100" role="progressbar" aria-label="Basic example" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100">
                <div class="progress-bar bg-${alertType|| 'warning'}" style="height: 7px;"></div>
            </div>
        </div>
    `;
    document.querySelector('.alert-box').insertAdjacentHTML('afterbegin', alertHTML);
    const newAlert = document.querySelectorAll('.alert');
    const animationDuration = 2000;
    newAlert.forEach(e => {
        e.querySelector('.progress-bar').style.animation= `addLoadingBar ${animationDuration}ms none linear normal`
        setTimeout(() => {
            e.classList.remove('show');
            e.addEventListener('transitionend', () => {
                e.remove();
            }, { once: true });
        }, animationDuration);
    });
}
