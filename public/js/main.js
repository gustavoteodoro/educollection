window.onload = function(e){ 
    var addUnit = document.querySelector('.addUnit');
    var addUnitForm = document.querySelector('.addUnitForm');

    addUnit.addEventListener('click', (e)=>{
        e.preventDefault();
        addUnitForm.classList.add('-active');
    })
}