// Model => Retrieve, store, process data
const Api = (() => {
  // Fetch data from server
  const url = "http://localhost:4232/courseList";
  const getData = fetch(url).then((res) => res.json());
  return {
    getData,
  };
})();

// View => User interface
const View = (() => {
  const domStr = {
    availableCoursesContainer: ".available-courses",
    selectedCoursesContainer: ".selected-courses",
    totalCreditsDisplay: "#total-credits",
    selectButton: "#select-button"
  };

  const renderAvailableCourses = (courses) => {
    const container = document.querySelector(domStr.availableCoursesContainer);
    container.innerHTML = "";
    courses.forEach(course => {
      const courseUnit = document.createElement('div');
      courseUnit.classList.add('course-unit');
      courseUnit.dataset.id = course.courseId;
      courseUnit.dataset.required = course.required;
      courseUnit.dataset.credits = course.credit;
      courseUnit.innerHTML = `
        <div class="course-name">${course.courseName}</div>
        <div class="course-type">Course Type: ${course.required ? 'Compulsory' : 'Elective'}</div>
        <div class="course-credit">${course.credit} Credits</div>
      `;
      container.appendChild(courseUnit);
    });
  };

  const renderSelectedCourses = (courses) => {
    const container = document.querySelector(domStr.selectedCoursesContainer);
    container.innerHTML = "";
    courses.forEach(course => {
      const courseUnit = document.createElement('div');
      courseUnit.classList.add('course-unit');
      courseUnit.dataset.id = course.courseId;
      courseUnit.dataset.required = course.required;
      courseUnit.dataset.credits = course.credit;
      courseUnit.innerHTML = `
        <div class="course-name">${course.courseName}</div>
        <div class="course-type">Course Type: ${course.required ? 'Compulsory' : 'Elective'}</div>
        <div class="course-credit">${course.credit} Credits</div>
      `;
      container.appendChild(courseUnit);
    });
  };

  const updateTotalCredits = (totalCredits) => {
    const totalCreditsDisplay = document.querySelector(domStr.totalCreditsDisplay);
    totalCreditsDisplay.textContent = totalCredits;
  };

  return {
    domStr,
    renderAvailableCourses,
    renderSelectedCourses,
    updateTotalCredits
  };
})();

// Controller => Manage view and data & handle user actions
const Controller = ((view, model) => {
  const { getData } = model;
  const { domStr } = view;
  let totalCredits = 0;
  let coursesSelected = false;

  const init = () => {
    getData.then((data) => {
      view.renderAvailableCourses(data);
    });
  };

  const addCourseSelectionListener = () => {
    document.querySelector(domStr.availableCoursesContainer).addEventListener('click', function(event) {
      if (!coursesSelected) {
        const courseUnit = event.target.closest('.course-unit');
        if (courseUnit) {
          const credits = parseInt(courseUnit.dataset.credits);
          const isSelected = courseUnit.classList.toggle('selected');
          if (isSelected && totalCredits + credits > 18) {
            alert("You can only choose up to 18 credits in one semester");
            courseUnit.classList.remove('selected');
            return;
          }
          totalCredits += isSelected ? credits : -credits;
          view.updateTotalCredits(totalCredits);
        }
      }
    });
  };

  const addSelectButtonListener = () => {
    document.querySelector(domStr.selectButton).addEventListener('click', function() {
      const selectedCourseUnits = document.querySelectorAll('.course-unit.selected');
      const confirmationMessage = `You have chosen ${totalCredits} credits for this semester. You cannot change once you submit. Do you want to confirm?`;
      if (confirm(confirmationMessage)) {
        const selectedCourses = Array.from(selectedCourseUnits).map(courseUnit => ({
          courseId: courseUnit.dataset.id,
          courseName: courseUnit.querySelector('.course-name').textContent,
          required: courseUnit.dataset.required === 'true',
          credit: parseInt(courseUnit.dataset.credits)
        }));
        view.renderSelectedCourses(selectedCourses);
        selectedCourseUnits.forEach(courseUnit => {
          courseUnit.remove();
        });
        coursesSelected = true;
        document.querySelector(domStr.selectButton).disabled = true;
      }
    });
  };

  const bootstrap = () => {
    init();
    addCourseSelectionListener();
    addSelectButtonListener();
  };

  return {
    bootstrap
  };
})(View, Api);

Controller.bootstrap();
