let timelineAPI = {
    data0: {
        date: '2024-07-22',
        time: '02:16',
        heading: 'Hello',
        details: 'Hello world.'
    },
    data1: {
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
            const newDataKey = `data${Object.keys(timelineAPI).length}`;
            timelineAPI[newDataKey] = {
                date: dateInput,
                time: timeInput,
                heading: titleInput,
                details: noteInput || 'Nothing to say'
            };

            console.log("Updated timelineAPI:", timelineAPI);

            // Clear the form fields after successful submission
            timelineMainForm.reset();
            dateSetter();
            renderData()
        } else {
            alert('Please fill out all fields.');
        }
    });
});



// for the edit timeline
let currentEditKey = null; // To track the currently editing timeline entry
document.addEventListener('click', e => {
    if (e.target.closest('.edit-timelines')) {

        currentEditKey = 'data' + e.target.closest('.edit-timelines').dataset.key;
        const timelineData = timelineAPI[currentEditKey];

        document.getElementById('dateEditInput').value = timelineData?.date;
        document.getElementById('timeEditInput').value = timelineData?.time;
        document.getElementById('titleEditInput').value = timelineData?.heading;
        document.getElementById('noteEditInput').value = timelineData?.details || 'Nothing to say';

        document.querySelector('.timeline-edit').classList.remove('d-none');

        document.querySelector('.timeline-edit form').addEventListener('submit', (e) => {
            e.preventDefault()
            editTimelineEntry(currentEditKey, {
                date: document.getElementById('dateEditInput').value,
                time: document.getElementById('timeEditInput').value,
                heading: document.getElementById('titleEditInput').value,
                details: document.getElementById('noteEditInput').value
            })
            renderData()
            document.querySelector('.timeline-edit').classList.add('d-none');
        })
    }

});
document.querySelector('#exitEditBtn').addEventListener('click', ()=>{
    document.querySelector('.timeline-edit').classList.add('d-none');
});
function editTimelineEntry(key, newData) {
    if (timelineAPI.hasOwnProperty(key)) {
        timelineAPI[key] = {
            // ...timelineAPI[key],
            ...newData
        };

        console.log("Updated timelineAPI:", timelineAPI);
    } else {
        console.error(`Entry with key ${key} does not exist.`);
    }
}



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
function renderData() {
    document.querySelector('#timeline-create ol').innerHTML = ''
    Object.values(timelineAPI).map((v, k) => {
        const newTimelineItem = document.createElement('li');
        newTimelineItem.style.cursor = 'pointer'
        newTimelineItem.innerHTML = `
            <div class="timeline-note position-relative">
                <button class="btn btn-outline-success position-absolute end-0 top-0 mt-1 me-2 edit-timelines" data-key="${k}" style="width: 15%;"><i class="bi bi-pencil-square"></i></button>

                <button class="btn btn-outline-danger position-absolute end-0 top-0 mt-5 me-2 px-1 delete-timelines" data-key="${k}" style="width: 15%;"><i class="bi bi-trash"></i></button>

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
    });
});
