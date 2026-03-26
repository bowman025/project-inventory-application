window.addEventListener('scroll', () => {
  const header = document.querySelector('header');
  if (window.scrollY > 10) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
});

document.querySelectorAll('dialog').forEach(dialog => {
  dialog.addEventListener('click', (e) => {
    const dialogDimensions = dialog.getBoundingClientRect();
    if (
      e.clientX < dialogDimensions.left ||
      e.clientX > dialogDimensions.right ||
      e.clientY < dialogDimensions.top ||
      e.clientY > dialogDimensions.bottom
    ) {
      dialog.close();
    }
  });
});

const deleteForm = document.querySelector('#delete-form');
const currentUrl = window.location.pathname;

if (deleteForm) {
  deleteForm.action = `${currentUrl}/delete`;
}

function setupToggle(toggleId, checkboxClass) {
  const toggleAll = document.getElementById(toggleId);
  const checkboxes = document.querySelectorAll(checkboxClass);

  if (!toggleAll || checkboxes.length === 0) return;

  toggleAll.addEventListener('change', () => {
    checkboxes.forEach(cb => cb.checked = toggleAll.checked);
  });

  checkboxes.forEach(cb => {
    cb.addEventListener('change', () => {
      if (!cb.checked) toggleAll.checked = false;
    });
  });

}

const editGames = document.querySelector('.edit-games');
const editDevelopers = document.querySelector('.edit-game-developer');
const editGenres = document.querySelector('.edit-game-genre');

setupToggle('toggle-all-remove', '.game-checkbox-remove');
setupToggle('toggle-all-add', '.game-checkbox-add');
setupToggle('toggle-all-developers-remove', '.developer-checkbox-remove');
setupToggle('toggle-all-developers-add', '.developer-checkbox-add');
setupToggle('toggle-all-genres-remove', '.genre-checkbox-remove');
setupToggle('toggle-all-genres-add', '.genre-checkbox-add');