document.addEventListener('DOMContentLoaded', function () {
    const addUnit = document.querySelector('.addUnit');
    const addUnitForm = document.querySelector('.addUnitForm');
    const callMobileMenu = document.getElementById('callMobileMenu');
    const mobileMenu = document.getElementById('mobileMenu');
    const closeMobileMenu = document.getElementById('closeMobileMenu');

    if(addUnit){
        addUnit.addEventListener('click', (e)=>{
            e.preventDefault();
            addUnitForm.classList.add('-active');
        })
    }

    const videoOrigin = document.getElementById('videoOrigin');

    if(videoOrigin) {
        
        const dynSpan = document.querySelectorAll('.dynSpan');
        const ytvmTitle = document.getElementById('ytvmTitle');
        const mp4Title = document.getElementById('mp4Title');
        const ytDescription = document.getElementById('ytDescription');
        const vmDescription = document.getElementById('vmDescription');
        const mp4Description = document.getElementById('mp4Description');
        const videoSource = document.getElementById('videoSource');

        videoOrigin.addEventListener("change", () => {
            dynSpan.forEach(item => item.classList.remove('-active'));
            const selected = videoOrigin.value;
            switch(selected) {
                case "yt":
                    ytvmTitle.classList.add('-active');
                    ytDescription.classList.add('-active');
                    break;
                case "vm":
                    ytvmTitle.classList.add('-active');
                    vmDescription.classList.add('-active');
                    break;
                default:
                    mp4Title.classList.add('-active');
                    mp4Description.classList.add('-active');
            }
            videoSource.classList.add('-active');
        });
    }

    if(callMobileMenu) {
        callMobileMenu.addEventListener("click", () => {
            mobileMenu.classList.add('-active');
        });
    }
    
    if(closeMobileMenu) {
        closeMobileMenu.addEventListener("click", () => {
            mobileMenu.classList.remove('-active'); 
        })
    }
});
