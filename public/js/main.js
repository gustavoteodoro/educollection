document.addEventListener('DOMContentLoaded', function () {
    var addUnit = document.querySelector('.addUnit');
    var addUnitForm = document.querySelector('.addUnitForm');

    if(addUnit){
        addUnit.addEventListener('click', (e)=>{
            e.preventDefault();
            addUnitForm.classList.add('-active');
        })
    }

    // var multiSlides = document.querySelector('.course-carousel-1');

    // lory(multiSlides, {
    //     infinite: 4,
    //     slidesToScroll: 4
    // });
});
