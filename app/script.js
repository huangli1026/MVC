const Api = (() => {
  const url = "http://localhost:4232/courseList";

  const getData = () => {
    return fetch(url).then(response => response.json());
  };

  return {
    getData
  };
})();

const View = (() => {
  const domStr = {
    availableCoursesContainer: ".available-courses",
    selectedCoursesContainer: ".selected-courses",
    totalCreditsDisplay: "#total-credits",
    selectButton: "#select-button"
  };

  const renderAvailableCourses = (courses) => {
    const container = document.querySelector(domStr.availableCoursesContainer);
    container.innerHTML = `<div class="course-title">Available Courses</div>`;
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
    container.innerHTML = `<div class="course-title">Selected Courses</div>`;
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

const Model = ((view, api) => {
  let totalCredits = 0;
  let coursesSelected = false;
  let availableCourses = [];
  let selectedCourses = [];

  const getTotalCredits = () => totalCredits;

  const setTotalCredits = (credits) => {
    totalCredits = credits;
  };

  const getCoursesSelected = () => coursesSelected;

  const setCoursesSelected = (selected) => {
    coursesSelected = selected;
  };

  const getAvailableCourses = () => availableCourses;

  const setAvailableCourses = (courses) => {
    availableCourses = courses;
  };

  const getSelectedCourses = () => selectedCourses;

  const setSelectedCourses = (courses) => {
    selectedCourses = courses;
  };

  return {
    getTotalCredits,
    setTotalCredits,
    getCoursesSelected,
    setCoursesSelected,
    getAvailableCourses,
    setAvailableCourses,
    getSelectedCourses,
    setSelectedCourses
  };
})(View, Api);

const Controller = ((view, model) => {
  const { domStr, renderAvailableCourses, renderSelectedCourses, updateTotalCredits } = view;
  const { getTotalCredits, setTotalCredits, getCoursesSelected, setCoursesSelected,
    getAvailableCourses, setAvailableCourses, getSelectedCourses, setSelectedCourses } = model;

  const init = () => {
    Api.getData().then(data => {
      setAvailableCourses(data);
      renderAvailableCourses(data);
    });
  };

  const addCourseSelectionListener = () => {
    document.querySelector(domStr.availableCoursesContainer).addEventListener('click', function (event) {
      if (!getCoursesSelected()) {
        const courseUnit = event.target.closest('.course-unit');
        if (courseUnit) {
          const credits = parseInt(courseUnit.dataset.credits);
          const isSelected = courseUnit.classList.toggle('selected');
          if (isSelected && getTotalCredits() + credits > 18) {
            alert("You can only choose up to 18 credits in one semester");
            courseUnit.classList.remove('selected');
            return;
          }
          setTotalCredits(isSelected ? getTotalCredits() + credits : getTotalCredits() - credits);
          updateTotalCredits(getTotalCredits());
        }
      }
    });
  };

  const addSelectButtonListener = () => {
    document.querySelector(domStr.selectButton).addEventListener('click', function () {
      const selectedCourseUnits = document.querySelectorAll('.course-unit.selected');
      const confirmationMessage = `You have chosen ${getTotalCredits()} credits for this semester. You cannot change once you submit. Do you want to confirm?`;
      if (confirm(confirmationMessage)) {
        const selectedCourses = Array.from(selectedCourseUnits).map(courseUnit => ({
          courseId: courseUnit.dataset.id,
          courseName: courseUnit.querySelector('.course-name').textContent,
          required: courseUnit.dataset.required === 'true',
          credit: parseInt(courseUnit.dataset.credits)
        }));
        setSelectedCourses(selectedCourses);
        renderSelectedCourses(selectedCourses);
        selectedCourseUnits.forEach(courseUnit => {
          courseUnit.remove();
        });
        setCoursesSelected(true);
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
})(View, Model);

Controller.bootstrap();