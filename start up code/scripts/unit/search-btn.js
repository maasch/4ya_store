export function searchClicked(){
  document.querySelector('.js-search-btn')
    .addEventListener('click', ()=>{
      const userKeyword = document.querySelector('.user-search');
      const keyword = userKeyword.value;
      if(keyword){
      window.location.href = `index.html?search_query=${keyword}`
      }
  })

  document.querySelector('.user-search')
    .addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        const searchTerm = document.querySelector('.user-search').value;
        window.location.href = `index.html?search_query=${searchTerm}`;
      }
  });
}