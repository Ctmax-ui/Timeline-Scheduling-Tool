

function dateSetter() {
  const date = new Date();
  document.querySelector('#dateInput').value = `${date.getFullYear()}-${date.getMonth() >= 0 && date.getMonth() <= 9 ? '0' + date.getMonth() : date.getMonth()}-${date.getDate()}`;
  document.querySelector('#timeInput').value = `${date.getHours()}:${date.getMinutes()}`
}


function showTimelineCreateModal(e) {
  if (e.target === e.currentTarget) {
    let timelineTableSelect = document.querySelector('.timeline-table');
    timelineTableSelect.classList.toggle('d-none');
  }
}


document.addEventListener("DOMContentLoaded", function () {
  dateSetter()

  document.querySelector('.timeline-table').addEventListener('click', showTimelineCreateModal)
  document.querySelector('#closeModalButton').addEventListener('click', showTimelineCreateModal)

  document.querySelector('.btn-create-timeline').addEventListener('click', ()=>{
    document.querySelector('.timeline-table').classList.toggle('d-none');
  })


  const submitButton = document.querySelector('.submit-row-to-timeline');
  const timelineSection = document.querySelector('#timeline-create ol');
  const timelineMainForm = document.querySelector('#timelineForm')

  timelineMainForm.addEventListener('submit', function (event) {
    event.preventDefault(); // Prevent default form submission

    const dateInput = document.getElementById('dateInput').value;
    const timeInput = document.getElementById('timeInput').value;
    const titleInput = document.getElementById('titleInput').value;
    const noteInput = document.getElementById('noteInput').value;

    if (dateInput && timeInput && titleInput ) {
      const newTimelineItem = document.createElement('li');
      newTimelineItem.innerHTML = `
                    <div class="timeline-note">
                        <date>${dateInput}</date>
                        <h6>${timeInput}</h6>
                        <h4>${titleInput}</h4>
                        <p>${noteInput || 'Nothing to say'}</p>
                    </div>
                `;

      // Add new item to timeline
      timelineSection.appendChild(newTimelineItem);

      // Sort the timeline by date
      const timelineItems = Array.from(timelineSection.querySelectorAll('li'));
      timelineItems.sort((a, b) => {
        const dateA = new Date(a.querySelector('date').textContent + ' ' + a.querySelector('h6').textContent);
        const dateB = new Date(b.querySelector('date').textContent + ' ' + b.querySelector('h6').textContent);
        return dateA - dateB;
      });

      // Re-arrange the timeline items based on the sorted order
      timelineSection.innerHTML = '';
      timelineItems.forEach(item => timelineSection.appendChild(item));

      // Clear the form fields after successful submission
      document.getElementById('timelineForm').reset();
      dateSetter()
    } else {
      alert('Please fill out all fields.');
    }
  });
});
 

  
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

      //timeline

      const arrowPrev = document.getElementById("arrow_prev_btn");
      const arrowNext = document.getElementById("arrow_next_btn");
      const btnReset = document.querySelector(".btn-reset");
      const timelineContainer = document.querySelector('#timeline-create');
      const timeline = timelineContainer.querySelector('ol');
      const scrollAmount = 300; // Amount to scroll with each arrow click, adjust as needed

      btnReset.addEventListener('click', () => {
        scale = 1
        offsetX = 0
         offsetY = 0;
        timeline.style.transform = `scale(${scale}) translate(${0}px, ${0}px)`
      })

      arrowNext.addEventListener('click', () => {
        offsetX = offsetX - scrollAmount
        timeline.style.transform = `scale(${scale}) translate(${offsetX}px, ${offsetY}px)`
      })

      arrowPrev.addEventListener('click', () => {
        offsetX = offsetX + scrollAmount
        timeline.style.transform = `scale(${scale}) translate(${offsetX}px, ${offsetY}px)`
      })
    });

    document.querySelector(".png__download").addEventListener("click", function () {
      const pageHeader = document.querySelector(".page-header");
      const timelineElement = document.querySelector(".timeline");

      const combinedElement = document.createElement('div');
      combinedElement.style.display = 'block';
      // combinedElement.appendChild(pageHeader?.cloneNode(true));
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
